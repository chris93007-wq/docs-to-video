import {hashValue, wordCount} from "../utils.mjs";
import {goldenExperienceProfile} from "./goldenExperienceProfile.mjs";

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
const terminalPrimitives = new Set(["TerminalSequence"]);
const slideLayouts = /bullet|slide|title\s*\+\s*bullets|presentation|static/i;
const commandPattern = /\b(npm|pnpm|yarn|git|codex|curl|node|npx|approve|resume|status|auto-run)\b|--[a-z-]+|\$ /i;
const genericShotCuePattern =
  /^(proof:|benefits$|canonical-workflow-workflow$|codex status\s*->|summary$|transition$)/i;
const genericShotRoles = new Set(["transition-bridge", "summary-payoff"]);

const sceneTextLoad = (scene) => {
  const fields = [
    scene.title,
    scene.purpose,
    scene.teachingPoint,
    ...(scene.learningObjectives ?? []),
  ];
  return wordCount(fields.filter(Boolean).join(" "));
};

const documentContainsCommands = (documentAst) => {
  if (!documentAst?.sections) {
    return false;
  }

  return documentAst.sections.some((section) =>
    section.blocks?.some((block) => {
      if (block.type === "code" && commandPattern.test(block.text ?? "")) {
        return true;
      }
      return commandPattern.test(block.text ?? (block.items ?? []).join(" "));
    }),
  );
};

