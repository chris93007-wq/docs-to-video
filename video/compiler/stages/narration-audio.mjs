import {existsSync, mkdirSync, writeFileSync} from "node:fs";
import path from "node:path";
import {hashValue, projectRoot} from "../utils.mjs";

export const DEFAULT_KOKORO_MODEL = "onnx-community/Kokoro-82M-v1.0-ONNX";
export const DEFAULT_KOKORO_VOICE = "af_heart";
export const DEFAULT_SCENE_PAUSE_SECONDS = 0.6;

export const pronunciationRules = [
  {pattern: /\bSDD\b/g, replacement: "S D D"},
  {pattern: /\bJira\b/gi, replacement: "jeera"},
  {pattern: /\bCLI\b/g, replacement: "C L I"},
  {pattern: /\bTDD\b/g, replacement: "T D D"},
  {pattern: /\bPlaywright\b/gi, replacement: "PLAY-right"},
];

export const pronunciationProfile = pronunciationRules.map(({pattern, replacement}) => ({
  pattern: pattern.source,
  flags: pattern.flags,
  replacement,
}));

export const speechTextFor = (text) =>
  pronunciationRules.reduce((spokenText, rule) => spokenText.replace(rule.pattern, rule.replacement), String(text ?? ""));

const publicDir = path.join(projectRoot, "public");

const asFloat32Array = (audio) => {
  if (audio instanceof Float32Array) {
    return audio;
  }
  if (ArrayBuffer.isView(audio)) {
    return Float32Array.from(audio);
  }
  if (Array.isArray(audio)) {
    return Float32Array.from(audio);
  }
  throw new Error("Kokoro did not return a Float32 audio buffer.");
};

// Kokoro occasionally appends a burst of full-scale digital clipping after the
// last spoken word, which plays back as a loud pop/glitch. Trim any trailing
// run of silence-or-clipping within the tail window, then fade out cleanly.
export const trimTrailingSynthesisArtifact = (
  samples,
  sampleRate,
  {windowSeconds = 0.01, silenceThreshold = 0.02, clipThreshold = 0.95, maxArtifactSeconds = 2} = {},
) => {
  const windowSize = Math.max(1, Math.round(sampleRate * windowSeconds));
  const totalWindows = Math.floor(samples.length / windowSize);
  if (totalWindows === 0) {
    return samples;
  }

  const isSilentWindow = new Array(totalWindows);
  const isClippedWindow = new Array(totalWindows);
  for (let w = 0; w < totalWindows; w += 1) {
    const start = w * windowSize;
    let sumSquares = 0;
    let peak = 0;
    for (let i = start; i < start + windowSize; i += 1) {
      const value = Math.abs(samples[i]);
      sumSquares += value * value;
      if (value > peak) {
        peak = value;
      }
    }
    isSilentWindow[w] = Math.sqrt(sumSquares / windowSize) < silenceThreshold;
    isClippedWindow[w] = peak >= clipThreshold;
  }

  const maxArtifactWindows = Math.round(maxArtifactSeconds / windowSeconds);
  let cutWindow = totalWindows;
  let sawClip = false;
  let w = totalWindows - 1;
  while (w >= 0 && totalWindows - w <= maxArtifactWindows) {
    if (isSilentWindow[w] || isClippedWindow[w]) {
      if (isClippedWindow[w]) {
        sawClip = true;
      }
      cutWindow = w;
      w -= 1;
      continue;
    }
    break;
  }

  if (!sawClip || cutWindow >= totalWindows) {
    return samples;
  }

  const trimmed = samples.subarray(0, cutWindow * windowSize);
  const result = Float32Array.from(trimmed);
  const fadeSamples = Math.min(result.length, Math.round(sampleRate * 0.015));
  for (let i = 0; i < fadeSamples; i += 1) {
    result[result.length - fadeSamples + i] *= i / fadeSamples;
  }
  return result;
};

