#!/usr/bin/env node
import {existsSync, readdirSync, statSync} from "node:fs";
import path from "node:path";
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
  "assets",
  "narration",
  "animation",
  "render",
]);

const usage = `Documentation-to-Video Compiler

Usage:
  video compile docs.md [--force] [--renderer remotion|motion-canvas]
  video parse docs.md
  video semantic docs.md
  video story docs.md
  video visual docs.md
  video assets docs.md
  video narration docs.md
  video animation docs.md
  video render docs.md [--no-mp4]
  video inspect semantic [docs.md] [--artifact-dir path]
  video clean [docs.md] [--artifact-dir path]

Flags:
  --artifact-dir <path>   Override artifact output directory
  --renderer <name>      remotion (default) or motion-canvas
  --force                Ignore stage caches
  --no-ai                Use deterministic stage fallbacks
  --mp4                  Render MP4 after producing the Remotion manifest
  --no-mp4               Skip MP4 rendering for the render command
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

  if (!commandStages.has(command)) {
    throw new Error(`Unknown command: ${command}\n\n${usage}`);
  }

  if (!firstArg) {
    throw new Error(`${command} requires a document path`);
  }

  const aiClient = flags.noAi ? {enabled: false} : new OpenAICompilerClient();
  const renderMp4 = command === "render" ? flags.mp4 !== false : flags.mp4 === true;

  await runPipeline({
    sourcePath: firstArg,
    targetStage: command,
    artifactDir: flags.artifactDir,
    force: flags.force,
    aiClient,
    rendererName: flags.renderer,
    renderMp4,
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
