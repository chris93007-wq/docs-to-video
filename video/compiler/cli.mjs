#!/usr/bin/env node
import {existsSync, readdirSync, statSync} from "node:fs";
import path from "node:path";
import {createInterface} from "node:readline/promises";
import {fileURLToPath} from "node:url";
import {OpenAICompilerClient} from "./ai/openai-client.mjs";
import {artifactRoot} from "./utils.mjs";
import {cleanPipelineArtifacts, inspectArtifact, runPipeline} from "./pipeline.mjs";

const commandStages = new Set([
  "compile",
  "parse",
  "semantic",
  "story",
  "visual",
  "shots",
  "media",
  "media-mix",
  "assets",
  "narration",
  "animation",
  "edl",
  "render",
]);

const usage = `Documentation-to-Video Compiler

Usage:
  video compile docs.md [--force] [--renderer remotion|motion-canvas]
  video parse docs.md
  video semantic docs.md
  video story docs.md
  video visual docs.md
  video shots docs.md
  video media docs.md
  video assets docs.md
  video narration docs.md
  video animation docs.md
  video edl docs.md
  video render docs.md [--no-mp4]
  video validate-experience docs.md
  video inspect semantic|shots|media|edl [docs.md] [--artifact-dir path]
  video clean [docs.md] [--artifact-dir path]

Flags:
  --artifact-dir <path>   Override artifact output directory
  --renderer <name>      remotion (default) or motion-canvas
  --force                Ignore stage caches
  --no-ai                Use deterministic stage fallbacks
  --mp4                  Render MP4 after producing the Remotion manifest
  --no-mp4               Skip MP4 rendering for the render command
  --title <text>         Title used for versioned MP4 filenames
  --version <tag>        Version tag for the MP4 filename, such as v002
  --output <path>        Explicit MP4 output path
  --showcase <name>      Curated showcase renderer, such as sdd-orchestrator; use none to force generic
  --silent               Suppress compiler logs
`;

const parseArgs = (argv) => {
  const flags = {
    renderer: "remotion",
    force: false,
    noAi: false,
    mp4: undefined,
    silent: false,
  };
  const positional = [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    switch (arg) {
      case "--artifact-dir":
        flags.artifactDir = argv[++index];
        break;
      case "--renderer":
        flags.renderer = argv[++index];
        break;
      case "--force":
        flags.force = true;
        break;
      case "--no-ai":
        flags.noAi = true;
        break;
      case "--mp4":
        flags.mp4 = true;
        break;
      case "--no-mp4":
        flags.mp4 = false;
        break;
      case "--title":
        flags.title = argv[++index];
        break;
      case "--version":
        flags.version = argv[++index];
        break;
      case "--output":
        flags.output = argv[++index];
        break;
      case "--showcase":
      case "--template":
        flags.showcase = argv[++index];
        break;
      case "--silent":
        flags.silent = true;
        break;
      case "-h":
      case "--help":
        flags.help = true;
        break;
      default:
        positional.push(arg);
    }
  }

  return {flags, positional};
};

const latestArtifactDir = () => {
  if (!existsSync(artifactRoot)) {
    return undefined;
  }

  const candidates = readdirSync(artifactRoot, {withFileTypes: true})
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const fullPath = path.join(artifactRoot, entry.name);
      return {fullPath, mtimeMs: statSync(fullPath).mtimeMs};
    })
    .sort((a, b) => b.mtimeMs - a.mtimeMs);

  return candidates[0]?.fullPath;
};

const titleFromSourcePath = (sourcePath) => {
  const baseName = path.basename(sourcePath, path.extname(sourcePath));
  return baseName
    .split(/[-_]+/g)
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ") || "Documentation Video";
};

const promptForRenderTitle = async (sourcePath) => {
  const suggestedTitle = titleFromSourcePath(sourcePath);
  const rl = createInterface({input: process.stdin, output: process.stdout});
  try {
    const answer = await rl.question(`Video title for versioned output [${suggestedTitle}]: `);
    return answer.trim() || suggestedTitle;
  } finally {
    rl.close();
  }
};

export const main = async (argv = process.argv.slice(2)) => {
  const {flags, positional} = parseArgs(argv);
  const [command, firstArg, secondArg] = positional;

  if (flags.help || !command) {
    process.stdout.write(usage);
    return;
  }

  if (command === "inspect") {
    const artifactName = firstArg;
    if (!artifactName) {
      throw new Error("inspect requires an artifact name, such as semantic or visual");
    }
    const {defaultArtifactDir} = await import("./artifacts.mjs");
    const dir = flags.artifactDir
      ? path.resolve(flags.artifactDir)
      : secondArg
        ? defaultArtifactDir(path.resolve(secondArg))
        : latestArtifactDir();

    if (!dir) {
      throw new Error("No artifact directory found. Pass docs.md or --artifact-dir.");
    }

    process.stdout.write(`${JSON.stringify(inspectArtifact({artifactDir: dir, artifactName}), null, 2)}\n`);
    return;
  }

  if (command === "clean") {
    const dir = cleanPipelineArtifacts({
      sourcePath: firstArg,
      artifactDir: flags.artifactDir,
    });
    process.stdout.write(`Cleaned ${dir}\n`);
    return;
  }

  if (command === "validate-experience") {
    if (!firstArg) {
      throw new Error("validate-experience requires a document path");
    }
    const aiClient = flags.noAi ? {enabled: false} : new OpenAICompilerClient();
    const result = await runPipeline({
      sourcePath: firstArg,
      targetStage: "validate-experience",
      artifactDir: flags.artifactDir,
      force: flags.force,
      aiClient,
      rendererName: flags.renderer,
      renderMp4: false,
      silent: flags.silent,
    });
    process.stdout.write(`${JSON.stringify(result.experience, null, 2)}\n`);
    return;
  }

  if (!commandStages.has(command)) {
    throw new Error(`Unknown command: ${command}\n\n${usage}`);
  }

  if (!firstArg) {
    throw new Error(`${command} requires a document path`);
  }

  const aiClient = flags.noAi ? {enabled: false} : new OpenAICompilerClient();
  const renderMp4 = command === "render" ? flags.mp4 !== false : flags.mp4 === true;
  const title = renderMp4 && !flags.title && !flags.output && process.stdin.isTTY && process.stdout.isTTY
    ? await promptForRenderTitle(firstArg)
    : flags.title;

  await runPipeline({
    sourcePath: firstArg,
    targetStage: command,
    artifactDir: flags.artifactDir,
    force: flags.force,
    aiClient,
    rendererName: flags.renderer,
    renderMp4,
    renderOptions: {
      title,
      version: flags.version,
      outputPath: flags.output,
      ...(flags.showcase !== undefined ? {showcase: flags.showcase} : {}),
    },
    silent: flags.silent,
  });
};

const isDirectExecution = process.argv[1] === fileURLToPath(import.meta.url);
if (isDirectExecution) {
  main().catch((error) => {
    process.stderr.write(`${error.stack ?? error.message}\n`);
    process.exit(1);
  });
}
