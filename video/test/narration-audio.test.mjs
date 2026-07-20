import assert from "node:assert/strict";
import {existsSync, rmSync} from "node:fs";
import path from "node:path";
import {test} from "node:test";
import {
  applyNarrationTiming,
  createNarrationAudio,
  findSynthesisArtifacts,
  narrationAudioFilesExist,
  pcmWavBuffer,
  speechTextFor,
  trimTrailingSynthesisArtifact,
} from "../compiler/stages/narration-audio.mjs";
import {projectRoot} from "../compiler/utils.mjs";

const storyPlan = {
  kind: "StoryPlan",
  version: "1.0.0",
  sourceHash: "story",
  narrativeArc: ["hook", "conclusion"],
  totalDurationSeconds: 2,
  scenes: [
    {id: "hook", durationSeconds: 1},
    {id: "conclusion", durationSeconds: 1},
  ],
};

const narration = {
  kind: "Narration",
  version: "1.0.0",
  sourceHash: "narration",
  targetWordCount: [1, 99],
  wordCount: 10,
  text: "SDD uses Jira, CLI, TDD, and Playwright.",
  segments: [
    {sceneId: "hook", startSeconds: 0, endSeconds: 1, text: "SDD uses Jira."},
    {sceneId: "conclusion", startSeconds: 1, endSeconds: 2, text: "CLI uses TDD and Playwright."},
  ],
};

const SAMPLE_RATE = 24000;
const silence = (seconds) => new Float32Array(Math.round(seconds * SAMPLE_RATE));
const tone = (seconds, amplitude, freq = 200) => {
  const n = Math.round(seconds * SAMPLE_RATE);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i += 1) {
    out[i] = Math.sin((2 * Math.PI * freq * i) / SAMPLE_RATE) * amplitude;
  }
  return out;
};
const concatSamples = (...arrays) => {
  const total = arrays.reduce((sum, array) => sum + array.length, 0);
  const out = new Float32Array(total);
  let offset = 0;
  for (const array of arrays) {
    out.set(array, offset);
    offset += array.length;
  }
  return out;
};

test("trimTrailingSynthesisArtifact removes a trailing clip burst after real speech ends", () => {
  const samples = concatSamples(tone(1, 0.3), silence(0.5), tone(0.03, 0.999));
  const trimmed = trimTrailingSynthesisArtifact(samples, SAMPLE_RATE);

  assert.ok(trimmed.length < samples.length);
  assert.deepEqual(findSynthesisArtifacts(trimmed, SAMPLE_RATE), []);
});

test("trimTrailingSynthesisArtifact leaves clean audio untouched", () => {
  const samples = concatSamples(tone(1, 0.3), silence(0.3));
  const trimmed = trimTrailingSynthesisArtifact(samples, SAMPLE_RATE);
  assert.equal(trimmed, samples);
});

test("findSynthesisArtifacts flags an isolated clip burst bounded by real silence", () => {
  const samples = concatSamples(silence(0.3), tone(0.03, 0.999), silence(0.3));
  const artifacts = findSynthesisArtifacts(samples, SAMPLE_RATE);
  assert.equal(artifacts.length, 1);
  assert.ok(artifacts[0].startSeconds >= 0.29 && artifacts[0].startSeconds <= 0.31);
});

test("findSynthesisArtifacts ignores a loud consonant inside ordinary continuous speech", () => {
  // A brief (<50ms) dip below the silence threshold between syllables, followed
  // by a loud peak, surrounded by ordinary speech on both sides and real
  // silence only far away — this should read as a real word, not a glitch.
  const samples = concatSamples(
    silence(0.3),
    tone(0.08, 0.3),
    silence(0.02),
    tone(0.01, 0.999),
    tone(0.12, 0.3),
    silence(0.3),
  );
  assert.deepEqual(findSynthesisArtifacts(samples, SAMPLE_RATE), []);
});

test("createNarrationAudio rejects a scene whose synthesized audio contains an isolated clipping burst", async () => {
  const glitchedStoryPlan = {
    ...storyPlan,
    scenes: [{id: "hook", durationSeconds: 1}],
  };
  const glitchedNarration = {
    ...narration,
    segments: [{sceneId: "hook", startSeconds: 0, endSeconds: 1, text: "Hello."}],
  };
  // The glitch sits well before the end, followed by more ordinary speech, so
  // trimTrailingSynthesisArtifact (tail-only) can't reach it — only the
  // whole-buffer assertion catches it.
  const synthesize = async () => ({
    samples: concatSamples(silence(0.3), tone(0.03, 0.999), silence(0.3), tone(0.3, 0.3)),
    sampleRate: SAMPLE_RATE,
  });

  await assert.rejects(
    createNarrationAudio({
      storyPlan: glitchedStoryPlan,
      narration: glitchedNarration,
      voice: "af_heart",
      model: "test-model",
      synthesize,
    }),
    /isolated clipping burst/,
  );
});

test("speech-only pronunciation rules preserve display narration", () => {
  assert.equal(
    speechTextFor("SDD uses Jira, CLI, TDD, and Playwright."),
    "S D D uses jeera, C L I, T D D, and PLAY-right.",
  );
  assert.equal(narration.segments[0].text, "SDD uses Jira.");
});

test("PCM WAV writer records mono 16-bit metadata", () => {
  const wav = pcmWavBuffer(new Float32Array([0, 0.5, -0.5]), 24000);
  assert.equal(wav.toString("ascii", 0, 4), "RIFF");
  assert.equal(wav.toString("ascii", 8, 12), "WAVE");
  assert.equal(wav.readUInt16LE(22), 1);
  assert.equal(wav.readUInt32LE(24), 24000);
  assert.equal(wav.length, 50);
});

test("Kokoro scene synthesis produces cacheable assets and retimes scenes", async () => {
  const spoken = [];
  const synthesize = async (text) => {
    spoken.push(text);
    return {
      samples: new Float32Array(text.startsWith("S D D") ? 24000 : 12000),
      sampleRate: 24000,
    };
  };
  const audio = await createNarrationAudio({
    storyPlan,
    narration,
    voice: "af_heart",
    model: "test-model",
    synthesize,
  });

  try {
    assert.deepEqual(spoken, ["S D D uses jeera.", "C L I uses T D D and PLAY-right."]);
    assert.equal(audio.segments.length, 2);
    assert.equal(audio.segments[0].audioDurationSeconds, 1);
    assert.equal(audio.segments[0].pauseAfterSeconds, 0.6);
    assert.equal(audio.segments[1].startSeconds, 1.6);
    assert.equal(audio.totalDurationSeconds, 2.1);
    assert.ok(narrationAudioFilesExist(audio));

    const retimed = applyNarrationTiming({storyPlan, narration, narrationAudio: audio});
    assert.equal(retimed.storyPlan.totalDurationSeconds, 2.1);
    assert.equal(retimed.storyPlan.scenes[0].durationSeconds, 1.6);
    assert.equal(retimed.narration.segments[1].startSeconds, 1.6);
    assert.equal(retimed.narration.segments[1].text, narration.segments[1].text);

    const differentVoice = await createNarrationAudio({
      storyPlan,
      narration,
      voice: "af_other",
      model: "test-model",
      synthesize,
    });
    assert.notEqual(audio.sourceHash, differentVoice.sourceHash);
    rmSync(path.join(projectRoot, "public", "audio", "compiler", differentVoice.sourceHash), {recursive: true, force: true});
  } finally {
    const directory = path.join(projectRoot, "public", "audio", "compiler", audio.sourceHash);
    if (existsSync(directory)) {
      rmSync(directory, {recursive: true, force: true});
    }
  }
});
