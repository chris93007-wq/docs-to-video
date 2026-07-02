import {runAiOrFallback} from "./ai-stage.mjs";
import {hashValue, unique} from "../utils.mjs";

const cameraFor = (visualType) => {
  switch (visualType) {
    case "checkpoint-gate":
    case "pipeline":
      return "track-left-to-right";
    case "control-room":
    case "network":
      return "slow-push-in";
    case "lanes":
      return "pan-across-parallel-lanes";
    case "timeline":
      return "pan-to-final-state";
    default:
      return "steady-focus";
  }
};

const transitionFor = (index) =>
  index === 0 ? "fade-in-from-source" : "match-cut-from-previous-visual";

export const planAnimation = async (
  {storyPlan, visualPlan, assetManifest, narration},
  {aiClient} = {},
) =>
  runAiOrFallback({
    stageName: "animation",
    artifactName: "animation",
    input: {storyPlan, visualPlan, assetManifest, narration},
    aiClient,
    fallback: async () => ({
      kind: "AnimationPlan",
      version: "1.0.0",
      sourceHash: hashValue({storyPlan, visualPlan, assetManifest, narration}),
      scenes: storyPlan.scenes.map((scene, index) => {
        const visual = visualPlan.scenes.find((item) => item.sceneId === scene.id);
        const assets = assetManifest.assets.filter((asset) => asset.sceneId === scene.id);
        const step = Math.max(1.5, scene.durationSeconds / Math.max(assets.length + 1, 2));

        return {
          sceneId: scene.id,
          camera: cameraFor(visual?.visualType),
          layout: visual?.layout ?? "centered composition",
          transition: transitionFor(index),
          focus: unique([scene.teachingPoint, ...(visual?.emphasis ?? [])]).slice(0, 3),
          elements: assets.map((asset, assetIndex) => ({
            asset: asset.identifier,
            animation:
              asset.type === "background"
                ? "fade"
                : asset.type === "icon"
                  ? "pop"
                  : "draw",
            startSeconds: Number((assetIndex * step).toFixed(2)),
            durationSeconds: Number(Math.min(step + 1, scene.durationSeconds).toFixed(2)),
          })),
        };
      }),
    }),
  });
