import {existsSync} from "node:fs";
import path from "node:path";
import {
  artifactPath,
  artifactKeyForStage,
  cleanArtifacts,
  defaultArtifactDir,
  readArtifact,
  runCachedStage,
  writeJson,
} from "./artifacts.mjs";
import {OpenAICompilerClient} from "./ai/openai-client.mjs";
import {goldenExperienceProfile} from "./experience/goldenExperienceProfile.mjs";
import {validateExperience} from "./experience/validateExperience.mjs";
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
import {planShots} from "./stages/shots.mjs";
import {planMediaMix} from "./stages/media-mix.mjs";
import {planAssets} from "./stages/assets.mjs";
import {generateNarration} from "./stages/narration.mjs";
import {planAnimation} from "./stages/animation.mjs";
import {planEditDecisionList} from "./stages/edl.mjs";
import {hashFile} from "./utils.mjs";

const stageIndex = {
  parse: 0,
  semantic: 1,
  story: 2,
  visual: 3,
  shots: 4,
  media: 5,
  "media-mix": 5,
  assets: 6,
  narration: 7,
  animation: 8,
  edl: 9,
  edit: 9,
  "validate-experience": 9,
  render: 10,
  compile: 10,
};

const normalizeStageName = (stageName) => {
  if (stageName === "media-mix") {
    return "media";
  }
  if (stageName === "edit") {
    return "edl";
  }
  return stageName;
};

