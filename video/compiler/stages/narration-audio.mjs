import {existsSync, mkdirSync, writeFileSync} from "node:fs";
import path from "node:path";
import {hashValue, projectRoot} from "../utils.mjs";

export const DEFAULT_KOKORO_MODEL = "onnx-community/Kokoro-82M-v1.0-ONNX";
export const DEFAULT_KOKORO_VOICE = "af_heart";
export const DEFAULT_SCENE_PAUSE_SECONDS = 0.6;

export const pronunciationRules = [
  {pattern: /\bSDD\b/g, replacement: "S D D"},
  {pattern: /\bJira\b/gi, replacement: "JEE-rah"},
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
    const audio = asFloat32Array(samples);
    const audioDurationSeconds = audio.length / sampleRate;
    if (!Number.isFinite(audioDurationSeconds) || audioDurationSeconds <= 0) {
      throw new Error(`Kokoro generated no usable audio for scene ${segment.sceneId}.`);
    }

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