export const validateExperience = ({
  storyPlan,
  visualPlan,
  shotPlan,
  mediaMixPlan,
  animationPlan,
  editDecisionList,
  narration,
  documentAst,
  profile = goldenExperienceProfile,
} = {}) => {
  const errors = [];
  const warnings = [];
  const storyScenes = storyPlan?.scenes ?? [];
  const visualScenes = visualPlan?.scenes ?? [];
  const animationScenes = animationPlan?.scenes ?? [];
  const animationShots = animationPlan?.shots ?? [];
  const shots = shotPlan?.shots ?? [];
  const mediaAssignments = mediaMixPlan?.assignments ?? [];
  const editDecisions = editDecisionList?.decisions ?? [];
  const runtimeSeconds = storyPlan?.totalDurationSeconds ?? 0;
  const sceneCount = storyScenes.length;
  const averageSceneDurationSeconds = sceneCount > 0 ? runtimeSeconds / sceneCount : 0;
  const averageShotDurationSeconds = shots.length > 0 ? runtimeSeconds / shots.length : 0;
  const narrationWordCount = narration?.wordCount ?? wordCount(narration?.text ?? "");
  const commandsInSource = documentContainsCommands(documentAst);

  const visualFor = (sceneId) => visualScenes.find((scene) => scene.sceneId === sceneId);
  const animationFor = (sceneId) => animationScenes.find((scene) => scene.sceneId === sceneId);

  if (runtimeSeconds < profile.runtimeSeconds.min || runtimeSeconds > profile.runtimeSeconds.max) {
    errors.push(
      `Runtime must be ${profile.runtimeSeconds.min}-${profile.runtimeSeconds.max}s; got ${runtimeSeconds}s.`,
    );
  }

  if (sceneCount < profile.scenes.min || sceneCount > profile.scenes.max) {
    errors.push(`Scene count must be ${profile.scenes.min}-${profile.scenes.max}; got ${sceneCount}.`);
  }

  if (
    narrationWordCount < profile.narration.minWords ||
    narrationWordCount > profile.narration.maxWords
  ) {
    errors.push(
      `Narration must be ${profile.narration.minWords}-${profile.narration.maxWords} words; got ${narrationWordCount}.`,
    );
  }

  if (averageSceneDurationSeconds < 10 || averageSceneDurationSeconds > 16) {
    warnings.push(
      `Average scene duration is ${averageSceneDurationSeconds.toFixed(1)}s; v1 sits near 15s and the target profile is ${profile.scenes.averageDurationSeconds}s.`,
    );
  }

  const sceneDiagnostics = storyScenes.map((scene) => {
    const visual = visualFor(scene.id);
    const animation = animationFor(scene.id);
    const primitive = visual?.visualPrimitive;
    const camera = animation?.camera ?? visual?.camera ?? "";
    const animatedElements = animation?.elements ?? [];
    const staticHoldSeconds = animation?.staticHoldSeconds ?? 0;
    const focusItems = animation?.focus ?? [];
    const emphasisItems = visual?.emphasis ?? [];

    return {
      sceneId: scene.id,
      primitive,
      camera,
      hasCameraMovement: movingCameraPattern.test(camera),
      hasAnimationInstructions:
        Boolean(animation?.primaryAnimatedObject) &&
        animatedElements.length > 0 &&
        Boolean(animation?.transitionIn) &&
        Boolean(animation?.transitionOut),
      isTextOnly: !primitive,
      isBulletHeavy:
        emphasisItems.length > 5 ||
        focusItems.length > 5 ||
        slideLayouts.test(visual?.layout ?? "") ||
        sceneTextLoad(scene) > 55,
      staticHoldSeconds,
      hasPathAnimation:
        Boolean(animation?.requiresPathAnimation) ||
        pathPrimitives.has(primitive) ||
        animatedElements.some((element) => /path|draw|rail|connector|svg/i.test(element.animation)),
      hasWorkflowAnimation:
        workflowPrimitives.has(primitive) ||
        /workflow|pipeline|lane|gate|phase/i.test(scene.purpose),
      hasTerminalAnimation:
        terminalPrimitives.has(primitive) ||
        animatedElements.some((element) => /terminal|type/i.test(element.animation)),
    };
  });

  for (const diagnostic of sceneDiagnostics) {
    if (!diagnostic.primitive) {
      errors.push(`Scene "${diagnostic.sceneId}" is missing visualPrimitive.`);
    }
    if (!diagnostic.hasAnimationInstructions) {
      errors.push(`Scene "${diagnostic.sceneId}" is missing rich animation instructions.`);
    }
    if (diagnostic.isTextOnly) {
      errors.push(`Scene "${diagnostic.sceneId}" is text-only.`);
    }
    if (diagnostic.isBulletHeavy) {
      errors.push(`Scene "${diagnostic.sceneId}" is too text- or bullet-heavy.`);
    }
    if (diagnostic.staticHoldSeconds > profile.animation.avoidStaticFramesLongerThanSeconds) {
      errors.push(
        `Scene "${diagnostic.sceneId}" holds static for ${diagnostic.staticHoldSeconds}s; max is ${profile.animation.avoidStaticFramesLongerThanSeconds}s.`,
      );
    }
  }

  const cameraMoveCount = sceneDiagnostics.filter((scene) => scene.hasCameraMovement).length;
  if (cameraMoveCount < Math.ceil(sceneCount * 0.75)) {
    errors.push(`Most scenes need camera movement; got ${cameraMoveCount}/${sceneCount}.`);
  }

  if (!sceneDiagnostics.some((scene) => scene.hasWorkflowAnimation)) {
    errors.push("At least one workflow or pipeline animation is required.");
  }

  if (!sceneDiagnostics.some((scene) => scene.hasPathAnimation)) {
    errors.push("At least one SVG path or diagram drawing animation is required.");
  }

  if (commandsInSource && !sceneDiagnostics.some((scene) => scene.hasTerminalAnimation)) {
    errors.push("Source document contains commands, so at least one TerminalSequence animation is required.");
  }

  const shotsByScene = storyScenes.map((scene) => ({
    sceneId: scene.id,
    count: shots.filter((shot) => shot.sceneId === scene.id).length,
  }));
  const mediaByShotId = new Map(mediaAssignments.map((assignment) => [assignment.shotId, assignment]));
  const animationByShotId = new Map(animationShots.map((animation) => [animation.shotId, animation]));
  const decisionByShotId = new Map(editDecisions.map((decision) => [decision.shotId, decision]));
  const mediaCounts = mediaAssignments.reduce((counts, assignment) => {
    counts[assignment.mediaType] = (counts[assignment.mediaType] ?? 0) + 1;
    return counts;
  }, {});
  const mediaTypes = Object.keys(mediaCounts);
  const maxMediaShare = Math.max(0, ...Object.values(mediaCounts).map((count) => count / Math.max(1, shots.length)));
  let longestMediaRun = 0;
  let currentMediaRun = 0;
  let previousMediaType = "";
  let genericCueCount = 0;
  let genericRoleCount = 0;
  for (const shot of shots) {
    const mediaType = mediaByShotId.get(shot.shotId)?.mediaType ?? "";
    currentMediaRun = mediaType && mediaType === previousMediaType ? currentMediaRun + 1 : 1;
    longestMediaRun = Math.max(longestMediaRun, currentMediaRun);
    previousMediaType = mediaType;
    if ((shot.onScreenText ?? []).some((text) => genericShotCuePattern.test(String(text).trim()))) {
      genericCueCount += 1;
    }
    if (genericShotRoles.has(shot.shotRole)) {
      genericRoleCount += 1;
    }
  }

  if (runtimeSeconds >= 90 && runtimeSeconds <= 120) {
    if (shots.length < 25 || shots.length > 45) {
      errors.push(`Shot count must be 25-45 for a 90-120s video; got ${shots.length}.`);
    }
    if (averageShotDurationSeconds < 2 || averageShotDurationSeconds > 5) {
      errors.push(`Average shot duration must be 2-5s; got ${averageShotDurationSeconds.toFixed(2)}s.`);
    }
  }

  if (shots.length === 0) {
    errors.push("ShotPlan is required; scene-only output regresses to slideshow rendering.");
  }

  for (const diagnostic of shotsByScene) {
    if (diagnostic.count < 3 || diagnostic.count > 6) {
      errors.push(`Scene "${diagnostic.sceneId}" must contain 3-6 shots; got ${diagnostic.count}.`);
    }
  }

  for (const shot of shots) {
    if (!shot.shotRole) {
      errors.push(`Shot "${shot.shotId}" is missing shotRole.`);
    }
    if (!mediaByShotId.has(shot.shotId)) {
      errors.push(`Shot "${shot.shotId}" is missing a media mix assignment.`);
    }
    if (!animationByShotId.has(shot.shotId)) {
      errors.push(`Shot "${shot.shotId}" is missing shot-level animation intent.`);
    }
    if (!decisionByShotId.has(shot.shotId)) {
      errors.push(`Shot "${shot.shotId}" is missing an EDL decision.`);
    }
    if (shot.durationSeconds > 7 && !shot.justificationForLongShot) {
      errors.push(`Shot "${shot.shotId}" is ${shot.durationSeconds}s; shots longer than 7s require justification.`);
    }
    if ((shot.staticHoldSeconds ?? 0) > profile.animation.avoidStaticFramesLongerThanSeconds) {
      errors.push(`Shot "${shot.shotId}" holds static for ${shot.staticHoldSeconds}s; max is ${profile.animation.avoidStaticFramesLongerThanSeconds}s.`);
    }
  }

  if (genericCueCount > 0) {
    errors.push(`Shot plan contains ${genericCueCount} generic on-screen cue(s); cues must be concrete source, product, workflow, or CTA beats.`);
  }
  if (genericRoleCount > Math.max(1, Math.floor(sceneCount / 4))) {
    errors.push(`Shot plan uses ${genericRoleCount} generic transition/payoff roles; use scene set pieces with internal timing instead.`);
  }

  for (const animation of animationShots) {
    if ((animation.staticHoldSeconds ?? 0) > profile.animation.avoidStaticFramesLongerThanSeconds) {
      errors.push(`Shot animation "${animation.shotId}" holds static for ${animation.staticHoldSeconds}s; max is ${profile.animation.avoidStaticFramesLongerThanSeconds}s.`);
    }
    if ((animation.animatedElements ?? []).length === 0) {
      errors.push(`Shot animation "${animation.shotId}" needs at least one animated element.`);
    }
  }

  if (mediaTypes.length < 4) {
    errors.push(`Media mix must include at least 4 media types; got ${mediaTypes.length}.`);
  }
  if (maxMediaShare > 0.4) {
    errors.push(`No media type may exceed 40% of shots; max share is ${(maxMediaShare * 100).toFixed(1)}%.`);
  }
  if (longestMediaRun > 3) {
    errors.push(`No more than 3 consecutive shots may use the same media type; got a run of ${longestMediaRun}.`);
  }
  if ((mediaCounts.transition ?? 0) > 2) {
    errors.push(`Transition media should be rare inside set-piece rendering; got ${mediaCounts.transition} transition shots.`);
  }
  if (!mediaAssignments.some((assignment) => assignment.mediaType === "source-excerpt")) {
    errors.push("At least one source-document closeup/source-excerpt shot is required.");
  }
  if (!mediaAssignments.some((assignment) => assignment.mediaType === "workflow-animation")) {
    errors.push("At least one workflow animation shot is required.");
  }
  if (commandsInSource && !mediaAssignments.some((assignment) => assignment.mediaType === "terminal")) {
    errors.push("Source document contains commands, so at least one terminal/demo shot is required.");
  }
  if (!mediaAssignments.some((assignment) => assignment.mediaType === "ui-mockup")) {
    errors.push("At least one product/UI proof shot is required.");
  }
  if (!mediaAssignments.some((assignment) => assignment.mediaType === "metaphor-visual")) {
    errors.push("At least one metaphor visual shot is required.");
  }

  if (editDecisions.length !== shots.length) {
    errors.push(`EDL must include one decision per shot; got ${editDecisions.length}/${shots.length}.`);
  }
  for (const decision of editDecisions) {
    if (!decision.transition || !decision.pacingRole) {
      errors.push(`EDL decision "${decision.cutId}" needs transition and pacingRole.`);
    }
  }

  const metrics = {
    runtimeSeconds,
    sceneCount,
    averageSceneDurationSeconds: Number(averageSceneDurationSeconds.toFixed(2)),
    shotCount: shots.length,
    averageShotDurationSeconds: Number(averageShotDurationSeconds.toFixed(2)),
    mediaTypeCount: mediaTypes.length,
    maxMediaShare: Number(maxMediaShare.toFixed(3)),
    longestMediaRun,
    narrationWordCount,
    cameraMoveCount,
    visualPrimitiveCount: sceneDiagnostics.filter((scene) => scene.primitive).length,
    pathAnimationSceneCount: sceneDiagnostics.filter((scene) => scene.hasPathAnimation).length,
    workflowAnimationSceneCount: sceneDiagnostics.filter((scene) => scene.hasWorkflowAnimation).length,
    terminalAnimationSceneCount: sceneDiagnostics.filter((scene) => scene.hasTerminalAnimation).length,
    sourceExcerptShotCount: mediaAssignments.filter((assignment) => assignment.mediaType === "source-excerpt").length,
    uiMockupShotCount: mediaAssignments.filter((assignment) => assignment.mediaType === "ui-mockup").length,
    terminalShotCount: mediaAssignments.filter((assignment) => assignment.mediaType === "terminal").length,
    workflowShotCount: mediaAssignments.filter((assignment) => assignment.mediaType === "workflow-animation").length,
    genericCueCount,
    genericRoleCount,
    transitionMediaCount: mediaCounts.transition ?? 0,
    commandsInSource,
  };

  return {
    kind: "ExperienceValidation",
    version: "1.0.0",
    sourceHash: hashValue({storyPlan, visualPlan, shotPlan, mediaMixPlan, animationPlan, editDecisionList, narration, documentAst}),
    passed: errors.length === 0,
    profile: "goldenExperienceProfile",
    errors,
    warnings,
    metrics,
    sceneDiagnostics,
  };
};

export const assertValidExperience = (inputs) => {
  const validation = validateExperience(inputs);
  if (!validation.passed) {
    throw new Error(`Experience validation failed:\n${validation.errors.join("\n")}`);
  }
  return validation;
};
