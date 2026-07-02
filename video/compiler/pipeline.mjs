import {existsSync} from "node:fs";
import path from "node:path";
import {
  artifactKeyForStage,
  cleanArtifacts,
  defaultArtifactDir,
  readArtifact,
  runCachedStage,
} from "./artifacts.mjs";
import {OpenAICompilerClient} from "./ai/openai-client.mjs";
import {CompilerLogger} from "./logger.mjs";
import {loadPrompt} from "./prompts.mjs";
import {MotionCanvasRenderer} from "./renderers/motion-canvas-renderer.mjs";
import {
  RemotionRenderer,
  renderRemotionMp4,
  writeRemotionGeneratedManifest,
} from "./renderers/remotion-renderer.mjs";
import {parseDocument} from "./stages/parser.mjs";
import {analyzeSemantics} from "./stages/semantic.mjs";
import {planStory} from "./stages/story.mjs";
import {directVisuals} from "./stages/visual.mjs";
import {planAssets} from "./stages/assets.mjs";
import {generateNarration} from "./stages/narration.mjs";
import {planAnimation} from "./stages/animation.mjs";
import {hashFile} from "./utils.mjs";

const stageIndex = {
  parse: 0,
  semantic: 1,
  story: 2,
  visual: 3,
  assets: 4,
  narration: 5,
  animation: 6,
  render: 7,
  compile: 7,
};

const promptVersion = (stageName) => {
  if (stageName === "parse") {
    return "parser-1.0.0";
  }
  if (stageName === "render") {
    return "renderer-adapter-1.0.0";
  }
  return loadPrompt(stageName).version;
};

const rendererFor = (rendererName) => {
  switch (rendererName) {
    case "motion-canvas":
      return new MotionCanvasRenderer();
    case "remotion":
      return new RemotionRenderer();
    default:
      throw new Error(`Unknown renderer: ${rendererName}`);
  }
};

export const targetIncludes = (targetStage, stageName) =>
  stageIndex[stageName] <= stageIndex[targetStage];

