import {goldenExperienceProfile} from "./goldenExperienceProfile";

const movingCameraPattern = /push|pan|track|rail|drift|zoom|dolly|orbit|tilt|pull|move/i;
const workflowPrimitives = new Set([
  "AnimatedWorkflow",
  "PipelineFlow",
  "TraceabilityChain",
  "ParallelLanes",
  "ValidationGate",
]);
const pathPrimitives = new Set([
  "AnimatedWorkflow",
  "PipelineFlow",
  "TraceabilityChain",
  "ApprovalGate",
  "ValidationGate",
  "DiagramReveal",
  "ConnectedNodeGraph",
  "PathDraw",
]);

const wordCount = (value: string) => value.split(/\s+/).filter(Boolean).length;
const genericShotCuePattern =
  /^(proof:|benefits$|canonical-workflow-workflow$|codex status\s*->|summary$|transition$)/i;
const genericShotRoles = new Set(["transition-bridge", "summary-payoff"]);

type ExperienceInputs = {
  storyPlan: {
    totalDurationSeconds: number;
    scenes: Array<{id: string; title: string; purpose: string; teachingPoint: string; learningObjectives?: string[]}>;
  };
  visualPlan: {
    scenes: Array<{sceneId: string; visualPrimitive?: string; layout?: string; emphasis?: string[]}>;
  };
  animationPlan: {
    scenes: Array<{
      sceneId: string;
      camera?: string;
      primaryAnimatedObject?: string;
      transitionIn?: string;
      transitionOut?: string;
      staticHoldSeconds?: number;
      elements?: Array<{animation: string}>;
    }>;
    shots?: Array<{
      shotId: string;
      sceneId: string;
      staticHoldSeconds?: number;
      animatedElements?: string[];
    }>;
  };
  shotPlan?: {
    shots: Array<{
      shotId: string;
      sceneId: string;
      durationSeconds: number;
      shotRole?: string;
      onScreenText?: string[];
      staticHoldSeconds?: number;
      justificationForLongShot?: string;
    }>;
  };
  mediaMixPlan?: {
    assignments: Array<{shotId: string; sceneId: string; mediaType: string}>;
  };
  editDecisionList?: {
    decisions: Array<{shotId: string; transition?: string; pacingRole?: string}>;
  };
  narration: {wordCount?: number; text?: string};
};

