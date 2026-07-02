import assert from "node:assert/strict";
import {mkdtempSync, statSync} from "node:fs";
import os from "node:os";
import path from "node:path";
import {test} from "node:test";
import {runPipeline} from "../compiler/pipeline.mjs";

const samplePath = path.resolve("test/fixtures/sample.md");

test("pipeline reuses stage artifacts when input hash is unchanged", async () => {
  const artifactDir = mkdtempSync(path.join(os.tmpdir(), "doc-video-cache-"));

  await runPipeline({
    sourcePath: samplePath,
    artifactDir,
    aiClient: {enabled: false},
    targetStage: "semantic",
    silent: true,
  });
  const firstMtime = statSync(path.join(artifactDir, "semantic-document.json")).mtimeMs;

  await runPipeline({
    sourcePath: samplePath,
    artifactDir,
    aiClient: {enabled: false},
    targetStage: "semantic",
    silent: true,
  });
  const secondMtime = statSync(path.join(artifactDir, "semantic-document.json")).mtimeMs;

  assert.equal(secondMtime, firstMtime);
});
