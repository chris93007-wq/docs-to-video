import assert from "node:assert/strict";
import {mkdtempSync} from "node:fs";
import os from "node:os";
import path from "node:path";
import {test} from "node:test";
import {runPipeline} from "../compiler/pipeline.mjs";
import {RemotionRenderer} from "../compiler/renderers/remotion-renderer.mjs";
import {MotionCanvasRenderer} from "../compiler/renderers/motion-canvas-renderer.mjs";

const samplePath = path.resolve("test/fixtures/sample.md");

test("renderer adapters consume compiler artifacts without calling AI", async () => {
  const artifactDir = mkdtempSync(path.join(os.tmpdir(), "doc-video-renderer-"));
  const pipeline = await runPipeline({
    sourcePath: samplePath,
    artifactDir,
    aiClient: {enabled: false},
    targetStage: "animation",
    silent: true,
  });

  const inputs = {
    storyPlan: pipeline.story,
    visualPlan: pipeline.visual,
    animationPlan: pipeline.animation,
    narration: pipeline.narration,
    assetManifest: pipeline.assets,
  };

  const remotion = await new RemotionRenderer().render(inputs, {
    artifactDir,
    writeGenerated: false,
  });
  const motionCanvas = await new MotionCanvasRenderer().render(inputs, {artifactDir});

  assert.equal(remotion.renderer, "remotion");
  assert.equal(motionCanvas.renderer, "motion-canvas");
  assert.equal(remotion.scenes.length, pipeline.story.scenes.length);
});
