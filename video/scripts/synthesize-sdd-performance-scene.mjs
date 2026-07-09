import {readFileSync, writeFileSync} from "node:fs";
import {createKokoroSynthesizer, speechTextFor, writePcmWav} from "../compiler/stages/narration-audio.mjs";

const [inputPath, rawOutputPath, metadataOutputPath] = process.argv.slice(2);
if (!inputPath || !rawOutputPath || !metadataOutputPath) {
  throw new Error("Expected input JSON, raw WAV output, and metadata output paths.");
}

const input = JSON.parse(readFileSync(inputPath, "utf8"));
const synthesize = await createKokoroSynthesizer();
const normalizeSpeechText = (text) => speechTextFor(text)
  .replace(/[’]/g, "'")
  .replace(/[—–]/g, ", ");

const trimSynthesizedSilence = (samples, sampleRate) => {
  const threshold = 0.002;
  const edgePaddingSamples = Math.round(sampleRate * 0.04);
  let firstAudible = 0;
  let lastAudible = samples.length - 1;

  while (firstAudible < samples.length && Math.abs(samples[firstAudible]) < threshold) {
    firstAudible += 1;
  }
  while (lastAudible > firstAudible && Math.abs(samples[lastAudible]) < threshold) {
    lastAudible -= 1;
  }
  if (firstAudible >= samples.length) {
    return samples;
  }

  return samples.slice(
    Math.max(0, firstAudible - edgePaddingSamples),
    Math.min(samples.length, lastAudible + edgePaddingSamples + 1),
  );
};

const generatedParts = [];
const spokenSegments = [];
let sampleRate;
let sampleCursor = 0;

for (const segment of input.performanceSegments) {
  const spokenText = normalizeSpeechText(segment.text);
  const generated = await synthesize(spokenText);
  sampleRate ??= generated.sampleRate;
  if (generated.sampleRate !== sampleRate) {
    throw new Error(`Inconsistent Kokoro sample rate in scene ${input.sceneId}.`);
  }
  const trimmedSamples = trimSynthesizedSilence(generated.samples, sampleRate);
  const speechStartSample = sampleCursor;
  const speechEndSample = speechStartSample + trimmedSamples.length;
  generatedParts.push(trimmedSamples);
  sampleCursor = speechEndSample;
  const pauseSamples = Math.round((segment.pauseAfterMs / 1000) * sampleRate);
  if (pauseSamples > 0) {
    generatedParts.push(new Float32Array(pauseSamples));
    sampleCursor += pauseSamples;
  }
  spokenSegments.push({
    displayText: segment.text,
    spokenText,
    pauseAfterMs: segment.pauseAfterMs,
    rawStartSeconds: speechStartSample / sampleRate,
    rawSpeechEndSeconds: speechEndSample / sampleRate,
    rawEndSeconds: sampleCursor / sampleRate,
  });
}

const totalSamples = generatedParts.reduce((total, part) => total + part.length, 0);
const samples = new Float32Array(totalSamples);
let offset = 0;
for (const part of generatedParts) {
  samples.set(part, offset);
  offset += part.length;
}

writePcmWav(rawOutputPath, samples, sampleRate);
writeFileSync(metadataOutputPath, `${JSON.stringify({
  sampleRate,
  rawDurationSeconds: samples.length / sampleRate,
  spokenSegments,
}, null, 2)}\n`);
