import assert from "node:assert/strict";
import {mkdtempSync} from "node:fs";
import os from "node:os";
import path from "node:path";
import {test} from "node:test";
import {runPipeline} from "../compiler/pipeline.mjs";
import {testNarrationSynthesize} from "./helpers/narration-audio.mjs";

const fixturePath = path.resolve("fixtures/sdd-orchestrator.md");

test("SDD Orchestrator fixture compiles to the golden experience profile", async () => {
  const artifactDir = mkdtempSync(path.join(os.tmpdir(), "doc-video-experience-"));
  const result = await runPipeline({
    sourcePath: fixturePath,
    artifactDir,
    aiClient: {enabled: false},
    narrationSynthesize: testNarrationSynthesize,
    targetStage: "validate-experience",
    silent: true,
  });

  assert.equal(result.experience.passed, true);
  assert.equal(result.experience.metrics.runtimeSeconds, 105);
  assert.equal(result.experience.metrics.sceneCount, 7);
  assert.ok(result.experience.metrics.narrationWordCount >= 220);
  assert.ok(result.experience.metrics.narrationWordCount <= 300);
  assert.ok(result.experience.metrics.workflowAnimationSceneCount >= 1);
  assert.ok(result.experience.metrics.pathAnimationSceneCount >= 1);
  assert.ok(result.experience.metrics.terminalAnimationSceneCount >= 1);
  assert.equal(result.experience.metrics.shotCount, 27);
  assert.ok(result.experience.metrics.averageShotDurationSeconds >= 2);
  assert.ok(result.experience.metrics.averageShotDurationSeconds <= 5);
  assert.ok(result.experience.metrics.mediaTypeCount >= 4);
  assert.ok(result.experience.metrics.sourceExcerptShotCount >= 1);
  assert.ok(result.experience.metrics.uiMockupShotCount >= 1);
  assert.ok(result.experience.metrics.terminalShotCount >= 1);
  assert.ok(result.experience.metrics.workflowShotCount >= 1);
  for (const scene of result.story.scenes) {
    const sceneShotCount = result.shots.shots.filter((shot) => shot.sceneId === scene.id).length;
    assert.ok(sceneShotCount >= 3);
    assert.ok(sceneShotCount <= 6);
  }
  assert.deepEqual(
    result.visual.scenes.map((scene) => scene.visualPrimitive),
    [
      "FloatingDocumentCloud",
      "PathDraw",
      "ConnectedNodeGraph",
      "TerminalSequence",
      "AnimatedWorkflow",
      "ValidationGate",
      "TraceabilityChain",
    ],
  );
});