// Defense in depth for trimTrailingSynthesisArtifact: scans the whole buffer
// (not just the tail) for a short burst of full-scale clipping bounded by
// silence on both sides — the signature of a Kokoro synthesis glitch, as
// opposed to a loud phoneme inside continuous, sustained speech.
export const findSynthesisArtifacts = (
  samples,
  sampleRate,
  {
    windowSeconds = 0.01,
    silenceThreshold = 0.02,
    clipThreshold = 0.95,
    maxBurstSeconds = 0.3,
    minSilenceGapSeconds = 0.05,
    maxOrdinarySpeechFraction = 0.2,
  } = {},
) => {
  const windowSize = Math.max(1, Math.round(sampleRate * windowSeconds));
  const totalWindows = Math.floor(samples.length / windowSize);
  if (totalWindows === 0) {
    return [];
  }

  const isSilentWindow = new Array(totalWindows);
  const isClippedWindow = new Array(totalWindows);
  for (let w = 0; w < totalWindows; w += 1) {
    const start = w * windowSize;
    let sumSquares = 0;
    let peak = 0;
    for (let i = start; i < start + windowSize; i += 1) {
      const value = Math.abs(samples[i]);
      sumSquares += value * value;
      if (value > peak) {
        peak = value;
      }
    }
    isSilentWindow[w] = Math.sqrt(sumSquares / windowSize) < silenceThreshold;
    isClippedWindow[w] = peak >= clipThreshold;
  }

  // A momentary dip (a stop-consonant closure, a breath) can drop below the
  // silence threshold for a window or two in the middle of continuous speech.
  // Only a run of at least minSilenceGapSeconds counts as a true boundary —
  // otherwise a loud syllable on either side of the dip gets misread as an
  // isolated burst.
  const minSilenceWindows = Math.max(1, Math.round(minSilenceGapSeconds / windowSeconds));
  const isSilenceBoundary = new Array(totalWindows).fill(false);
  let i = 0;
  while (i < totalWindows) {
    if (!isSilentWindow[i]) {
      i += 1;
      continue;
    }
    let j = i;
    while (j < totalWindows && isSilentWindow[j]) {
      j += 1;
    }
    if (j - i >= minSilenceWindows) {
      isSilenceBoundary.fill(true, i, j);
    }
    i = j;
  }

  const artifacts = [];
  let w = 0;
  while (w < totalWindows) {
    if (!isClippedWindow[w]) {
      w += 1;
      continue;
    }

    let regionStart = w;
    while (regionStart > 0 && !isSilenceBoundary[regionStart - 1]) {
      regionStart -= 1;
    }
    let regionEnd = w;
    while (regionEnd < totalWindows - 1 && !isSilenceBoundary[regionEnd + 1]) {
      regionEnd += 1;
    }

    const precededBySilence = regionStart === 0 || isSilenceBoundary[regionStart - 1];
    const followedBySilence = regionEnd === totalWindows - 1 || isSilenceBoundary[regionEnd + 1];
    const regionDurationSeconds = (regionEnd - regionStart + 1) * windowSeconds;

    // A real glitch is (near-)silence and clipping only — no ordinary speech in
    // between. A loud consonant inside a real word sits amid many windows of
    // ordinary (non-silent, non-clipped) speech, which this fraction catches.
    let ordinaryCount = 0;
    for (let r = regionStart; r <= regionEnd; r += 1) {
      if (!isSilentWindow[r] && !isClippedWindow[r]) {
        ordinaryCount += 1;
      }
    }
    const ordinaryFraction = ordinaryCount / (regionEnd - regionStart + 1);

    if (
      precededBySilence &&
      followedBySilence &&
      regionDurationSeconds <= maxBurstSeconds &&
      ordinaryFraction <= maxOrdinarySpeechFraction
    ) {
      artifacts.push({
        startSeconds: regionStart * windowSeconds,
        endSeconds: (regionEnd + 1) * windowSeconds,
      });
    }

    w = regionEnd + 1;
  }

  return artifacts;
};

