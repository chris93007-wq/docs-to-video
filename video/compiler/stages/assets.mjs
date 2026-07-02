import {runAiOrFallback} from "./ai-stage.mjs";
import {hashValue, slugify} from "../utils.mjs";

const assetTypeForVisual = {
  "checkpoint-gate": "diagram",
  pipeline: "diagram",
  chain: "svg",
  "control-room": "architecture-graphic",
  lanes: "diagram",
  timeline: "diagram",
  graph: "diagram",
  network: "architecture-graphic",
  stack: "architecture-graphic",
  comparison: "diagram",
  callout: "illustration",
};

const assetForScene = (scene, visual) => {
  const base = slugify(scene.id, "scene");
  const visualType = visual?.visualType ?? "network";
  const primaryType = assetTypeForVisual[visualType] ?? "diagram";

  return [
    {
      identifier: `${base}-${visualType}`,
      sceneId: scene.id,
      type: primaryType,
      purpose: `Represent ${scene.title} as ${visual?.metaphor ?? "a structured visual"}.`,
      generationMethod: "deterministic-vector",
      reuseKey: visualType,
    },
    {
      identifier: `${base}-focus-icon`,
      sceneId: scene.id,
      type: "icon",
      purpose: `Mark the focal teaching point for ${scene.title}.`,
      generationMethod: "reuse-existing",
      reuseKey: "compiler-focus-icon",
    },
    {
      identifier: `${base}-background-grid`,
      sceneId: scene.id,
      type: "background",
      purpose: "Provide a quiet technical canvas behind the scene.",
      generationMethod: "reuse-existing",
      reuseKey: "technical-grid",
    },
  ];
};

export const planAssets = async ({storyPlan, visualPlan}, {aiClient} = {}) =>
  runAiOrFallback({
    stageName: "assets",
    artifactName: "assets",
    input: {storyPlan, visualPlan},
    aiClient,
    fallback: async () => {
      const assets = storyPlan.scenes.flatMap((scene) =>
        assetForScene(
          scene,
          visualPlan.scenes.find((visual) => visual.sceneId === scene.id),
        ),
      );

      const groups = assets.reduce((acc, asset) => {
        acc.set(asset.reuseKey, [...(acc.get(asset.reuseKey) ?? []), asset.identifier]);
        return acc;
      }, new Map());

      return {
        kind: "AssetManifest",
        version: "1.0.0",
        sourceHash: hashValue({storyPlan, visualPlan}),
        assets,
        reuseOpportunities: [...groups.entries()]
          .filter(([, identifiers]) => identifiers.length > 1)
          .map(([reuseKey, identifiers]) => ({reuseKey, identifiers})),
      };
    },
  });
