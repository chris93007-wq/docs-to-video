import assert from "node:assert/strict";
import {existsSync, rmSync} from "node:fs";
import path from "node:path";
import {test} from "node:test";
import {
  applyNarrationTiming,
  createNarrationAudio,
  narrationAudioFilesExist,
  pcmWavBuffer,
  speechTextFor,
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

test("speech-only pronunciation rules preserve display narration", () => {
  assert.equal(
    speechTextFor("SDD uses Jira, CLI, TDD, and Playwright."),
    "S D D uses JEE-rah, C L I, T D D, and PLAY-right.",
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
    assert.deepEqual(spoken, ["S D D uses JEE-rah.", "C L I uses T D D and PLAY-right."]);
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
