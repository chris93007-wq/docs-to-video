import {execFileSync} from "node:child_process";
import {mkdirSync, writeFileSync} from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {createKokoroSynthesizer, speechTextFor, writePcmWav} from "../compiler/stages/narration-audio.mjs";
import {hashValue} from "../compiler/utils.mjs";
import {launchPlan} from "../launch/sdd-orchestrator-launch-v006.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const artifactDir = path.join(projectRoot, "artifacts", launchPlan.id);
const audioDir = path.join(projectRoot, "public", "audio", launchPlan.id);
const generatedManifestPath = path.join(projectRoot, "src", "launch", `${launchPlan.id}.json`);
const ffmpeg = path.join(projectRoot, "node_modules", "@remotion", "compositor-darwin-arm64", "ffmpeg");

mkdirSync(artifactDir, {recursive: true});
mkdirSync(audioDir, {recursive: true});
mkdirSync(path.dirname(generatedManifestPath), {recursive: true});

const writeJson = (filePath, value) => writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
const words = (value) => String(value).trim().split(/\s+/).filter(Boolean);
const wordCount = (value) => words(value).length;
const narrationText = launchPlan.scenes.map((scene) => scene.narration).join(" ");
const sourceHash = hashValue({launchPlan, narrationText});

const validations = [
  [launchPlan.runtimeSeconds >= 110 && launchPlan.runtimeSeconds <= 125, "Runtime is 110-125 seconds"],
  [launchPlan.scenes.length === 7, "Exactly seven launch scenes"],
  [wordCount(narrationText) >= 260 && wordCount(narrationText) <= 320, "Narration is 260-320 words"],
  [launchPlan.scenes[0].title.includes("now live"), "The film clearly launches the Orchestrator"],
  [launchPlan.scenes.some((scene) => /adoption|blocker|friction/i.test(`${scene.purpose} ${scene.teachingPoint}`)), "Adoption blockers are explicit"],
  [launchPlan.scenes.some((scene) => scene.id === "developer-experience" && /Codex/i.test(`${scene.title} ${scene.narration}`)), "Codex usage is shown"],
  [launchPlan.scenes.some((scene) => scene.id === "workflow" && /lifecycle/i.test(`${scene.title} ${scene.narration}`)), "The guided lifecycle is shown"],
  [launchPlan.scenes.some((scene) => /approval/i.test(`${scene.narration} ${scene.cues.join(" ")}`)), "Review and approval boundaries are shown"],
  [launchPlan.scenes.some((scene) => /evidence|traceability/i.test(`${scene.narration} ${scene.cues.join(" ")}`)), "Evidence and traceability are shown"],
  [launchPlan.scenes.at(-1).narration.includes("Help make SDD easier"), "The community contribution CTA is present"],
  [launchPlan.scenes.every((scene) => scene.visualPrimitive), "Every scene is visual-first"],
  [launchPlan.scenes.every((scene) => scene.cues.length <= 4), "On-screen copy stays sparse"],
  [launchPlan.scenes.some((scene) => scene.visualPrimitive === "FloatingDocumentCloud"), "The launch has a memorable hero set piece"],
];

const failed = validations.filter(([passed]) => !passed).map(([, label]) => label);
if (failed.length > 0) {
  throw new Error(`Launch validation failed:\n${failed.map((label) => `- ${label}`).join("\n")}`);
}

const synthesize = await createKokoroSynthesizer();
const audioSegments = [];
let cursor = 0;

