import {runAiOrFallback} from "./ai-stage.mjs";
import {goldenExperienceProfile} from "../experience/goldenExperienceProfile.mjs";
import {hashValue, slugify, unique} from "../utils.mjs";

const rolePurpose = {
  "emotional-hook": "Open the scene with the audience tension or promise.",
  "kinetic-title": "Briefly emphasize the scene idea without becoming a title slide.",
  "source-document-closeup": "Cut to a source-backed proof point from the document.",
  "workflow-wide": "Show the system or workflow at a readable wide angle.",
  "diagram-build": "Build the mechanism that makes the idea concrete.",
  "product-ui-proof": "Show a product or UI proof beat instead of another abstract diagram.",
  "terminal-demo": "Show a terminal or command-driven proof beat.",
  "callout-insert": "Insert a focused callout that clarifies the current point.",
  comparison: "Compare the before and after states.",
  "transition-bridge": "Bridge the current idea into the next scene.",
  "summary-payoff": "Close the scene with the takeaway that bridges to the next beat.",
  "metaphor-visual": "Represent the abstract idea with a concrete visual metaphor.",
};

const roleFraming = {
  "emotional-hook": "hero",
  "kinetic-title": "medium",
  "source-document-closeup": "closeup",
  "workflow-wide": "wide",
  "diagram-build": "medium",
  "product-ui-proof": "split-screen",
  "terminal-demo": "closeup",
  "callout-insert": "macro",
  comparison: "split-screen",
  "transition-bridge": "wide",
  "summary-payoff": "hero",
  "metaphor-visual": "wide",
};

const roleCamera = {
  "emotional-hook": "push-in",
  "kinetic-title": "match-cut",
  "source-document-closeup": "zoom-to-detail",
  "workflow-wide": "track",
  "diagram-build": "push-in",
  "product-ui-proof": "push-in",
  "terminal-demo": "pan-right",
  "callout-insert": "zoom-to-detail",
  comparison: "pan-left",
  "transition-bridge": "match-cut",
  "summary-payoff": "pull-back",
  "metaphor-visual": "parallax",
};

const roleSequenceForScene = (scene) => {
  if (scene.id === "guardrails") {
    return ["diagram-build", "source-document-closeup", "product-ui-proof", "workflow-wide"];
  }

  switch (scene.arcRole) {
    case "hook":
      return ["kinetic-title", "source-document-closeup", "metaphor-visual"];
    case "problem":
      return ["emotional-hook", "comparison", "source-document-closeup", "diagram-build"];
    case "solution":
      return ["metaphor-visual", "diagram-build", "product-ui-proof", "callout-insert"];
    case "guided walkthrough":
      return ["workflow-wide", "diagram-build", "source-document-closeup", "product-ui-proof", "workflow-wide"];
    case "benefits":
      return ["metaphor-visual", "product-ui-proof", "callout-insert", "diagram-build"];
    case "developer experience":
      return ["product-ui-proof", "terminal-demo", "source-document-closeup", "diagram-build"];
    case "conclusion":
      return ["metaphor-visual", "source-document-closeup", "kinetic-title"];
    default:
      return ["metaphor-visual", "diagram-build", "product-ui-proof"];
  }
};

const allSemanticConcepts = (semanticDocument) =>
  [
    ...(semanticDocument?.concepts ?? []),
    ...(semanticDocument?.workflows ?? []),
    ...(semanticDocument?.systems ?? []),
    ...(semanticDocument?.actors ?? []),
  ];

const evidenceForScene = (scene, semanticDocument) => {
  const conceptById = new Map(allSemanticConcepts(semanticDocument).map((concept) => [concept.id, concept]));
  return unique(
    scene.sourceConceptIds.flatMap((conceptId) => {
      const concept = conceptById.get(conceptId);
      return [
        conceptId,
        concept?.name,
        ...(concept?.evidence ?? []),
      ];
    }),
  );
};

const splitDurations = (durationSeconds, shotCount) => {
  const base = Number((durationSeconds / shotCount).toFixed(2));
  const durations = Array.from({length: shotCount}, () => base);
  const assigned = durations.slice(0, -1).reduce((total, duration) => total + duration, 0);
  durations[durations.length - 1] = Number(Math.max(1, durationSeconds - assigned).toFixed(2));
  return durations;
};

const sourceCueByArcRole = {
  hook: "Source of Truth",
  problem: "Approval Boundaries",
  solution: "Stateful Workflow",
  "guided walkthrough": "Validation Gates",
  benefits: "Evidence Trail",
  guardrails: "Approval Boundaries",
  "developer experience": "Resumable Execution",
  conclusion: "Try SDD Orchestrator on Your Next Feature",
};