export const runPipeline = async ({
  sourcePath,
  targetStage = "compile",
  artifactDir,
  force = false,
  aiClient = new OpenAICompilerClient(),
  rendererName = "remotion",
  renderMp4 = false,
  silent = false,
} = {}) => {
  if (!sourcePath) {
    throw new Error("sourcePath is required");
  }
  if (!(targetStage in stageIndex)) {
    throw new Error(`Unknown target stage: ${targetStage}`);
  }

  const absoluteSourcePath = path.resolve(sourcePath);
  if (!existsSync(absoluteSourcePath)) {
    throw new Error(`Document not found: ${absoluteSourcePath}`);
  }

  const outputDir = artifactDir ? path.resolve(artifactDir) : defaultArtifactDir(absoluteSourcePath);
  const logger = new CompilerLogger({silent});
  const result = {artifactDir: outputDir};

  const parseResult = await logger.stage("parse", () =>
    runCachedStage({
      stageName: "parse",
      artifactName: "documentAst",
      artifactDir: outputDir,
      input: {sourcePath: absoluteSourcePath, sourceHash: hashFile(absoluteSourcePath)},
      promptVersion: promptVersion("parse"),
      force,
      build: () => parseDocument(absoluteSourcePath),
    }),
  );
  result.documentAst = parseResult.artifact;
  if (!targetIncludes(targetStage, "semantic")) {
    return result;
  }

  const semanticResult = await logger.stage("semantic", () =>
    runCachedStage({
      stageName: "semantic",
      artifactName: "semantic",
      artifactDir: outputDir,
      input: result.documentAst,
      promptVersion: promptVersion("semantic"),
      force,
      build: () => analyzeSemantics(result.documentAst, {aiClient}),
    }),
  );
  result.semantic = semanticResult.artifact;
  if (!targetIncludes(targetStage, "story")) {
    return result;
  }

  const storyResult = await logger.stage("story", () =>
    runCachedStage({
      stageName: "story",
      artifactName: "story",
      artifactDir: outputDir,
      input: result.semantic,
      promptVersion: promptVersion("story"),
      force,
      build: () => planStory(result.semantic, {aiClient}),
    }),
  );
  result.story = storyResult.artifact;
  if (!targetIncludes(targetStage, "visual")) {
    return result;
  }

  const visualResult = await logger.stage("visual", () =>
    runCachedStage({
      stageName: "visual",
      artifactName: "visual",
      artifactDir: outputDir,
      input: {storyPlan: result.story, semanticDocument: result.semantic},
      promptVersion: promptVersion("visual"),
      force,
      build: () =>
        directVisuals(
          {storyPlan: result.story, semanticDocument: result.semantic},
          {aiClient},
        ),
    }),
  );
  result.visual = visualResult.artifact;
  if (!targetIncludes(targetStage, "assets")) {
    return result;
  }

  const assetResult = await logger.stage("assets", () =>
    runCachedStage({
      stageName: "assets",
      artifactName: "assets",
      artifactDir: outputDir,
      input: {storyPlan: result.story, visualPlan: result.visual},
      promptVersion: promptVersion("assets"),
      force,
      build: () => planAssets({storyPlan: result.story, visualPlan: result.visual}, {aiClient}),
    }),
  );
  result.assets = assetResult.artifact;
  if (!targetIncludes(targetStage, "narration")) {
    return result;
  }

  const narrationResult = await logger.stage("narration", () =>
    runCachedStage({
      stageName: "narration",
      artifactName: "narration",
      artifactDir: outputDir,
      input: {storyPlan: result.story, semanticDocument: result.semantic},
      promptVersion: promptVersion("narration"),
      force,
      build: () =>
        generateNarration(
          {storyPlan: result.story, semanticDocument: result.semantic},
          {aiClient},
        ),
    }),
  );
  result.narration = narrationResult.artifact;
  if (!targetIncludes(targetStage, "animation")) {
    return result;
  }

  const animationResult = await logger.stage("animation", () =>
    runCachedStage({
      stageName: "animation",
      artifactName: "animation",
      artifactDir: outputDir,
      input: {
        storyPlan: result.story,
        visualPlan: result.visual,
        assetManifest: result.assets,
        narration: result.narration,
      },
      promptVersion: promptVersion("animation"),
      force,
      build: () =>
        planAnimation(
          {
            storyPlan: result.story,
            visualPlan: result.visual,
            assetManifest: result.assets,
            narration: result.narration,
          },
          {aiClient},
        ),
    }),
  );
  result.animation = animationResult.artifact;
  if (!targetIncludes(targetStage, "render")) {
    return result;
  }

  const renderer = rendererFor(rendererName);
  const rendererInputs = {
    storyPlan: result.story,
    visualPlan: result.visual,
    animationPlan: result.animation,
    narration: result.narration,
    assetManifest: result.assets,
  };
  const renderResult = await logger.stage("render", () =>
    runCachedStage({
      stageName: "render",
      artifactName: "render",
      artifactDir: outputDir,
      input: {rendererName, ...rendererInputs},
      promptVersion: `${promptVersion("render")}:${rendererName}`,
      force,
      build: () => renderer.render(rendererInputs, {artifactDir: outputDir, renderMp4: false}),
    }),
  );
  result.render = renderResult.artifact;

  if (rendererName === "remotion") {
    writeRemotionGeneratedManifest(result.render);
  }

  if (renderMp4) {
    if (rendererName !== "remotion") {
      throw new Error("MP4 rendering is currently wired for the Remotion renderer");
    }
    renderRemotionMp4();
  }

  logger.info(`Artifacts: ${outputDir}`);
  return result;
};

export const cleanPipelineArtifacts = ({sourcePath, artifactDir} = {}) => {
  const dir = artifactDir
    ? path.resolve(artifactDir)
    : sourcePath
      ? defaultArtifactDir(path.resolve(sourcePath))
      : null;

  if (!dir) {
    throw new Error("Provide --artifact-dir or a source path for clean");
  }
  cleanArtifacts(dir);
  return dir;
};

export const inspectArtifact = ({artifactDir, artifactName}) => {
  const normalized =
    artifactName === "parse" ? "documentAst" : artifactKeyForStage(artifactName);
  return readArtifact(path.resolve(artifactDir), normalized);
};
