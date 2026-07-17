import {existsSync, mkdirSync, readFileSync, writeFileSync} from "node:fs";
import path from "node:path";
import {createNarrationAudio, narrationAudioFilesExist} from "../compiler/stages/narration-audio.mjs";
import {hashValue, projectRoot} from "../compiler/utils.mjs";
import {launchPlan} from "../launch/pharmacy-task-workflow-v001.mjs";

const generatedManifestPath = path.join(
  projectRoot,
  "src",
  "launch",
  "pharmacy-task-workflow-v001.json",
);
const artifactDir = path.join(projectRoot, "artifacts", launchPlan.id);
const artifactManifestPath = path.join(artifactDir, "render-manifest.json");

const sourceHash = hashValue({
  id: launchPlan.id,
  version: launchPlan.version,
  voice: launchPlan.voice,
  pauseSeconds: launchPlan.pauseSeconds,
  content: launchPlan.content,
  scenes: launchPlan.scenes,
});

const previousManifest = existsSync(generatedManifestPath)
  ? JSON.parse(readFileSync(generatedManifestPath, "utf8"))
  : null;

let narrationAudio =
  previousManifest?.sourceHash === sourceHash &&
  narrationAudioFilesExist(previousManifest.narrationAudio)
    ? previousManifest.narrationAudio
    : null;

if (!narrationAudio) {
  narrationAudio = await createNarrationAudio({
    storyPlan: {
      scenes: launchPlan.scenes.map((scene) => ({
        id: scene.id,
        durationSeconds: scene.intendedDurationSeconds,
      })),
    },
    narration: {
      segments: launchPlan.scenes.map((scene) => ({
        sceneId: scene.id,
        text: scene.narration,
      })),
    },
    voice: launchPlan.voice,
    pauseSeconds: launchPlan.pauseSeconds,
  });
}

const scenes = launchPlan.scenes.map((scene) => {
  const audio = narrationAudio.segments.find((segment) => segment.sceneId === scene.id);
  if (!audio) {
    throw new Error(`Narration audio is missing scene ${scene.id}.`);
  }
  return {
    ...scene,
    startSeconds: audio.startSeconds,
    durationSeconds: audio.audioDurationSeconds + audio.pauseAfterSeconds,
  };
});

const narrativeDurationSeconds = narrationAudio.totalDurationSeconds;
const manifest = {
  kind: "RenderManifest",
  version: "1.0.0",
  renderer: "remotion",
  sourceHash,
  showcase: "pharmacy-task-workflow",
  launchVersion: launchPlan.version,
  fps: launchPlan.fps,
  width: launchPlan.width,
  height: launchPlan.height,
  narrativeDurationSeconds,
  totalDurationSeconds: narrativeDurationSeconds + launchPlan.endSlate.durationSeconds,
  content: launchPlan.content,
  scenes,
  narrationAudio,
  endSlate: launchPlan.endSlate,
};

mkdirSync(path.dirname(generatedManifestPath), {recursive: true});
mkdirSync(artifactDir, {recursive: true});
const output = `${JSON.stringify(manifest, null, 2)}\n`;
writeFileSync(generatedManifestPath, output);
writeFileSync(artifactManifestPath, output);

console.log(`Built ${launchPlan.id}`);
console.log(`Narrative: ${narrativeDurationSeconds.toFixed(2)} seconds`);
console.log(`Total: ${manifest.totalDurationSeconds.toFixed(2)} seconds`);
console.log(`Manifest: ${generatedManifestPath}`);
