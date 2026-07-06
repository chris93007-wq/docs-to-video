import {runAiOrFallback} from "./ai-stage.mjs";
import {goldenExperienceProfile} from "../experience/goldenExperienceProfile.mjs";
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
      return "subtle-push-in";
  }
};

const transitionFor = (index) =>
  index === 0 ? "fade-in-from-source" : "match-cut-from-previous-visual";

const pathHeavyPrimitives = new Set([
  "AnimatedWorkflow",
  "PipelineFlow",
  "TraceabilityChain",
  "ApprovalGate",
  "ValidationGate",
  "DiagramReveal",
  "ConnectedNodeGraph",
  "PathDraw",
]);

const animationForAsset = (asset, visualPrimitive) => {
  if (asset.type === "background") {
    return "ambient-grid-drift";
  }
  if (asset.type === "terminal" || visualPrimitive === "TerminalSequence") {
    return "terminal-type-in";
  }
  if (pathHeavyPrimitives.has(visualPrimitive)) {
    return "svg-path-draw-and-progressive-highlight";
  }
  if (visualPrimitive === "BenefitCards") {
    return "card-rise-and-readout-fill";
  }
  if (visualPrimitive === "ParallelLanes") {
    return "lane-drift-and-blocker-reveal";
  }
  if (visualPrimitive === "FloatingDocumentCloud" || visualPrimitive === "MorphingCardStack") {
    return "morphing-progressive-reveal";
  }
  return "progressive-reveal";
};

const animationForShotMedia = (mediaType, visualPrimitive) => {
  switch (mediaType) {
    case "source-excerpt":
      return "document-highlight-scan";
    case "ui-mockup":
      return "browser-proof-zoom";
    case "terminal":
      return "terminal-type-in";
    case "workflow-animation":
      return "workflow-rail-follow";
    case "icon-card":
      return "callout-pop-and-highlight";
    case "transition":
      return "payoff-hold-and-bridge";
    case "metaphor-visual":
      return "metaphor-parallax-reveal";
    case "kinetic-text":
      return "kinetic-text-snap";
    default:
      return pathHeavyPrimitives.has(visualPrimitive)
        ? "svg-path-draw-and-progressive-highlight"
        : "progressive-reveal";
  }
};

const secondaryMotionForMedia = (mediaType, visualPrimitive) => {
  switch (mediaType) {
    case "source-excerpt":
      return ["highlight important phrase", "lift phrase into concept label"];
    case "ui-mockup":
      return ["highlight active panel", "animate status update"];
    case "terminal":
      return ["type command", "reveal output lines"];
    case "workflow-animation":
      return ["draw path", "highlight current phase"];
    case "diagram":
      return ["enter nodes", "draw connectors"];
    case "icon-card":
      return ["pop callout card", "pulse icon"];
    case "transition":
      return ["carry motif forward", "fade bridge"];
    default:
      return pathHeavyPrimitives.has(visualPrimitive)
        ? ["draw connector path", "progressively highlight nodes"]
        : ["progressive reveal"];
  }
};

const soundCueForMedia = (mediaType) => {
  switch (mediaType) {
    case "source-excerpt":
      return "soft-hit";
    case "ui-mockup":
      return "ui-click";
    case "terminal":
      return "terminal-tick";
    case "workflow-animation":
    case "diagram":
      return "path-draw";
    case "transition":
      return "transition-rise";
    default:
      return "none";
  }
};

