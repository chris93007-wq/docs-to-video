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

const assetTypeForPrimitive = {
  AnimatedWorkflow: "diagram",
  PipelineFlow: "diagram",
  TraceabilityChain: "svg",
  ApprovalGate: "diagram",
  ArtifactRegistry: "architecture-graphic",
  ParallelLanes: "diagram",
  ValidationGate: "diagram",
  TerminalSequence: "terminal",
  DiagramReveal: "diagram",
  BenefitCards: "svg",
  FloatingDocumentCloud: "svg",
  ConnectedNodeGraph: "architecture-graphic",
  CameraRail: "background",
  PathDraw: "svg",
  ProgressiveHighlight: "svg",
  MorphingCardStack: "svg",
  SceneTransition: "background",
};

const assetForScene = (scene, visual) => {
  const base = slugify(scene.id, "scene");
  const visualType = visual?.visualType ?? "network";
  const visualPrimitive = visual?.visualPrimitive ?? "ConnectedNodeGraph";
  const primaryType =
    assetTypeForPrimitive[visualPrimitive] ??
    assetTypeForVisual[visualType] ??
    "diagram";

  return [
    {
      identifier: `${base}-${slugify(visualPrimitive)}`,
      sceneId: scene.id,
      type: primaryType,
      purpose: `Render ${scene.title} with ${visualPrimitive}: ${visual?.metaphor ?? "a structured visual"}.`,
      generationMethod: "deterministic-vector",
      reuseKey: visualPrimitive,
    },
    {
      identifier: `${base}-motion-accents`,
      sceneId: scene.id,
      type: primaryType === "terminal" ? "terminal" : "icon",
      purpose: `Animate secondary focus objects for ${scene.title}.`,
      generationMethod: "reuse-existing",
      reuseKey: `${visualPrimitive}-accents`,
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

const assetTypeForMedia = {
  "source-excerpt": "browser",
  "ui-mockup": "browser",
  terminal: "terminal",
  "workflow-animation": "diagram",
  diagram: "diagram",
  "metaphor-visual": "svg",
  "kinetic-text": "svg",
  "icon-card": "icon",
  transition: "background",
};

const shotAssetPurpose = {
  "source-excerpt": "Render a source-document closeup as a first-class proof shot.",
  "ui-mockup": "Render a product or browser proof shot as a first-class visual.",
  terminal: "Render a terminal/demo shot separately from workflow scenes.",
  "workflow-animation": "Render a workflow-wide shot with path and evidence trail elements.",
  diagram: "Render a diagram-build shot with progressive node and connector elements.",
  "metaphor-visual": "Render a metaphor visual for an abstract concept.",
  "kinetic-text": "Render a short kinetic title or emphasis shot.",
  "icon-card": "Render a focused callout insert for the shot.",
  transition: "Render a transition bridge between editorial beats.",
};

const assetForShot = (shot, media) => {
  const type = assetTypeForMedia[media.mediaType];
  if (!type) {
    return [];
  }

  return [
    {
      assetId: `${slugify(shot.shotId)}-${slugify(media.mediaType)}`,
      identifier: `${slugify(shot.shotId)}-${slugify(media.mediaType)}`,
      sceneId: shot.sceneId,
      shotId: shot.shotId,
      assetType: type,
      type,
      purpose: shotAssetPurpose[media.mediaType] ?? `Render ${media.mediaType} for ${shot.shotId}.`,
      reusable: media.mediaType === "transition" || media.mediaType === "metaphor-visual",
      generationMethod: "reuse-existing",
      reuseKey: media.mediaType,
    },
  ];
};

const shotAssets = ({shotPlan, mediaMixPlan}) => {
  if (!shotPlan || !mediaMixPlan) {
    return [];
  }

  return shotPlan.shots.flatMap((shot) => {
    const media = mediaMixPlan.assignments.find((item) => item.shotId === shot.shotId);
    return media ? assetForShot(shot, media) : [];
  });
};

export const planAssets = async ({semanticDocument, storyPlan, visualPlan, shotPlan, mediaMixPlan}, {aiClient} = {}) =>
  runAiOrFallback({
    stageName: "assets",
    artifactName: "assets",
    input: {semanticDocument, storyPlan, visualPlan, shotPlan, mediaMixPlan},
    aiClient,
    fallback: async () => {
      const assets = [
        ...storyPlan.scenes.flatMap((scene) =>
          assetForScene(
            scene,
            visualPlan.scenes.find((visual) => visual.sceneId === scene.id),
          ),
        ),
        ...shotAssets({shotPlan, mediaMixPlan}),
      ];

      const groups = assets.reduce((acc, asset) => {
        acc.set(asset.reuseKey, [...(acc.get(asset.reuseKey) ?? []), asset.identifier]);
        return acc;
      }, new Map());

      return {
        kind: "AssetManifest",
        version: "1.0.0",
        sourceHash: hashValue({semanticDocument, storyPlan, visualPlan, shotPlan, mediaMixPlan}),
        assets,
        reuseOpportunities: [...groups.entries()]
          .filter(([, identifiers]) => identifiers.length > 1)
          .map(([reuseKey, identifiers]) => ({reuseKey, identifiers})),
      };
    },
  });
