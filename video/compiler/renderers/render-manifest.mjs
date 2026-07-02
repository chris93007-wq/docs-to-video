import {hashValue} from "../utils.mjs";
import {assertValidArtifact} from "../schemas.mjs";

export const buildRenderManifest = ({
  renderer,
  storyPlan,
  visualPlan,
  animationPlan,
  narration,
  assetManifest,
}) => {
  let cursor = 0;
  const scenes = storyPlan.scenes.map((scene) => {
    const startSeconds = cursor;
    cursor += scene.durationSeconds;

    return {
      id: scene.id,
      title: scene.title,
      purpose: scene.purpose,
      teachingPoint: scene.teachingPoint,
      startSeconds,
      durationSeconds: scene.durationSeconds,
      visual: visualPlan.scenes.find((visual) => visual.sceneId === scene.id),
      assets: assetManifest.assets.filter((asset) => asset.sceneId === scene.id),
      animation: animationPlan.scenes.find((animation) => animation.sceneId === scene.id),
      narration: narration.segments.find((segment) => segment.sceneId === scene.id),
    };
  });

  return assertValidArtifact("render", {
    kind: "RenderManifest",
    version: "1.0.0",
    renderer,
    sourceHash: hashValue({storyPlan, visualPlan, animationPlan, narration, assetManifest}),
    fps: 30,
    width: 1920,
    height: 1080,
    totalDurationSeconds: storyPlan.totalDurationSeconds,
    scenes,
    narration,
  });
};