export const planAnimation = async (
  {storyPlan, visualPlan, assetManifest, narration, shotPlan, mediaMixPlan},
  {aiClient} = {},
) =>
  runAiOrFallback({
    stageName: "animation",
    artifactName: "animation",
    input: {storyPlan, visualPlan, assetManifest, narration, shotPlan, mediaMixPlan, experienceProfile: goldenExperienceProfile},
    aiClient,
    fallback: async () => {
      const scenes = storyPlan.scenes.map((scene, index) => {
        const visual = visualPlan.scenes.find((item) => item.sceneId === scene.id);
        const assets = assetManifest.assets.filter((asset) => asset.sceneId === scene.id);
        const visualPrimitive = visual?.visualPrimitive ?? "ConnectedNodeGraph";
        const step = Math.max(1.5, scene.durationSeconds / Math.max(assets.length + 1, 2));
        const focus = unique([scene.teachingPoint, ...(visual?.emphasis ?? [])]).slice(0, 3);
        const primaryAsset = assets.find((asset) => asset.type !== "background") ?? assets[0];

        return {
          sceneId: scene.id,
          camera: visual?.camera ?? cameraFor(visual?.visualType),
          layout: visual?.layout ?? "centered composition",
          transition: transitionFor(index),
          transitionIn: index === 0 ? "soft-fade-and-scale-in" : "match-cut-with-motion-continuity",
          transitionOut:
            index === storyPlan.scenes.length - 1
              ? "brand-mark-fade-to-white"
              : "motion-blur-crossfade",
          primaryAnimatedObject: primaryAsset?.identifier ?? `${scene.id}-primary-visual`,
          secondaryAnimatedObjects: assets
            .filter((asset) => asset.identifier !== primaryAsset?.identifier)
            .map((asset) => asset.identifier),
          progressiveReveal: focus.map((label, focusIndex) => ({
            label,
            startSeconds: Number(Math.min(scene.durationSeconds - 1, 1 + focusIndex * 2.1).toFixed(2)),
            durationSeconds: Number(Math.min(2.6, scene.durationSeconds / 3).toFixed(2)),
          })),
          focus,
          staticHoldSeconds: 0.8,
          requiresPathAnimation: pathHeavyPrimitives.has(visualPrimitive),
          requiresCameraMovement: true,
          elements: assets.map((asset, assetIndex) => ({
            asset: asset.identifier,
            animation: animationForAsset(asset, visualPrimitive),
            startSeconds: Number((assetIndex * step).toFixed(2)),
            durationSeconds: Number(Math.min(step + 1, scene.durationSeconds).toFixed(2)),
          })),
        };
      });

      const shotAnimations = (shotPlan?.shots ?? []).map((shot) => {
        const visual = visualPlan.scenes.find((item) => item.sceneId === shot.sceneId);
        const visualPrimitive = visual?.visualPrimitive ?? "ConnectedNodeGraph";
        const media = mediaMixPlan?.assignments?.find((item) => item.shotId === shot.shotId);
        const shotSpecificAssets = assetManifest.assets.filter((asset) => asset.shotId === shot.shotId);
        const sceneAssets = assetManifest.assets.filter((asset) => asset.sceneId === shot.sceneId && !asset.shotId);
        const primaryAsset = shotSpecificAssets[0] ?? sceneAssets.find((asset) => asset.type !== "background") ?? sceneAssets[0];
        const secondaryAssets = [
          ...shotSpecificAssets.slice(1),
          ...sceneAssets.filter((asset) => asset.identifier !== primaryAsset?.identifier).slice(0, 2),
        ];
        const mediaType = media?.mediaType ?? "diagram";
        const animation = animationForShotMedia(mediaType, visualPrimitive);

        return {
          shotId: shot.shotId,
          sceneId: shot.sceneId,
          primaryMotion: animation,
          secondaryMotion: secondaryMotionForMedia(mediaType, visualPrimitive),
          cameraMove: shot.camera,
          transitionIn: mediaType === "source-excerpt" ? "cut-to-closeup" : "match-cut-in",
          transitionOut: shot.shotRole === "summary-payoff" ? "bridge-out" : "cut-out",
          staticHoldSeconds: 0.4,
          animatedElements: unique([
            primaryAsset?.identifier ?? `${shot.shotId}-primary-visual`,
            ...secondaryAssets.map((asset) => asset.identifier),
          ]),
          soundCue: soundCueForMedia(mediaType),
        };
      });

      return {
        kind: "AnimationPlan",
        version: "1.0.0",
        sourceHash: hashValue({
          storyPlan,
          visualPlan,
          assetManifest,
          narration,
          shotPlan,
          mediaMixPlan,
          experienceProfile: goldenExperienceProfile,
        }),
        scenes,
        shots: shotAnimations,
      };
    },
  });