const productCueByArcRole = {
  hook: "Specs as the Control Plane",
  problem: "Manual Steps Lose Context",
  solution: "Run State Owns Status, Blockers, Approvals, Artifacts, and Events",
  "guided walkthrough": "Requirements -> Design -> Plan -> TDD Unit Tests -> Implementation -> Playwright -> Lifecycle",
  benefits: "Lower Cognitive Load, Stronger Traceability, Safer Fan-Out",
  guardrails: "Scope Boundary -> Approval Checkpoint -> Drift Detection -> Validation Gate -> Evidence Chain",
  "developer experience": "Codex Starts, Pauses, Resumes, and Summarizes the Run",
  conclusion: "Try It, Then Improve the Workflow",
};

const shotTextCue = ({role, scene, evidence}) => {
  const cueKey = scene.id === "guardrails" ? "guardrails" : scene.arcRole;
  if (role === "source-document-closeup") {
    return sourceCueByArcRole[cueKey] ?? evidence.find((item) => item && item !== scene.id) ?? scene.teachingPoint;
  }
  if (role === "product-ui-proof") {
    return productCueByArcRole[cueKey] ?? scene.teachingPoint;
  }
  if (role === "terminal-demo") {
    return "Run SDD for RX-13603 in pharmacy-ui";
  }
  if (role === "callout-insert" || role === "kinetic-title") {
    return scene.teachingPoint;
  }
  return scene.title;
};

const buildShotsForScene = ({scene, visual, semanticDocument, orderOffset}) => {
  const roles = roleSequenceForScene(scene);
  const durations = splitDurations(scene.durationSeconds, roles.length);
  const evidence = evidenceForScene(scene, semanticDocument);
  let cursor = 0;

  return roles.map((role, index) => {
    const durationSeconds = durations[index];
    const startSeconds = Number(cursor.toFixed(2));
    cursor = Number((cursor + durationSeconds).toFixed(2));
    const shotId = `${scene.id}-shot-${String(index + 1).padStart(2, "0")}`;
    const previousShotId = index > 0 ? `${scene.id}-shot-${String(index).padStart(2, "0")}` : "";
    const nextShotId = index < roles.length - 1 ? `${scene.id}-shot-${String(index + 2).padStart(2, "0")}` : "";
    const textCue = shotTextCue({role, scene, evidence});

    return {
      shotId,
      sceneId: scene.id,
      order: orderOffset + index,
      startSeconds,
      durationSeconds,
      shotRole: role,
      purpose: rolePurpose[role],
      visualIntent: `${visual?.visualPrimitive ?? "ConnectedNodeGraph"}: ${visual?.metaphor ?? scene.teachingPoint}`,
      sourceConceptIds: scene.sourceConceptIds,
      framing: roleFraming[role],
      camera: roleCamera[role],
      continuity: {
        entersFrom: previousShotId,
        exitsTo: nextShotId,
        connectsToShotId: nextShotId,
        visualMotif: visual?.metaphor ?? scene.arcRole,
      },
      onScreenText: textCue ? [textCue].slice(0, 1) : [],
      staticHoldSeconds: 0.4,
      ...(durationSeconds > 7
        ? {justificationForLongShot: "Scene duration requires a longer shot while staying under the editorial target."}
        : {}),
    };
  });
};

export const planShots = async ({storyPlan, visualPlan, semanticDocument}, {aiClient} = {}) =>
  runAiOrFallback({
    stageName: "shots",
    artifactName: "shots",
    input: {storyPlan, visualPlan, semanticDocument, experienceProfile: goldenExperienceProfile},
    aiClient,
    fallback: async () => {
      let order = 0;
      const shots = storyPlan.scenes.flatMap((scene) => {
        const sceneShots = buildShotsForScene({
          scene,
          visual: visualPlan.scenes.find((item) => item.sceneId === scene.id),
          semanticDocument,
          orderOffset: order,
        });
        order += sceneShots.length;
        return sceneShots;
      });

      return {
        kind: "ShotPlan",
        version: "1.0.0",
        sourceHash: hashValue({storyPlan, visualPlan, semanticDocument, experienceProfile: goldenExperienceProfile}),
        documentSlug: slugify(semanticDocument?.title ?? "document"),
        targetRuntimeSeconds: storyPlan.totalDurationSeconds,
        targetShotCount: Math.min(45, Math.max(25, shots.length)),
        shots,
      };
    },
  });
