import assert from "node:assert/strict";
import {mkdtempSync} from "node:fs";
import os from "node:os";
import path from "node:path";
import {test} from "node:test";
import {runPipeline} from "../compiler/pipeline.mjs";
import {testNarrationSynthesize} from "./helpers/narration-audio.mjs";
import {RemotionRenderer, resolveRenderOutput} from "../compiler/renderers/remotion-renderer.mjs";
import {MotionCanvasRenderer} from "../compiler/renderers/motion-canvas-renderer.mjs";

const samplePath = path.resolve("test/fixtures/sample.md");

test("renderer adapters consume compiler artifacts without calling AI", async () => {
  const artifactDir = mkdtempSync(path.join(os.tmpdir(), "doc-video-renderer-"));
  const pipeline = await runPipeline({
    sourcePath: samplePath,
    artifactDir,
    aiClient: {enabled: false},
    narrationSynthesize: testNarrationSynthesize,
    rendererName: "motion-canvas",
    targetStage: "render",
    silent: true,
  });

  const sceneOnlyInputs = {
    storyPlan: pipeline.story,
    visualPlan: pipeline.visual,
    animationPlan: pipeline.animation,
    narration: pipeline.narration,
    narrationAudio: pipeline.narrationAudio,
    assetManifest: pipeline.assets,
  };
  const shotInputs = {
    ...sceneOnlyInputs,
    shotPlan: pipeline.shots,
    mediaMixPlan: pipeline.mediaMix,
    editDecisionList: pipeline.edit,
  };

  const remotion = await new RemotionRenderer().render(shotInputs, {
    artifactDir,
    writeGenerated: false,
  });
  const sceneFallback = await new RemotionRenderer().render(sceneOnlyInputs, {
    artifactDir,
    writeGenerated: false,
  });
  const motionCanvas = await new MotionCanvasRenderer().render(shotInputs, {artifactDir});

  assert.equal(remotion.renderer, "remotion");
  assert.equal(motionCanvas.renderer, "motion-canvas");
  assert.equal(remotion.scenes.length, pipeline.story.scenes.length);
  assert.equal(remotion.shots.length, pipeline.shots.shots.length);
  assert.equal(remotion.edl.decisions.length, pipeline.edit.decisions.length);
  assert.equal(remotion.narrationAudio.segments.length, pipeline.story.scenes.length);
  assert.equal(sceneFallback.scenes.length, pipeline.story.scenes.length);
  assert.equal(sceneFallback.shots, undefined);
});

test("Remotion renderer resolves versioned title-based output paths", () => {
  const first = resolveRenderOutput({
    title: "SDD Orchestrator: Making SDD Easier to Run",
    history: {renders: []},
  });
  const second = resolveRenderOutput({
    title: "SDD Orchestrator: Making SDD Easier to Run",
    history: {renders: [{slug: first.slug, version: first.version}]},
  });
  const explicit = resolveRenderOutput({
    title: "SDD Orchestrator",
    version: "review cut 2",
    outputPath: "out/custom-review.mp4",
    history: {renders: []},
  });

  assert.equal(first.slug, "sdd-orchestrator-making-sdd-easier-to-run");
  assert.equal(first.version, "v001");
  assert.match(first.outputPath, /sdd-orchestrator-making-sdd-easier-to-run-v001\.mp4$/);
  assert.equal(second.version, "v002");
  assert.equal(explicit.version, "review-cut-2");
  assert.match(explicit.outputPath, /out\/custom-review\.mp4$/);
});