export const assertNoSynthesisArtifacts = (samples, sampleRate, sceneId) => {
  const artifacts = findSynthesisArtifacts(samples, sampleRate);
  if (artifacts.length === 0) {
    return;
  }

  const windows = artifacts
    .map((artifact) => `${artifact.startSeconds.toFixed(2)}s-${artifact.endSeconds.toFixed(2)}s`)
    .join(", ");
  throw new Error(
    `Narration audio for scene "${sceneId}" contains ${artifacts.length} isolated clipping burst(s) at ${windows}. Regenerate this scene's narration audio.`,
  );
};

export const pcmWavBuffer = (samples, sampleRate) => {
  const audio = asFloat32Array(samples);
  const buffer = Buffer.alloc(44 + audio.length * 2);
  const dataSize = audio.length * 2;

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let index = 0; index < audio.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, audio[index]));
    buffer.writeInt16LE(Math.round(sample * (sample < 0 ? 0x8000 : 0x7fff)), 44 + index * 2);
  }

  return buffer;
};

export const writePcmWav = (filePath, samples, sampleRate) => {
  mkdirSync(path.dirname(filePath), {recursive: true});
  writeFileSync(filePath, pcmWavBuffer(samples, sampleRate));
};

export const createDeterministicTestSynthesizer = async (text, {targetDurationSeconds = 1, pauseSeconds = 0} = {}) => {
  const sampleRate = 24000;
  const durationSeconds = Math.max(0.1, targetDurationSeconds - pauseSeconds);
  const samples = new Float32Array(Math.round(durationSeconds * sampleRate));
  const frequency = 160 + (String(text).length % 80);
  for (let index = 0; index < samples.length; index += 1) {
    samples[index] = Math.sin((2 * Math.PI * frequency * index) / sampleRate) * 0.03;
  }
  return {samples, sampleRate};
};

export const createKokoroSynthesizer = async ({model = DEFAULT_KOKORO_MODEL, voice = DEFAULT_KOKORO_VOICE} = {}) => {
  let kokoro;
  try {
    kokoro = await import("kokoro-js");
  } catch (error) {
    throw new Error(`Kokoro requires kokoro-js and @huggingface/transformers. Run npm install before rendering. ${error.message}`);
  }

  const textToSpeech = await kokoro.KokoroTTS.from_pretrained(model, {
    dtype: "q8",
    device: "cpu",
  });
  return async (text) => {
    const output = await textToSpeech.generate(text, {voice});
    const samples = asFloat32Array(output?.audio ?? output?.data ?? output);
    const sampleRate = Number(output?.sampling_rate ?? output?.sample_rate ?? output?.sampleRate ?? 24000);
    if (!Number.isFinite(sampleRate) || sampleRate <= 0 || samples.length === 0) {
      throw new Error("Kokoro returned invalid audio metadata.");
    }
    return {samples, sampleRate};
  };
};

const staticFilePathFor = (filePath) => path.relative(publicDir, filePath).split(path.sep).join("/");

export const narrationAudioFilesExist = (narrationAudio) =>
  Array.isArray(narrationAudio?.segments) &&
  narrationAudio.segments.every((segment) => existsSync(path.join(publicDir, segment.staticFile)));

