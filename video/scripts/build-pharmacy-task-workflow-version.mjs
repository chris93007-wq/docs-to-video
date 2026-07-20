import {existsSync, mkdirSync, readFileSync, writeFileSync} from "node:fs";
import path from "node:path";
import {
  createKokoroSynthesizer,
  createNarrationAudio,
  narrationAudioFilesExist,
} from "../compiler/stages/narration-audio.mjs";
import {hashFile, hashValue, projectRoot} from "../compiler/utils.mjs";

const narrationContract = ({voice, pauseSeconds, tailPaddingSeconds, scenes}) => ({
  voice,
  pauseSeconds,
  tailPaddingSeconds,
  scenes: scenes.map((scene) => ({
    id: scene.id,
    intendedDurationSeconds: scene.intendedDurationSeconds,
    narration: scene.narration,
  })),
});

export const narrationSignatureForPlan = (launchPlan) =>
  hashValue(
    narrationContract({
      voice: launchPlan.voice,
      pauseSeconds: launchPlan.pauseSeconds,
      tailPaddingSeconds: launchPlan.tailPaddingSeconds,
      scenes: launchPlan.scenes,
    }),
  );

export const narrationSignatureForManifest = (manifest, fallbackTailPaddingSeconds) =>
  manifest.narrationSignature ??
  hashValue(
    narrationContract({
      voice: manifest.narrationAudio?.voice,
      pauseSeconds: manifest.narrationAudio?.pauseSeconds,
      tailPaddingSeconds:
        manifest.narrationSettings?.tailPaddingSeconds ?? fallbackTailPaddingSeconds,
      scenes: manifest.scenes ?? [],
    }),
  );

const readPngDimensions = (filePath) => {
  const bytes = readFileSync(filePath);
  const signature = bytes.subarray(0, 8).toString("hex");
  if (signature !== "89504e470d0a1a0a" || bytes.subarray(12, 16).toString("ascii") !== "IHDR") {
    throw new Error(`Evidence asset is not a valid PNG: ${filePath}`);
  }
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
  };
};

export const validateEvidenceAssets = (launchPlan) => {
  for (const scene of launchPlan.scenes) {
    const evidence = scene.evidence;
    if (!evidence) continue;

    const filePath = path.join(projectRoot, "public", evidence.staticFile);
    if (!existsSync(filePath)) {
      throw new Error(`Evidence asset for scene ${scene.id} does not exist: ${filePath}`);
    }

    const dimensions = readPngDimensions(filePath);
    if (
      dimensions.width !== evidence.naturalWidth ||
      dimensions.height !== evidence.naturalHeight
    ) {
      throw new Error(
        `Evidence dimensions for scene ${scene.id} are ${dimensions.width}x${dimensions.height}; expected ${evidence.naturalWidth}x${evidence.naturalHeight}.`,
      );
    }

    const checksum = hashFile(filePath);
    if (checksum !== evidence.sha256) {
      throw new Error(
        `Evidence checksum for scene ${scene.id} is ${checksum}; expected ${evidence.sha256}.`,
      );
    }

    if (!evidence.sourceLabel || !evidence.sourceUrl?.startsWith("https://")) {
      throw new Error(`Evidence provenance is incomplete for scene ${scene.id}.`);
    }

    if (!Array.isArray(evidence.focusRegions) || evidence.focusRegions.length === 0) {
      throw new Error(`Evidence asset for scene ${scene.id} has no focus regions.`);
    }

    for (const region of evidence.focusRegions) {
      const insideImage =
        region.x >= 0 &&
        region.y >= 0 &&
        region.width > 0 &&
        region.height > 0 &&
        region.x + region.width <= evidence.naturalWidth &&
        region.y + region.height <= evidence.naturalHeight;
      if (!insideImage) {
        throw new Error(`Evidence focus region ${region.id} is outside ${scene.id}'s image.`);
      }
    }
  }
};

const loadReusableNarration = ({launchPlan, narrationSignature, reuseManifestPaths}) => {
  const mismatches = [];
  for (const manifestPath of reuseManifestPaths) {
    if (!existsSync(manifestPath)) continue;
    const candidate = JSON.parse(readFileSync(manifestPath, "utf8"));
    const candidateSignature = narrationSignatureForManifest(
      candidate,
      launchPlan.tailPaddingSeconds,
    );
    if (candidateSignature !== narrationSignature) {
      mismatches.push(`${manifestPath}: ${candidateSignature}`);
      continue;
    }
    if (!narrationAudioFilesExist(candidate.narrationAudio)) {
      mismatches.push(`${manifestPath}: narration files are missing`);
      continue;
    }
    return candidate.narrationAudio;
  }
  return {mismatches};
};

export const buildPharmacyTaskWorkflowVersion = async ({
  launchPlan,
  generatedManifestFile,
  reuseManifestFiles = [],
  requireNarrationReuse = true,
}) => {
  validateEvidenceAssets(launchPlan);

  const generatedManifestPath = path.join(
    projectRoot,
    "src",
    "launch",
    generatedManifestFile,
  );
  const artifactDir = path.join(projectRoot, "artifacts", launchPlan.id);
  const artifactManifestPath = path.join(artifactDir, "render-manifest.json");
  const narrationSignature = narrationSignatureForPlan(launchPlan);
  const sourceHash = hashValue({
    id: launchPlan.id,
    version: launchPlan.version,
    voice: launchPlan.voice,
    pauseSeconds: launchPlan.pauseSeconds,
    tailPaddingSeconds: launchPlan.tailPaddingSeconds,
    content: launchPlan.content,
    scenes: launchPlan.scenes,
  });

  const reuseManifestPaths = [generatedManifestPath, ...reuseManifestFiles.map((file) =>
    path.join(projectRoot, "src", "launch", file),
  )];
  const reusable = loadReusableNarration({
    launchPlan,
    narrationSignature,
    reuseManifestPaths: [...new Set(reuseManifestPaths)],
  });

  let narrationAudio = reusable?.kind === "NarrationAudio" ? reusable : null;
  if (!narrationAudio && requireNarrationReuse) {
    const details = reusable?.mismatches?.length
      ? ` Candidates: ${reusable.mismatches.join("; ")}`
      : " No reusable manifest was found.";
    throw new Error(
      `Narration reuse is required for ${launchPlan.version}, but the narration signature ${narrationSignature} did not match.${details}`,
    );
  }

  if (!narrationAudio) {
    const synthesizeSpeech = await createKokoroSynthesizer({voice: launchPlan.voice});
    const synthesizeWithTail = async (text, options) => {
      const {samples, sampleRate} = await synthesizeSpeech(text, options);
      const padded = new Float32Array(
        samples.length + Math.round(sampleRate * launchPlan.tailPaddingSeconds),
      );
      padded.set(samples);
      return {samples: padded, sampleRate};
    };

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
      synthesize: synthesizeWithTail,
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
    narrationSignature,
    narrationSettings: {
      voice: launchPlan.voice,
      pauseSeconds: launchPlan.pauseSeconds,
      tailPaddingSeconds: launchPlan.tailPaddingSeconds,
    },
    showcase: "pharmacy-task-workflow-light",
    launchVersion: launchPlan.version,
    brandMode: "oracle-redwood-light",
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
  console.log(`Narration signature: ${narrationSignature}`);
  console.log(`Narrative: ${narrativeDurationSeconds.toFixed(2)} seconds`);
  console.log(`Total: ${manifest.totalDurationSeconds.toFixed(2)} seconds`);
  console.log(`Manifest: ${generatedManifestPath}`);

  return manifest;
};
