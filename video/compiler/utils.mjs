import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const projectRoot = path.resolve(__dirname, "..");
export const artifactRoot = path.join(projectRoot, "artifacts");

export const stableStringify = (value) => {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }

  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
};

export const hashValue = (value) =>
  createHash("sha256").update(stableStringify(value)).digest("hex");

export const hashText = (value) =>
  createHash("sha256").update(value).digest("hex");

export const hashFile = (filePath) =>
  createHash("sha256").update(readFileSync(filePath)).digest("hex");

export const slugify = (value, fallback = "document") => {
  const slug = String(value)
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);

  return slug || fallback;
};

export const sentenceCase = (value) => {
  const text = String(value ?? "").trim();
  if (!text) {
    return "";
  }
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
};

export const firstSentence = (value) => {
  const match = String(value ?? "").trim().match(/^(.+?[.!?])(\s|$)/);
  return match ? match[1].trim() : String(value ?? "").trim();
};

export const unique = (values) => [...new Set(values.filter(Boolean))];

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const wordCount = (value) =>
  String(value ?? "")
    .split(/\s+/)
    .filter(Boolean).length;

export const compactText = (value) =>
  String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
