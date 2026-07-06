import {execFileSync} from "node:child_process";
import {existsSync} from "node:fs";
import path from "node:path";
import {artifactPath, ensureDir, readJson, writeJson} from "../artifacts.mjs";
import {projectRoot, slugify} from "../utils.mjs";
import {RendererAdapter} from "./renderer-adapter.mjs";
import {buildRenderManifest} from "./render-manifest.mjs";

export const generatedManifestPath = path.join(
  projectRoot,
  "src",
  "compiler",
  "generated",
  "render-manifest.json",
);

export const writeRemotionGeneratedManifest = (manifest) => {
  writeJson(generatedManifestPath, manifest);
};

export const renderOutputDir = path.join(projectRoot, "out");
export const renderVersionHistoryPath = path.join(renderOutputDir, "render-versions.json");

const remotionBin = path.join(
  projectRoot,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "remotion.cmd" : "remotion",
);

const titleFromSourcePath = (sourcePath) => {
  if (!sourcePath) {
    return "Documentation Video";
  }
  const baseName = path.basename(sourcePath, path.extname(sourcePath));
  return baseName
    .split(/[-_]+/g)
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ") || "Documentation Video";
};

const normalizeVersion = (version) => {
  if (!version) {
    return undefined;
  }
  return slugify(version, "v001");
};

export const readRenderVersionHistory = () => {
  if (!existsSync(renderVersionHistoryPath)) {
    return {kind: "RenderVersionHistory", version: "1.0.0", renders: []};
  }

  const history = readJson(renderVersionHistoryPath);
  return {
    kind: history.kind ?? "RenderVersionHistory",
    version: history.version ?? "1.0.0",
    renders: Array.isArray(history.renders) ? history.renders : [],
  };
};

const nextVersionForSlug = (slug, history) => {
  const maxVersion = history.renders
    .filter((entry) => entry.slug === slug)
    .map((entry) => /^v(\d+)$/.exec(entry.version ?? "")?.[1])
    .filter(Boolean)
    .map((value) => Number.parseInt(value, 10))
    .filter(Number.isFinite)
    .reduce((max, value) => Math.max(max, value), 0);

  return `v${String(maxVersion + 1).padStart(3, "0")}`;
};

export const resolveRenderOutput = ({
  title,
  version,
  outputPath,
  sourcePath,
  history = readRenderVersionHistory(),
} = {}) => {
  const resolvedTitle = String(title ?? "").trim() || titleFromSourcePath(sourcePath);
  const slug = slugify(resolvedTitle, "documentation-video");
  const versionTag = normalizeVersion(version) ?? nextVersionForSlug(slug, history);
  const resolvedOutputPath = outputPath
    ? path.resolve(projectRoot, outputPath)
    : path.join(renderOutputDir, `${slug}-${versionTag}.mp4`);

  return {
    title: resolvedTitle,
    slug,
    version: versionTag,
    outputPath: resolvedOutputPath,
  };
};

const recordRenderVersion = ({renderOutput, sourcePath, manifest}) => {
  const history = readRenderVersionHistory();
  const entry = {
    title: renderOutput.title,
    slug: renderOutput.slug,
    version: renderOutput.version,
    file: renderOutput.outputPath,
    source: sourcePath ? path.resolve(sourcePath) : undefined,
    sourceHash: manifest?.sourceHash,
    renderedAt: new Date().toISOString(),
  };

  writeJson(renderVersionHistoryPath, {
    kind: "RenderVersionHistory",
    version: "1.0.0",
    renders: [...history.renders, entry],
  });

  return entry;
};

export const renderRemotionMp4 = ({title, version, outputPath, sourcePath, manifest} = {}) => {
  const renderOutput = resolveRenderOutput({title, version, outputPath, sourcePath});
  ensureDir(path.dirname(renderOutput.outputPath));

  execFileSync("node", ["scripts/prepare-audio.mjs"], {
    cwd: projectRoot,
    stdio: "inherit",
    env: {
      ...process.env,
      DOC_VIDEO_NARRATION: "compiler",
    },
  });

  execFileSync(remotionBin, [
    "render",
    "src/index.ts",
    "DocumentationCompilerVideo",
    renderOutput.outputPath,
    "--codec=h264",
    "--pixel-format=yuv420p",
  ], {
    cwd: projectRoot,
    stdio: "inherit",
    env: {
      ...process.env,
      DOC_VIDEO_NARRATION: "compiler",
    },
  });

  return recordRenderVersion({renderOutput, sourcePath, manifest});
};

export class RemotionRenderer extends RendererAdapter {
  constructor() {
    super("remotion");
  }

  async render(inputs, {artifactDir, renderMp4 = false, writeGenerated = true, renderOptions = {}} = {}) {
    const manifest = buildRenderManifest({
      renderer: this.name,
      ...inputs,
    });

    if (artifactDir) {
      writeJson(artifactPath(artifactDir, "render"), manifest);
    }

    if (writeGenerated) {
      writeRemotionGeneratedManifest(manifest);
    }

    if (renderMp4) {
      renderRemotionMp4({...renderOptions, manifest});
    }

    return manifest;
  }
}
