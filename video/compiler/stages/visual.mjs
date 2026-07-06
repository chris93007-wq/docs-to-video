import {runAiOrFallback} from "./ai-stage.mjs";
import {
  goldenExperienceProfile,
  visualPrimitiveByArcRole,
} from "../experience/goldenExperienceProfile.mjs";
import {hashValue} from "../utils.mjs";

const visualByArcRole = {
  hook: {
    metaphor: "Source documents drifting into a single control plane",
    visualType: "control-room",
    layout: "floating source documents forming a central operating surface",
    motionStyle: "morphingDocumentCloud",
    camera: "slow-push-in",
  },
  problem: {
    metaphor: "Fragile manual decisions tangled into a knot",
    visualType: "callout",
    layout: "drawn knot paths behind sparse decision cards",
    motionStyle: "svgPathDrawWithProgressiveCards",
    camera: "subtle-push-in",
  },
  pain: {
    metaphor: "Parallel lanes drifting without a safe merge point",
    visualType: "lanes",
    layout: "parallel work lanes with blockers and merge tension",
    motionStyle: "laneDriftAndProgressiveBlockers",
    camera: "pan-across-parallel-lanes",
  },
  solution: {
    metaphor: "A stateful run coordinating status, blockers, approvals, artifacts, and events",
    visualType: "network",
    layout: "central run node connected to durable state panels",
    motionStyle: "networkBuildWithConnectorDraw",
    camera: "slow-push-in",
  },
  "guided walkthrough": {
    metaphor: "A canonical workflow rail with evidence gates",
    visualType: "checkpoint-gate",
    layout: "horizontal workflow rail with late gate close-up",
    motionStyle: "railPathDrawAndGateReveal",
    camera: "track-left-to-right",
  },
  benefits: {
    metaphor: "Capability cards forming an evidence network",
    visualType: "chain",
    layout: "benefit cards with connected evidence readouts",
    motionStyle: "progressiveRevealWithMetricReadouts",
    camera: "subtle-push-in",
  },
  guardrails: {
    metaphor: "Guardrails catching drift and reconnecting evidence to source truth",
    visualType: "checkpoint-gate",
    layout: "scope boundary, approval checkpoint, drift marker, validation gate, and evidence chain",
    motionStyle: "gateStopsAndTraceabilityReconnect",
    camera: "track-through-guardrails",
  },
  "developer experience": {
    metaphor: "Codex prompt driving the same event-sourced runtime",
    visualType: "comparison",
    layout: "large Codex prompt beside runtime status, approval state, and evidence events",
    motionStyle: "promptTypeInApprovalPauseAndEventStream",
    camera: "subtle-dolly-down",
  },
  conclusion: {
    metaphor: "The evidence chain closes around the source of truth",
    visualType: "chain",
    layout: "compact traceability chain returning to the core idea",
    motionStyle: "chainClosureAndLogoPulse",
    camera: "slow-pull-back",
  },
};

const defaultVisual = {
  metaphor: "A structured concept map built from animated connectors",
  visualType: "network",
  layout: "centered network with focused callouts and drawn connectors",
  motionStyle: "networkBuildWithConnectorDraw",
  camera: "slow-push-in",
};

export const directVisuals = async ({storyPlan, semanticDocument}, {aiClient} = {}) =>
  runAiOrFallback({
    stageName: "visual",
    artifactName: "visual",
    input: {storyPlan, semanticDocument, experienceProfile: goldenExperienceProfile},
    aiClient,
    fallback: async () => ({
      kind: "VisualPlan",
      version: "1.0.0",
      sourceHash: hashValue({storyPlan, semanticDocument, experienceProfile: goldenExperienceProfile}),
      scenes: storyPlan.scenes.map((scene) => {
        const visual = scene.id === "guardrails" ? visualByArcRole.guardrails : visualByArcRole[scene.arcRole] ?? defaultVisual;
        const visualPrimitive =
          scene.id === "guardrails"
            ? "ValidationGate"
            : visualPrimitiveByArcRole[scene.arcRole] ??
              (scene.purpose.toLowerCase().includes("workflow") ? "AnimatedWorkflow" : "ConnectedNodeGraph");
        return {
          sceneId: scene.id,
          metaphor: visual.metaphor,
          visualPrimitive,
          visualType: visual.visualType,
          layout: visual.layout,
          motionStyle: visual.motionStyle,
          density: scene.arcRole === "conclusion" ? "medium" : "high",
          textDensity: "low",
          camera: visual.camera,
          emphasis: [
            scene.teachingPoint,
            ...scene.learningObjectives,
            ...(scene.arcRole === "developer experience"
              ? ["status", "resume", "approve", "artifacts"]
              : []),
          ].filter(Boolean).slice(0, 4),
          avoid: [
            "React component instructions",
            "free-form slides",
            "dense document excerpts",
            "title plus bullets",
            "static diagrams",
          ],
        };
      }),
    }),
  });