const promptVersion = (stageName) => {
  const normalized = normalizeStageName(stageName);
  if (stageName === "parse") {
    return "parser-1.0.0";
  }
  if (stageName === "render") {
    return "renderer-adapter-1.0.0";
  }
  return loadPrompt(normalized).version;
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

const normalizeShowcase = (showcase) => {
  const normalized = String(showcase ?? "").trim().toLowerCase();
  if (!normalized || normalized === "none" || normalized === "generic") {
    return undefined;
  }
  return normalized;
};

const inferShowcase = ({sourcePath, semanticDocument} = {}) => {
  const haystack = [
    sourcePath,
    semanticDocument?.title,
    ...(semanticDocument?.concepts ?? []).map((concept) => concept.name),
    ...(semanticDocument?.keyMessages ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes("sdd orchestrator") ? "sdd-orchestrator" : undefined;
};

export const targetIncludes = (targetStage, stageName) =>
  stageIndex[normalizeStageName(stageName)] <= stageIndex[normalizeStageName(targetStage)];

export const runPipeline = async ({
  sourcePath,
  targetStage = "compile",
  artifactDir,
  force = false,
  aiClient = new OpenAICompilerClient(),
  rendererName = "remotion",
  renderMp4 = false,
  renderOptions = {},
  silent = false,
} = {}) => {
  if (!sourcePath) {
    throw new Error("sourcePath is required");
  }
  const normalizedTargetStage = normalizeStageName(targetStage);
  if (!(normalizedTargetStage in stageIndex)) {
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
      input: {semanticDocument: result.semantic, experienceProfile: goldenExperienceProfile},
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
      input: {
        storyPlan: result.story,
        semanticDocument: result.semantic,
        experienceProfile: goldenExperienceProfile,
      },
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
  if (!targetIncludes(normalizedTargetStage, "shots")) {
    return result;
  }

  const shotResult = await logger.stage("shots", () =>
    runCachedStage({
      stageName: "shots",
      artifactName: "shots",
      artifactDir: outputDir,
      input: {
        semanticDocument: result.semantic,
        storyPlan: result.story,
        visualPlan: result.visual,
        experienceProfile: goldenExperienceProfile,
      },
      promptVersion: promptVersion("shots"),
      force,
      build: () =>
        planShots(
          {
            semanticDocument: result.semantic,
            storyPlan: result.story,
            visualPlan: result.visual,
          },
          {aiClient},
        ),
    }),
  );
  result.shots = shotResult.artifact;
  if (!targetIncludes(normalizedTargetStage, "media")) {
    return result;
  }

  const mediaResult = await logger.stage("media", () =>
    runCachedStage({
      stageName: "media",
      artifactName: "mediaMix",
      artifactDir: outputDir,
      input: {
        semanticDocument: result.semantic,
        storyPlan: result.story,
        visualPlan: result.visual,
        shotPlan: result.shots,
        experienceProfile: goldenExperienceProfile,
      },
      promptVersion: promptVersion("media"),
      force,
      build: () =>
        planMediaMix(
          {
            semanticDocument: result.semantic,
            storyPlan: result.story,
            visualPlan: result.visual,
            shotPlan: result.shots,
          },
          {aiClient},
        ),
    }),
  );
  result.mediaMix = mediaResult.artifact;
  if (!targetIncludes(normalizedTargetStage, "assets")) {
    return result;
  }

  const assetResult = await logger.stage("assets", () =>
    runCachedStage({
      stageName: "assets",
      artifactName: "assets",
      artifactDir: outputDir,
      input: {
        semanticDocument: result.semantic,
        storyPlan: result.story,
        visualPlan: result.visual,
        shotPlan: result.shots,
        mediaMixPlan: result.mediaMix,
      },
      promptVersion: promptVersion("assets"),
      force,
      build: () =>
        planAssets(
          {
            semanticDocument: result.semantic,
            storyPlan: result.story,
            visualPlan: result.visual,
            shotPlan: result.shots,
            mediaMixPlan: result.mediaMix,
          },
          {aiClient},
        ),
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
      input: {
        storyPlan: result.story,
        semanticDocument: result.semantic,
        experienceProfile: goldenExperienceProfile,
      },
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
        shotPlan: result.shots,
        mediaMixPlan: result.mediaMix,
        assetManifest: result.assets,
        narration: result.narration,
        experienceProfile: goldenExperienceProfile,
      },
      promptVersion: promptVersion("animation"),
      force,
      build: () =>
        planAnimation(
          {
            storyPlan: result.story,
            visualPlan: result.visual,
            shotPlan: result.shots,
            mediaMixPlan: result.mediaMix,
            assetManifest: result.assets,
            narration: result.narration,
          },
          {aiClient},
        ),
    }),
  );
  result.animation = animationResult.artifact;
  if (!targetIncludes(normalizedTargetStage, "edl")) {
    logger.info(`Artifacts: ${outputDir}`);
    return result;
  }

  const editResult = await logger.stage("edl", () =>
    runCachedStage({
      stageName: "edl",
      artifactName: "edit",
      artifactDir: outputDir,
      input: {
        storyPlan: result.story,
        shotPlan: result.shots,
        mediaMixPlan: result.mediaMix,
        animationPlan: result.animation,
        narration: result.narration,
      },
      promptVersion: promptVersion("edl"),
      force,
      build: () =>
        planEditDecisionList({
          storyPlan: result.story,
          shotPlan: result.shots,
          mediaMixPlan: result.mediaMix,
          animationPlan: result.animation,
          narration: result.narration,
        }),
    }),
  );
  result.edit = editResult.artifact;

  result.experience = validateExperience({
    storyPlan: result.story,
    visualPlan: result.visual,
    shotPlan: result.shots,
    mediaMixPlan: result.mediaMix,
    animationPlan: result.animation,
    editDecisionList: result.edit,
    narration: result.narration,
    documentAst: result.documentAst,
    profile: goldenExperienceProfile,
  });
  writeJson(artifactPath(outputDir, "experience"), result.experience);
  if (!result.experience.passed) {
    throw new Error(`Experience validation failed:\n${result.experience.errors.join("\n")}`);
  }

  if (!targetIncludes(targetStage, "render")) {
    logger.info(`Artifacts: ${outputDir}`);
    return result;
  }

  const renderer = rendererFor(rendererName);
  const showcase = Object.hasOwn(renderOptions, "showcase")
    ? normalizeShowcase(renderOptions.showcase)
    : inferShowcase({sourcePath: absoluteSourcePath, semanticDocument: result.semantic});
  const rendererInputs = {
    ...(showcase ? {showcase} : {}),
    storyPlan: result.story,
    visualPlan: result.visual,
    shotPlan: result.shots,
    mediaMixPlan: result.mediaMix,
    animationPlan: result.animation,
    editDecisionList: result.edit,
    narration: result.narration,
    assetManifest: result.assets,
  };
  const renderResult = await logger.stage("render", () =>
    runCachedStage({
      stageName: "render",
      artifactName: "render",
      artifactDir: outputDir,
      input: {rendererName, showcase, ...rendererInputs},
      promptVersion: `${promptVersion("render")}:${rendererName}:${showcase ?? "generic"}`,
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
    result.output = renderRemotionMp4({
      ...renderOptions,
      sourcePath: absoluteSourcePath,
      manifest: result.render,
    });
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