export const createNarrationAudio = async ({
  storyPlan,
  narration,
  model = process.env.DOC_VIDEO_KOKORO_MODEL || DEFAULT_KOKORO_MODEL,
  voice = process.env.DOC_VIDEO_KOKORO_VOICE || DEFAULT_KOKORO_VOICE,
  pauseSeconds = DEFAULT_SCENE_PAUSE_SECONDS,
  synthesize,
} = {}) => {
  if (!storyPlan || !narration) {
    throw new Error("storyPlan and narration are required to synthesize Kokoro narration.");
  }
  if (!Number.isFinite(pauseSeconds) || pauseSeconds < 0) {
    throw new Error("pauseSeconds must be a non-negative number.");
  }

  const sourceHash = hashValue({
    storyPlan,
    narration,
    model,
    voice,
    pauseSeconds,
    pronunciationRules: pronunciationProfile,
  });
  const outputDir = path.join(publicDir, "audio", "compiler", sourceHash);
  const synthesizeSpeech = synthesize ?? await createKokoroSynthesizer({model, voice});
  const segmentsById = new Map(narration.segments.map((segment) => [segment.sceneId, segment]));
  const orderedSegments = storyPlan.scenes.map((scene) => {
    const segment = segmentsById.get(scene.id);
    if (!segment) {
      throw new Error(`Narration is missing a segment for scene ${scene.id}.`);
    }
    return segment;
  });

  let cursor = 0;
  const segments = [];
  for (let index = 0; index < orderedSegments.length; index += 1) {
    const segment = orderedSegments[index];
    const scene = storyPlan.scenes[index];
    const spokenText = speechTextFor(segment.text);
    const isLast = index === orderedSegments.length - 1;
    const {samples, sampleRate} = await synthesizeSpeech(spokenText, {
      sceneId: segment.sceneId,
      targetDurationSeconds: scene.durationSeconds,
      isLast,
      pauseSeconds: isLast ? 0 : pauseSeconds,
    });
    const audio = trimTrailingSynthesisArtifact(asFloat32Array(samples), sampleRate);
    const audioDurationSeconds = audio.length / sampleRate;
    if (!Number.isFinite(audioDurationSeconds) || audioDurationSeconds <= 0) {
      throw new Error(`Kokoro generated no usable audio for scene ${segment.sceneId}.`);
    }
    assertNoSynthesisArtifacts(audio, sampleRate, segment.sceneId);

    const filePath = path.join(outputDir, `${segment.sceneId}.wav`);
    writePcmWav(filePath, audio, sampleRate);
    const startSeconds = cursor;
    const endSeconds = startSeconds + audioDurationSeconds;
    const pauseAfterSeconds = isLast ? 0 : pauseSeconds;
    cursor = endSeconds + pauseAfterSeconds;

    segments.push({
      sceneId: segment.sceneId,
      spokenText,
      staticFile: staticFilePathFor(filePath),
      sampleRate,
      audioDurationSeconds,
      startSeconds,
      endSeconds,
      pauseAfterSeconds,
    });
  }

  return {
    kind: "NarrationAudio",
    version: "1.0.0",
    sourceHash,
    model,
    voice,
    pauseSeconds,
    totalDurationSeconds: cursor,
    segments,
  };
};

export const applyNarrationTiming = ({storyPlan, narration, narrationAudio}) => {
  const audioBySceneId = new Map(narrationAudio.segments.map((segment) => [segment.sceneId, segment]));
  const timedScenes = storyPlan.scenes.map((scene) => {
    const audio = audioBySceneId.get(scene.id);
    if (!audio) {
      throw new Error(`Narration audio is missing a segment for scene ${scene.id}.`);
    }
    return {
      ...scene,
      durationSeconds: audio.audioDurationSeconds + audio.pauseAfterSeconds,
    };
  });
  const timedNarrationSegments = narration.segments.map((segment) => {
    const audio = audioBySceneId.get(segment.sceneId);
    if (!audio) {
      throw new Error(`Narration audio is missing a segment for scene ${segment.sceneId}.`);
    }
    return {
      ...segment,
      startSeconds: audio.startSeconds,
      endSeconds: audio.endSeconds,
    };
  });

  return {
    storyPlan: {
      ...storyPlan,
      sourceHash: hashValue({storyPlan, narrationAudio}),
      totalDurationSeconds: narrationAudio.totalDurationSeconds,
      scenes: timedScenes,
    },
    narration: {
      ...narration,
      sourceHash: hashValue({narration, narrationAudio}),
      segments: timedNarrationSegments,
    },
  };
};