export const validateExperience = ({
  storyPlan,
  visualPlan,
  shotPlan,
  mediaMixPlan,
  animationPlan,
  editDecisionList,
  narration,
}: ExperienceInputs) => {
  const errors: string[] = [];
  const sceneCount = storyPlan.scenes.length;
  const runtimeSeconds = storyPlan.totalDurationSeconds;
  const shots = shotPlan?.shots ?? [];
  const mediaAssignments = mediaMixPlan?.assignments ?? [];
  const animationShots = animationPlan.shots ?? [];
  const editDecisions = editDecisionList?.decisions ?? [];
  const averageShotDurationSeconds = shots.length ? runtimeSeconds / shots.length : 0;
  const narrationWordCount = narration.wordCount ?? wordCount(narration.text ?? "");

  if (
    runtimeSeconds < goldenExperienceProfile.runtimeSeconds.min ||
    runtimeSeconds > goldenExperienceProfile.runtimeSeconds.max
  ) {
    errors.push(`Runtime must be 90-120s; got ${runtimeSeconds}s.`);
  }
  if (sceneCount < goldenExperienceProfile.scenes.min || sceneCount > goldenExperienceProfile.scenes.max) {
    errors.push(`Scene count must be 7-9; got ${sceneCount}.`);
  }
  if (
    narrationWordCount < goldenExperienceProfile.narration.minWords ||
    narrationWordCount > goldenExperienceProfile.narration.maxWords
  ) {
    errors.push(`Narration must be 220-300 words; got ${narrationWordCount}.`);
  }

  const diagnostics = storyPlan.scenes.map((scene) => {
    const visual = visualPlan.scenes.find((item) => item.sceneId === scene.id);
    const animation = animationPlan.scenes.find((item) => item.sceneId === scene.id);
    return {
      sceneId: scene.id,
      primitive: visual?.visualPrimitive,
      hasCameraMovement: movingCameraPattern.test(animation?.camera ?? ""),
      hasPathAnimation:
        pathPrimitives.has(visual?.visualPrimitive ?? "") ||
        (animation?.elements ?? []).some((element) => /path|draw|rail|connector|svg/i.test(element.animation)),
      hasWorkflowAnimation:
        workflowPrimitives.has(visual?.visualPrimitive ?? "") ||
        /workflow|pipeline|lane|gate|phase/i.test(scene.purpose),
      hasAnimationInstructions:
        Boolean(animation?.primaryAnimatedObject) &&
        Boolean(animation?.transitionIn) &&
        Boolean(animation?.transitionOut) &&
        (animation?.elements ?? []).length > 0,
      staticHoldSeconds: animation?.staticHoldSeconds ?? 0,
    };
  });

  for (const diagnostic of diagnostics) {
    if (!diagnostic.primitive) {
      errors.push(`Scene "${diagnostic.sceneId}" is missing visualPrimitive.`);
    }
    if (!diagnostic.hasAnimationInstructions) {
      errors.push(`Scene "${diagnostic.sceneId}" is missing rich animation instructions.`);
    }
    if (diagnostic.staticHoldSeconds > goldenExperienceProfile.animation.avoidStaticFramesLongerThanSeconds) {
      errors.push(`Scene "${diagnostic.sceneId}" is static too long.`);
    }
  }

  if (runtimeSeconds >= 90 && runtimeSeconds <= 120) {
    if (shots.length < 25 || shots.length > 45) {
      errors.push(`Shot count must be 25-45; got ${shots.length}.`);
    }
    if (averageShotDurationSeconds < 2 || averageShotDurationSeconds > 5) {
      errors.push(`Average shot duration must be 2-5s; got ${averageShotDurationSeconds.toFixed(2)}s.`);
    }
  }

  const mediaTypes = new Set(mediaAssignments.map((assignment) => assignment.mediaType));
  const mediaCounts = mediaAssignments.reduce<Record<string, number>>((counts, assignment) => {
    counts[assignment.mediaType] = (counts[assignment.mediaType] ?? 0) + 1;
    return counts;
  }, {});
  const genericCueCount = shots.filter((shot) =>
    (shot.onScreenText ?? []).some((text) => genericShotCuePattern.test(String(text).trim())),
  ).length;
  const genericRoleCount = shots.filter((shot) => genericShotRoles.has(shot.shotRole ?? "")).length;

  if (shots.length > 0 && mediaTypes.size < 4) {
    errors.push(`Media mix must include at least 4 media types; got ${mediaTypes.size}.`);
  }
  if ((mediaCounts.transition ?? 0) > 2) {
    errors.push(`Transition media should be rare inside set-piece rendering; got ${mediaCounts.transition} transition shots.`);
  }
  if (genericCueCount > 0) {
    errors.push(`Shot plan contains ${genericCueCount} generic on-screen cue(s).`);
  }
  if (genericRoleCount > Math.max(1, Math.floor(sceneCount / 4))) {
    errors.push(`Shot plan uses ${genericRoleCount} generic transition/payoff roles.`);
  }
  if (shots.length > 0 && editDecisions.length !== shots.length) {
    errors.push(`EDL must include one decision per shot; got ${editDecisions.length}/${shots.length}.`);
  }
  for (const shot of shots) {
    if (!shot.shotRole) {
      errors.push(`Shot "${shot.shotId}" is missing shotRole.`);
    }
    if (shot.durationSeconds > 7 && !shot.justificationForLongShot) {
      errors.push(`Shot "${shot.shotId}" is too long without justification.`);
    }
  }
  for (const animation of animationShots) {
    if ((animation.staticHoldSeconds ?? 0) > goldenExperienceProfile.animation.avoidStaticFramesLongerThanSeconds) {
      errors.push(`Shot animation "${animation.shotId}" is static too long.`);
    }
    if ((animation.animatedElements ?? []).length === 0) {
      errors.push(`Shot animation "${animation.shotId}" needs animated elements.`);
    }
  }

  return {
    passed: errors.length === 0,
    errors,
    metrics: {
      runtimeSeconds,
      sceneCount,
      shotCount: shots.length,
      averageShotDurationSeconds: Number(averageShotDurationSeconds.toFixed(2)),
      mediaTypeCount: mediaTypes.size,
      genericCueCount,
      genericRoleCount,
      transitionMediaCount: mediaCounts.transition ?? 0,
      narrationWordCount,
      cameraMoveCount: diagnostics.filter((diagnostic) => diagnostic.hasCameraMovement).length,
      pathAnimationSceneCount: diagnostics.filter((diagnostic) => diagnostic.hasPathAnimation).length,
      workflowAnimationSceneCount: diagnostics.filter((diagnostic) => diagnostic.hasWorkflowAnimation).length,
    },
  };
};
