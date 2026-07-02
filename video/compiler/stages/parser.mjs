import {readFileSync} from "node:fs";
import path from "node:path";
import {hashFile, slugify, wordCount} from "../utils.mjs";

const diagramLanguages = new Set(["mermaid", "plantuml", "dot", "graphviz"]);

const detectFormat = (filePath, source) => {
  const extension = path.extname(filePath).toLowerCase();
  if ([".html", ".htm"].includes(extension) || /^\s*</.test(source)) {
    return "html";
  }
  if (path.basename(filePath).toLowerCase() === "readme") {
    return "readme";
  }
  if (extension === ".rfc") {
    return "rfc";
  }
  return "markdown";
};

const htmlToMarkdownish = (html) =>
  html
    .replace(/<img[^>]*alt=["']?([^"'>]*)["']?[^>]*src=["']?([^"'>\s]+)["']?[^>]*>/gi, "\n![$1]($2)\n")
    .replace(/<a[^>]*href=["']?([^"'>\s]+)["']?[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)")
    .replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, level, text) => `\n${"#".repeat(Number(level))} ${stripHtml(text)}\n`)
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, text) => `\n- ${stripHtml(text)}\n`)
    .replace(/<\/?(p|div|section|article|br)[^>]*>/gi, "\n")
    .replace(/<\/?(ul|ol)[^>]*>/gi, "\n");

const stripHtml = (value) =>
  String(value)
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .trim();

const isBlank = (line) => /^\s*$/.test(line);
const isHeading = (line) => /^(#{1,6})\s+(.+)$/.test(line);
const isList = (line) => /^\s*(?:[-*+]\s+|\d+\.\s+)/.test(line);
const isTableStart = (lines, index) =>
  /\|/.test(lines[index] ?? "") && /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(lines[index + 1] ?? "");
const isFence = (line) => /^```/.test(line.trim());

const parseTableRow = (line) =>
  line
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((cell) => cell.trim());

const extractLinks = (text) => {
  const links = [];
  const regex = /(?<!!)\[([^\]]+)\]\(([^)]+)\)/g;
  for (const match of text.matchAll(regex)) {
    links.push({text: match[1], href: match[2]});
  }
  return links;
};

const extractImage = (line) => {
  const match = line.match(/!\[([^\]]*)\]\(([^)]+)\)/);
  return match ? {alt: match[1], src: match[2]} : null;
};

export const parseDocument = (filePath) => {
  const originalSource = readFileSync(filePath, "utf8");
  const format = detectFormat(filePath, originalSource);
  const source = format === "html" ? htmlToMarkdownish(originalSource) : originalSource;
  const lines = source.split(/\r?\n/);
  const sections = [];
  const links = [];
  const images = [];
  const tables = [];
  const diagrams = [];
  const usedIds = new Map();

  const uniqueId = (base, fallback) => {
    const slug = slugify(base, fallback);
    const count = usedIds.get(slug) ?? 0;
    usedIds.set(slug, count + 1);
    return count === 0 ? slug : `${slug}-${count + 1}`;
  };

  const createSection = (heading, level = 1) => {
    const section = {
      id: uniqueId(heading, "section"),
      level,
      heading,
      blocks: [],
    };
    sections.push(section);
    return section;
  };

  let currentSection = createSection("Document", 0);
  let title = "";
  let index = 0;
  let blockCount = 0;
  const nextBlockId = (type) => `${currentSection.id}-${type}-${++blockCount}`;

  const pushBlock = (block) => {
    currentSection.blocks.push(block);
    if (block.type === "table") {
      tables.push({...block, sectionId: currentSection.id});
    }
    if (block.type === "diagram") {
      diagrams.push({...block, sectionId: currentSection.id});
    }
    if (block.type === "image") {
      images.push({alt: block.alt, src: block.src, sectionId: currentSection.id});
    }
    for (const link of extractLinks(block.text ?? "")) {
      links.push({...link, sectionId: currentSection.id});
    }
  };

  while (index < lines.length) {
    const line = lines[index];

    if (isBlank(line)) {
      index += 1;
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const heading = headingMatch[2].trim();
      currentSection = createSection(heading, level);
      if (!title && level === 1) {
        title = heading;
      }
      index += 1;
      continue;
    }

    if (isFence(line)) {
      const language = line.trim().replace(/^```/, "").trim();
      const code = [];
      index += 1;
      while (index < lines.length && !isFence(lines[index])) {
        code.push(lines[index]);
        index += 1;
      }
      index += 1;
      pushBlock({
        id: nextBlockId(diagramLanguages.has(language) ? "diagram" : "code"),
        type: diagramLanguages.has(language) ? "diagram" : "code",
        language,
        text: code.join("\n"),
      });
      continue;
    }

    if (isTableStart(lines, index)) {
      const headers = parseTableRow(lines[index]);
      index += 2;
      const rows = [];
      while (index < lines.length && /\|/.test(lines[index]) && !isBlank(lines[index])) {
        rows.push(parseTableRow(lines[index]));
        index += 1;
      }
      pushBlock({
        id: nextBlockId("table"),
        type: "table",
        headers,
        rows,
        text: [headers.join(" | "), ...rows.map((row) => row.join(" | "))].join("\n"),
      });
      continue;
    }

    if (isList(line)) {
      const ordered = /^\s*\d+\.\s+/.test(line);
      const items = [];
      while (index < lines.length && isList(lines[index])) {
        items.push(lines[index].replace(/^\s*(?:[-*+]\s+|\d+\.\s+)/, "").trim());
        index += 1;
      }
      pushBlock({
        id: nextBlockId("list"),
        type: "list",
        ordered,
        items,
        text: items.join(" "),
      });
      continue;
    }

    if (/^\s*>/.test(line)) {
      const quote = [];
      while (index < lines.length && /^\s*>/.test(lines[index])) {
        quote.push(lines[index].replace(/^\s*>\s?/, ""));
        index += 1;
      }
      pushBlock({
        id: nextBlockId("quote"),
        type: "quote",
        text: quote.join(" "),
      });
      continue;
    }

    const image = extractImage(line);
    if (image) {
      pushBlock({
        id: nextBlockId("image"),
        type: "image",
        alt: image.alt,
        src: image.src,
        text: image.alt,
      });
      index += 1;
      continue;
    }

    const paragraph = [];
    while (
      index < lines.length &&
      !isBlank(lines[index]) &&
      !isHeading(lines[index]) &&
      !isFence(lines[index]) &&
      !isList(lines[index]) &&
      !isTableStart(lines, index)
    ) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    pushBlock({
      id: nextBlockId("paragraph"),
      type: "paragraph",
      text: paragraph.join(" "),
    });
  }

  if (!title) {
    const firstNamedSection = sections.find((section) => section.level > 0);
    title = firstNamedSection?.heading ?? path.basename(filePath);
  }

  return {
    kind: "DocumentAST",
    version: "1.0.0",
    source: {
      path: filePath,
      format,
      hash: hashFile(filePath),
    },
    metadata: {
      title,
      wordCount: wordCount(stripHtml(originalSource)),
      createdAt: new Date().toISOString(),
    },
    sections,
    links,
    images,
    tables,
    diagrams,
  };
};
