import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {mkdtempSync} from "node:fs";
import os from "node:os";
import path from "node:path";
import {test} from "node:test";
import {runPipeline} from "../compiler/pipeline.mjs";
import {testNarrationSynthesize} from "./helpers/narration-audio.mjs";

const samplePath = path.resolve("test/fixtures/sample.md");
const readGolden = (name) =>
  JSON.parse(readFileSync(path.resolve("test/golden", name), "utf8"));

test("golden summaries remain stable for deterministic compiler stages", async () => {
  const artifactDir = mkdtempSync(path.join(os.tmpdir(), "doc-video-golden-"));
  const result = await runPipeline({
    sourcePath: samplePath,
    artifactDir,
    aiClient: {enabled: false},
    narrationSynthesize: testNarrationSynthesize,
    targetStage: "animation",
    silent: true,
  });

  assert.deepEqual(
    {
      kind: result.semantic.kind,
      title: result.semantic.title,
      conceptNames: result.semantic.concepts.map((concept) => concept.name),
      workflowNames: result.semantic.workflows.map((workflow) => workflow.name),
      architecture: result.semantic.architecture,
      keyMessageCount: result.semantic.keyMessages.length,
    },
    readGolden("semantic.summary.json"),
  );

  assert.deepEqual(
    {
      kind: result.story.kind,
      narrativeArc: result.story.narrativeArc,
      totalDurationSeconds: result.story.totalDurationSeconds,
      sceneIds: result.story.scenes.map((scene) => scene.id),
    },
    readGolden("story.summary.json"),
  );

  assert.deepEqual(
    {
      kind: result.visual.kind,
      visualTypes: result.visual.scenes.map((scene) => scene.visualType),
      visualPrimitives: result.visual.scenes.map((scene) => scene.visualPrimitive),
    },
    readGolden("visual.summary.json"),
  );

  assert.deepEqual(
    {
      kind: result.animation.kind,
      cameras: result.animation.scenes.map((scene) => scene.camera),
    },
    readGolden("animation.summary.json"),
  );
});