for (let index = 0; index < launchPlan.scenes.length; index += 1) {
  const scene = launchPlan.scenes[index];
  const isLast = index === launchPlan.scenes.length - 1;
  const pauseAfterSeconds = isLast ? 0 : 0.65;
  const targetAudioSeconds = scene.durationSeconds - pauseAfterSeconds;
  const targetSpeechSeconds = targetAudioSeconds - 0.25;
  const rawFile = path.join(audioDir, `${scene.id}.raw.wav`);
  const outputFile = path.join(audioDir, `${scene.id}.wav`);
  const generated = await synthesize(speechTextFor(scene.narration));
  writePcmWav(rawFile, generated.samples, generated.sampleRate);
  const rawDurationSeconds = generated.samples.length / generated.sampleRate;
  const speed = Math.max(0.5, Math.min(2, rawDurationSeconds / targetSpeechSeconds));

  execFileSync(ffmpeg, [
    "-y",
    "-i", rawFile,
    "-filter:a", `atempo=${speed.toFixed(6)},apad=pad_dur=1,atrim=0:${targetAudioSeconds.toFixed(3)}`,
    "-ac", "1",
    "-ar", "24000",
    outputFile,
  ], {stdio: "ignore"});

  audioSegments.push({
    sceneId: scene.id,
    spokenText: speechTextFor(scene.narration),
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
  totalDurationSeconds: launchPlan.runtimeSeconds,
  segments: audioSegments,
};

const manifest = {
  kind: "RenderManifest",
  version: "1.0.0",
  renderer: "remotion",
  sourceHash,
  showcase: "sdd-orchestrator",
  launchVersion: launchPlan.version,
  fps: launchPlan.fps,
  width: launchPlan.width,
  height: launchPlan.height,
  totalDurationSeconds: launchPlan.runtimeSeconds,
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
  profile: "sdd-orchestrator-product-launch-v006",
  checks: validations.map(([passed, label]) => ({label, passed})),
  metrics: {
    runtimeSeconds: launchPlan.runtimeSeconds,
    sceneCount: launchPlan.scenes.length,
    shotCount: shots.length,
    narrationWordCount: narration.wordCount,
    primaryVisualScale: "full-frame set pieces",
    captionsCarryMeaning: false,
    communityCtaPresent: true,
  },
};

const creativeBrief = `# Creative Brief — SDD Orchestrator Launch ${launchPlan.version}\n\n## Objective\n\nLaunch SDD Orchestrator as the easiest entry point into Spec-Driven Development and motivate teams to try it on a real feature.\n\n## Core positioning\n\n> ${launchPlan.positioning}\n\nSDD Orchestrator does not replace the SDD skills. It makes them usable through one guided, stateful lifecycle with explicit review points and connected validation evidence.\n\n## Audience\n\n${launchPlan.audience.map((item) => `- ${item}`).join("\n")}\n\n## Tone\n\nConfident, constructive, practical, and productized. The film protects the strength of the underlying SDD method while clearly naming the adoption gap.\n\n## Primary CTA\n\n${launchPlan.primaryCta}\n\n## Secondary CTA\n\n${launchPlan.secondaryCta}\n\n## Source truth\n\n${launchPlan.sourceTruth.map((item) => `- ${item}`).join("\n")}\n`;

const narrationMarkdown = `# Narration — ${launchPlan.title} ${launchPlan.version}\n\n**Runtime:** ${launchPlan.runtimeSeconds} seconds  \n**Word count:** ${narration.wordCount}\n\n${launchPlan.scenes.map((scene, index) => `## Scene ${index + 1} — ${scene.title}\n\n${scene.narration}`).join("\n\n")}\n`;

const voicePerformance = `# Voice Performance — ${launchPlan.title} ${launchPlan.version}\n\nVoice: Kokoro af_heart. Warm, confident, practical. Medium pacing with clean product-launch emphasis.\n\n${launchPlan.scenes.map((scene, index) => `## ${index + 1}. ${scene.title}\n\n${index === 0 ? "[LAND THE LAUNCH. PAUSE.]" : index === 1 ? "[CONSTRUCTIVE. EMPHASIZE THE CORE POSITIONING. PAUSE AFTER IT.]" : index === 2 ? "[OPEN AND ASSURED. PAUSE AFTER ONE GUIDED ENTRY POINT.]" : index === 3 ? "[DIRECT AND CONVERSATIONAL, AS IF PROMPTING CODEX.]" : index === 4 ? "[STEADY BUILD. PAUSE AT APPROVAL AND AFTER LIFECYCLE.]" : index === 5 ? "[CRISP CONTRASTS. EACH FRICTION-TO-GUARDRAIL PAIR GETS A BEAT.]" : "[WARM INVITATION. PAUSE AFTER TRY IT ON YOUR NEXT FEATURE.]"}\n\n${scene.narration}`).join("\n\n")}\n`;

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

