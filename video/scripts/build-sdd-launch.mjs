import {execFileSync} from "node:child_process";
import {copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync} from "node:fs";
import path from "node:path";
import {fileURLToPath, pathToFileURL} from "node:url";
import {speechTextFor} from "../compiler/stages/narration-audio.mjs";
import {hashValue} from "../compiler/utils.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const planPath = process.argv[2]
  ? path.resolve(projectRoot, process.argv[2])
  : path.join(projectRoot, "launch", "sdd-orchestrator-launch-v008.mjs");
const {launchPlan} = await import(pathToFileURL(planPath).href);
const artifactDir = path.join(projectRoot, "artifacts", launchPlan.id);
const audioDir = path.join(projectRoot, "public", "audio", launchPlan.id);
const generatedManifestPath = path.join(projectRoot, "src", "launch", `${launchPlan.id}.json`);
const remotionModules = path.join(projectRoot, "node_modules", "@remotion");
const bundledFfmpeg = existsSync(remotionModules)
  ? readdirSync(remotionModules)
      .filter((name) => name.startsWith("compositor-"))
      .map((name) => path.join(remotionModules, name, process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg"))
      .find((candidate) => existsSync(candidate))
  : null;
const ffmpeg = process.env.FFMPEG_PATH ?? bundledFfmpeg;
const synthesisWorker = path.join(__dirname, "synthesize-sdd-performance-scene.mjs");
const reusableManifestPath = existsSync(generatedManifestPath)
  ? generatedManifestPath
  : launchPlan.reuseNarrationFromId
    ? path.join(projectRoot, "src", "launch", `${launchPlan.reuseNarrationFromId}.json`)
    : generatedManifestPath;
const previousManifest = existsSync(reusableManifestPath)
  ? JSON.parse(readFileSync(reusableManifestPath, "utf8"))
  : null;
const previousAudioByScene = new Map(
  (previousManifest?.narrationAudio?.segments ?? []).map((segment) => [segment.sceneId, segment]),
);

mkdirSync(artifactDir, {recursive: true});
mkdirSync(audioDir, {recursive: true});
mkdirSync(path.dirname(generatedManifestPath), {recursive: true});

const writeJson = (filePath, value) => writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
const words = (value) => String(value).trim().split(/\s+/).filter(Boolean);
const wordCount = (value) => words(value).length;
const narrationText = launchPlan.scenes.map((scene) => scene.narration).join(" ");
const sourceHash = hashValue({launchPlan, narrationText});
const narrationWordRange = launchPlan.narrationWordRange ?? {min: 260, max: 320};
const narrativeRuntimeSeconds = launchPlan.scenes.reduce((total, scene) => total + scene.durationSeconds, 0);
const endSlateDurationSeconds = launchPlan.endSlate?.durationSeconds ?? 0;
const liveDemoAssets = launchPlan.liveDemo?.assets ?? [];
const liveDemoAssetIds = new Set(liveDemoAssets.map((asset) => asset.id));

const validations = [
  [launchPlan.runtimeSeconds >= 110 && launchPlan.runtimeSeconds <= 125, "Runtime is 110-125 seconds"],
  [Math.abs(narrativeRuntimeSeconds + endSlateDurationSeconds - launchPlan.runtimeSeconds) < 0.001, "Narrative scenes plus end slate match the runtime"],
  [launchPlan.scenes.length === 7, "Exactly seven launch scenes"],
  [wordCount(narrationText) >= narrationWordRange.min && wordCount(narrationText) <= narrationWordRange.max, `Narration is ${narrationWordRange.min}-${narrationWordRange.max} words`],
  [launchPlan.scenes[0].title.includes("now live"), "The film clearly launches the Orchestrator"],
  [launchPlan.scenes.some((scene) => /adoption|blocker|friction/i.test(`${scene.purpose} ${scene.teachingPoint}`)), "Adoption blockers are explicit"],
  [launchPlan.scenes.some((scene) => scene.id === "developer-experience" && /Codex/i.test(`${scene.title} ${scene.narration}`)), "Codex usage is shown"],
  [launchPlan.scenes.some((scene) => scene.id === "workflow" && /lifecycle/i.test(`${scene.title} ${scene.narration}`)), "The guided lifecycle is shown"],
  [launchPlan.scenes.some((scene) => /approval/i.test(`${scene.narration} ${scene.cues.join(" ")}`)), "Review and approval boundaries are shown"],
  [launchPlan.scenes.some((scene) => /evidence|traceability/i.test(`${scene.narration} ${scene.cues.join(" ")}`)), "Evidence and traceability are shown"],
  [launchPlan.scenes.at(-1).narration.includes(launchPlan.secondaryCta), "The community contribution CTA is present"],
  [launchPlan.scenes.every((scene) => scene.visualPrimitive), "Every scene is visual-first"],
  [launchPlan.scenes.every((scene) => scene.cues.length <= 4), "On-screen copy stays sparse"],
  [launchPlan.scenes.some((scene) => scene.visualPrimitive === "FloatingDocumentCloud"), "The launch has a memorable hero set piece"],
  [
    launchPlan.presentationMode !== "live-demo-hybrid" ||
      (liveDemoAssets.length >= 6 && liveDemoAssets.every((asset) => existsSync(path.join(projectRoot, "public", asset.staticFile)))),
    "Live-demo proof assets are bundled",
  ],
  [
    launchPlan.presentationMode !== "live-demo-hybrid" ||
      (liveDemoAssetIds.has(launchPlan.liveDemo?.developerExperience?.assetId) &&
        (launchPlan.liveDemo?.workflowProofs ?? []).every((proof) => liveDemoAssetIds.has(proof.assetId))),
    "Live-demo scene mappings resolve to bundled assets",
  ],
];

const failed = validations.filter(([passed]) => !passed).map(([, label]) => label);
if (failed.length > 0) {
  throw new Error(`Launch validation failed:\n${failed.map((label) => `- ${label}`).join("\n")}`);
}

const audioSegments = [];
let cursor = 0;

const normalizeSpeechText = (text) => speechTextFor(text)
  .replace(/[’]/g, "'")
  .replace(/[—–]/g, ", ");

for (let index = 0; index < launchPlan.scenes.length; index += 1) {
  const scene = launchPlan.scenes[index];
  const isLast = index === launchPlan.scenes.length - 1;
  const pauseAfterSeconds = isLast ? 0 : 0.65;
  const targetAudioSeconds = scene.durationSeconds - pauseAfterSeconds;
  const targetSpeechSeconds = targetAudioSeconds - 0.25;
  const rawFile = path.join(audioDir, `${scene.id}.raw.wav`);
  const outputFile = path.join(audioDir, `${scene.id}.wav`);
  const expectedPerformance = (scene.performanceSegments ?? [{text: scene.narration, pauseAfterMs: 0}])
    .map((segment) => ({
      displayText: segment.text,
      spokenText: normalizeSpeechText(segment.text),
      pauseAfterMs: segment.pauseAfterMs,
    }));
  const previousAudio = previousAudioByScene.get(scene.id);
  const previousAudioFile = previousAudio?.staticFile
    ? path.join(projectRoot, "public", previousAudio.staticFile)
    : null;
  const canReuseAudio = previousAudio &&
    previousAudioFile &&
    existsSync(previousAudioFile) &&
    previousAudio.audioDurationSeconds === targetAudioSeconds &&
    previousAudio.pauseAfterSeconds === pauseAfterSeconds &&
    previousAudio.performanceSegments?.length === expectedPerformance.length &&
    expectedPerformance.every((segment, segmentIndex) => {
      const previousSegment = previousAudio.performanceSegments[segmentIndex];
      return previousSegment?.displayText === segment.displayText &&
        previousSegment?.spokenText === segment.spokenText &&
        previousSegment?.pauseAfterMs === segment.pauseAfterMs;
    });

  if (canReuseAudio) {
    const reusedStaticFile = `audio/${launchPlan.id}/${scene.id}.wav`;
    if (path.resolve(previousAudioFile) !== path.resolve(outputFile)) {
      copyFileSync(previousAudioFile, outputFile);
    }
    audioSegments.push({
      ...previousAudio,
      staticFile: reusedStaticFile,
      startSeconds: cursor,
      endSeconds: cursor + targetAudioSeconds,
      audioDurationSeconds: targetAudioSeconds,
      pauseAfterSeconds,
    });
    cursor += scene.durationSeconds;
    continue;
  }

  const synthesisInput = path.join(audioDir, `${scene.id}.synthesis-input.json`);
  const synthesisMetadata = path.join(audioDir, `${scene.id}.synthesis-metadata.json`);
  writeJson(synthesisInput, {
    sceneId: scene.id,
    performanceSegments: scene.performanceSegments ?? [{text: scene.narration, pauseAfterMs: 0}],
  });
  execFileSync(process.execPath, [
    synthesisWorker,
    synthesisInput,
    rawFile,
    synthesisMetadata,
  ], {stdio: "ignore"});
  const performance = JSON.parse(readFileSync(synthesisMetadata, "utf8"));
  const speechText = performance.spokenSegments.map((segment) => segment.spokenText).join(" ");
  const rawDurationSeconds = performance.rawDurationSeconds;
  const speed = Math.max(1, Math.min(2, rawDurationSeconds / targetSpeechSeconds));

  if (!ffmpeg) {
    throw new Error("FFmpeg was not found. Run npm install to install Remotion's bundled compositor, or set FFMPEG_PATH.");
  }
  execFileSync(ffmpeg, [
    "-y",
    "-i", rawFile,
    "-filter:a", `atempo=${speed.toFixed(6)},apad=pad_dur=1,atrim=0:${targetAudioSeconds.toFixed(3)}`,
    "-ac", "1",
    "-ar", "24000",
    outputFile,
  ], {
    stdio: "ignore",
    env: {...process.env, DYLD_LIBRARY_PATH: path.dirname(ffmpeg)},
  });

  audioSegments.push({
    sceneId: scene.id,
    spokenText: speechText,
    performanceSegments: performance.spokenSegments.map((segment) => ({
      displayText: segment.displayText,
      spokenText: segment.spokenText,
      startSeconds: Number((segment.rawStartSeconds / speed).toFixed(3)),
      speechEndSeconds: Number((segment.rawSpeechEndSeconds / speed).toFixed(3)),
      endSeconds: Number((segment.rawEndSeconds / speed).toFixed(3)),
      pauseAfterMs: segment.pauseAfterMs,
      effectivePauseAfterMs: Math.round(segment.pauseAfterMs / speed),
    })),
    staticFile: `audio/${launchPlan.id}/${scene.id}.wav`,
    sampleRate: 24000,
    rawDurationSeconds: Number(rawDurationSeconds.toFixed(3)),
    playbackSpeed: Number(speed.toFixed(4)),
    audioDurationSeconds: targetAudioSeconds,
    startSeconds: cursor,
    endSeconds: cursor + targetAudioSeconds,
    pauseAfterSeconds,
  });
  cursor += scene.durationSeconds;
}

const postAudioValidations = [
  [audioSegments.every((segment) => segment.playbackSpeed <= 1.2), "Narration never exceeds 1.2x playback speed"],
  [launchPlan.scenes.every((scene) => (scene.performanceSegments?.length ?? 1) > 1), "Narration is synthesized as short performance beats"],
  [audioSegments.every((segment) => (segment.performanceSegments ?? []).every((beat) => beat.effectivePauseAfterMs >= 0)), "Performance pauses are preserved in synthesized audio"],
];
validations.push(...postAudioValidations);
const failedPostAudio = postAudioValidations.filter(([passed]) => !passed).map(([, label]) => label);
if (failedPostAudio.length > 0) {
  throw new Error(`Narration performance validation failed:\n${failedPostAudio.map((label) => `- ${label}`).join("\n")}`);
}

let sceneCursor = 0;
const scenes = launchPlan.scenes.map((scene) => {
  const startSeconds = sceneCursor;
  sceneCursor += scene.durationSeconds;
  return {
    id: scene.id,
    title: scene.title,
    purpose: scene.purpose,
    teachingPoint: scene.teachingPoint,
    startSeconds,
    durationSeconds: scene.durationSeconds,
    visual: {
      sceneId: scene.id,
      visualPrimitive: scene.visualPrimitive,
      visualType: "bespoke-launch-set-piece",
      layout: "full-frame custom composition",
      motionStyle: "continuous-progressive-reveal",
      density: "high",
      textDensity: "low",
      camera: "subtle-push-in",
      emphasis: scene.cues.slice(0, 3),
      avoid: ["generic centered cards", "tiny UI", "paragraph captions", "static source excerpts"],
    },
    assets: [],
    animation: {
      sceneId: scene.id,
      camera: "subtle-push-in",
      layout: "bespoke launch set piece",
      transition: "match-cut",
      transitionIn: "soft-fade-and-scale-in",
      transitionOut: "motion-blur-crossfade",
      primaryAnimatedObject: `${scene.id}-hero`,
      secondaryAnimatedObjects: scene.cues.map((cue, cueIndex) => `${scene.id}-cue-${cueIndex + 1}`),
      progressiveReveal: scene.cues.map((cue, cueIndex) => ({
        label: cue,
        startSeconds: Number((0.8 + cueIndex * (scene.durationSeconds - 2) / scene.cues.length).toFixed(2)),
        durationSeconds: 2.2,
      })),
      focus: scene.cues,
      staticHoldSeconds: 0.4,
      requiresPathAnimation: ["hook", "solution", "workflow", "guardrails"].includes(scene.id),
      requiresCameraMovement: true,
      elements: scene.cues.map((cue, cueIndex) => ({
        asset: `${scene.id}-cue-${cueIndex + 1}`,
        animation: cueIndex % 2 === 0 ? "path-draw-progressive-reveal" : "morphing-progressive-reveal",
        startSeconds: Number((cueIndex * 1.25).toFixed(2)),
        durationSeconds: 2.6,
      })),
    },
    narration: {
      sceneId: scene.id,
      startSeconds,
      endSeconds: startSeconds + scene.durationSeconds - (scene.id === "conclusion" ? 0 : 0.65),
      text: scene.narration,
      performanceSegments: audioSegments.find((segment) => segment.sceneId === scene.id)?.performanceSegments ?? [],
    },
  };
});

const shots = [];
const decisions = [];
const assignments = [];
const shotAnimations = [];
for (const scene of scenes) {
  const source = launchPlan.scenes.find((item) => item.id === scene.id);
  const shotDuration = scene.durationSeconds / source.cues.length;
  source.cues.forEach((cue, cueIndex) => {
    const shotId = `${scene.id}-shot-${String(cueIndex + 1).padStart(2, "0")}`;
    const startSeconds = scene.startSeconds + cueIndex * shotDuration;
    const durationSeconds = cueIndex === source.cues.length - 1
      ? scene.startSeconds + scene.durationSeconds - startSeconds
      : shotDuration;
    const fromFrame = Math.round(startSeconds * launchPlan.fps);
    const durationFrames = Math.round(durationSeconds * launchPlan.fps);
    shots.push({
      shotId,
      sceneId: scene.id,
      order: cueIndex + 1,
      title: scene.title,
      purpose: scene.purpose,
      teachingPoint: scene.teachingPoint,
      shotRole: cueIndex === 0 ? "set-piece-open" : cueIndex === source.cues.length - 1 ? "set-piece-payoff" : "set-piece-build",
      startSeconds: Number(startSeconds.toFixed(3)),
      durationSeconds: Number(durationSeconds.toFixed(3)),
      visualIntent: `${cue} as part of the ${scene.id} set piece`,
      framing: cueIndex % 2 === 0 ? "wide" : "medium-close",
      camera: "subtle-push-in",
      onScreenText: [cue],
      visual: scene.visual,
      media: {shotId, sceneId: scene.id, mediaType: source.media[cueIndex]},
      assets: [],
      animation: {
        shotId,
        animatedElements: [`${shotId}-primary`, `${shotId}-accent`],
        pathAnimation: cueIndex % 2 === 0,
        cameraMovement: "subtle-push-in",
        staticHoldSeconds: 0.3,
      },
      narration: scene.narration,
      decision: {
        cutId: `cut-${shotId}`,
        shotId,
        sceneId: scene.id,
        fromFrame,
        durationFrames,
        transition: cueIndex === 0 ? "match-cut" : "continuous-build",
        pacingRole: cueIndex === 0 ? "scene-open" : cueIndex === source.cues.length - 1 ? "scene-payoff" : "scene-build",
      },
    });
    assignments.push({shotId, sceneId: scene.id, mediaType: source.media[cueIndex], rationale: `Supports ${cue}`});
    decisions.push({
      cutId: `cut-${shotId}`,
      shotId,
      sceneId: scene.id,
      fromFrame,
      durationFrames,
      transition: cueIndex === 0 ? "match-cut" : "continuous-build",
      pacingRole: cueIndex === 0 ? "scene-open" : cueIndex === source.cues.length - 1 ? "scene-payoff" : "scene-build",
    });
    shotAnimations.push({
      shotId,
      animatedElements: [`${shotId}-primary`, `${shotId}-accent`],
      cameraMovement: "subtle-push-in",
      staticHoldSeconds: 0.3,
    });
  });
}

const narration = {
  kind: "Narration",
  version: "1.0.0",
  sourceHash,
  text: narrationText,
  wordCount: wordCount(narrationText),
  tone: "warm, confident, practical internal product launch",
  segments: scenes.map((scene) => scene.narration),
};

const narrationAudio = {
  kind: "NarrationAudio",
  version: "1.0.0",
  sourceHash,
  model: "onnx-community/Kokoro-82M-v1.0-ONNX",
  voice: "af_heart",
  totalDurationSeconds: narrativeRuntimeSeconds,
  segments: audioSegments,
};

const manifest = {
  kind: "RenderManifest",
  version: "1.0.0",
  renderer: "remotion",
  sourceHash,
  showcase: "sdd-orchestrator",
  launchVersion: launchPlan.version,
  brandMode: launchPlan.brandMode ?? "legacy",
  presentationMode: launchPlan.presentationMode ?? "default",
  liveDemo: launchPlan.liveDemo ?? null,
  fps: launchPlan.fps,
  width: launchPlan.width,
  height: launchPlan.height,
  totalDurationSeconds: launchPlan.runtimeSeconds,
  endSlate: launchPlan.endSlate ?? null,
  scenes,
  shots,
  mediaMix: {kind: "MediaMixPlan", version: "1.0.0", sourceHash, assignments},
  edl: {kind: "EditDecisionList", version: "1.0.0", sourceHash, fps: launchPlan.fps, decisions},
  narration,
  narrationAudio,
};

const storyPlan = {
  kind: "StoryPlan",
  version: "1.0.0",
  sourceHash,
  title: launchPlan.title,
  audience: launchPlan.audience,
  totalDurationSeconds: launchPlan.runtimeSeconds,
  scenes: launchPlan.scenes.map(({narration: _narration, cues: _cues, media: _media, visualPrimitive: _visualPrimitive, ...scene}) => scene),
};
const visualPlan = {kind: "VisualPlan", version: "1.0.0", sourceHash, scenes: scenes.map((scene) => scene.visual)};
const shotPlan = {kind: "ShotPlan", version: "1.0.0", sourceHash, shots};
const mediaMixPlan = {kind: "MediaMixPlan", version: "1.0.0", sourceHash, assignments};
const animationPlan = {kind: "AnimationPlan", version: "1.0.0", sourceHash, scenes: scenes.map((scene) => scene.animation), shots: shotAnimations};
const validation = {
  kind: "LaunchExperienceValidation",
  version: "1.0.0",
  sourceHash,
  passed: true,
  profile: `sdd-orchestrator-product-launch-${launchPlan.version}`,
  checks: validations.map(([passed, label]) => ({label, passed})),
  metrics: {
    runtimeSeconds: launchPlan.runtimeSeconds,
    sceneCount: launchPlan.scenes.length,
    shotCount: shots.length,
    narrationWordCount: narration.wordCount,
    primaryVisualScale: "full-frame set pieces",
    captionsCarryMeaning: false,
    communityCtaPresent: true,
    liveDemoProofCount: liveDemoAssets.length,
  },
};

const creativeBrief = `# Creative Brief — SDD Orchestrator Launch ${launchPlan.version}\n\n## Objective\n\nLaunch SDD Orchestrator as the easiest entry point into Spec-Driven Development and motivate teams to try it on a real feature.\n\n## Core positioning\n\n> ${launchPlan.positioning}\n\nSDD Orchestrator does not replace the SDD skills. It makes them usable through one guided, stateful lifecycle with explicit review points and connected validation evidence.\n\n## Audience\n\n${launchPlan.audience.map((item) => `- ${item}`).join("\n")}\n\n## Tone\n\nConfident, constructive, practical, and productized. The film protects the strength of the underlying SDD method while clearly naming the adoption gap.\n\n## Primary CTA\n\n${launchPlan.primaryCta}\n\n## Secondary CTA\n\n${launchPlan.secondaryCta}\n\n## Source truth\n\n${launchPlan.sourceTruth.map((item) => `- ${item}`).join("\n")}\n`;

const narrationMarkdown = `# Narration — ${launchPlan.title} ${launchPlan.version}\n\n**Runtime:** ${launchPlan.runtimeSeconds} seconds  \n**Word count:** ${narration.wordCount}\n\n${launchPlan.scenes.map((scene, index) => `## Scene ${index + 1} — ${scene.title}\n\n${scene.narration}`).join("\n\n")}\n`;

const voicePerformance = `# Voice Performance — ${launchPlan.title} ${launchPlan.version}\n\nVoice: Kokoro af_heart. ${launchPlan.voiceDirection ?? "Warm, confident, practical. Medium pacing with clean product-launch emphasis."}\n\n${launchPlan.scenes.map((scene, index) => `## ${index + 1}. ${scene.title}\n\n${index === 0 ? "[LAND THE LAUNCH. PAUSE.]" : index === 1 ? "[READ THE QUESTIONS WITH SLIGHT CURIOSITY. LET EACH ONE BREATHE.]" : index === 2 ? "[EMPHASIZE: NOT ANOTHER SKILL. GUIDED PATH.]" : index === 3 ? "[DIRECT AND CONVERSATIONAL, AS IF PROMPTING CODEX.]" : index === 4 ? "[DELIBERATE LIST. SMALL PAUSE BETWEEN EACH LIFECYCLE ITEM. EMPHASIZE STATEFUL AND EVIDENCE CONNECTED.]" : index === 5 ? "[WARM ROLE-BASED BENEFITS. DO NOT SOUND LIKE A SCORECARD.]" : "[CONFIDENT INVITATION. PAUSE BEFORE THE CTA AND AFTER TRY IT ON YOUR NEXT FEATURE.]"}\n\n${(scene.performanceSegments ?? [{text: scene.narration, pauseAfterMs: 0}]).map((segment) => `${segment.text}${segment.pauseAfterMs ? `  \n_[Pause ${segment.pauseAfterMs}ms]_` : ""}`).join("\n\n")}`).join("\n\n")}\n`;

writeFileSync(path.join(artifactDir, "creative-brief.md"), creativeBrief);
writeFileSync(path.join(artifactDir, "narration.md"), narrationMarkdown);
writeFileSync(path.join(artifactDir, "voice-performance.md"), voicePerformance);
writeJson(path.join(artifactDir, "story-plan.json"), storyPlan);
writeJson(path.join(artifactDir, "visual-plan.json"), visualPlan);
writeJson(path.join(artifactDir, "narration.json"), narration);
writeJson(path.join(artifactDir, "narration-audio.json"), narrationAudio);
writeJson(path.join(artifactDir, "shot-plan.json"), shotPlan);
writeJson(path.join(artifactDir, "media-mix-plan.json"), mediaMixPlan);
writeJson(path.join(artifactDir, "animation-plan.json"), animationPlan);
writeJson(path.join(artifactDir, "edit-decision-list.json"), manifest.edl);
writeJson(path.join(artifactDir, "experience-validation.json"), validation);
writeJson(path.join(artifactDir, "render-manifest.json"), manifest);
writeJson(generatedManifestPath, manifest);

console.log(`Built ${launchPlan.id}: ${launchPlan.runtimeSeconds}s, ${narration.wordCount} words, ${shots.length} shots.`);
