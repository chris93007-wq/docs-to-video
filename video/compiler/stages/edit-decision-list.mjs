import {hashValue} from "../utils.mjs";

const FPS = 30;

const pacingRoleForShot = (shot) => {
  if (shot.shotRole === "emotional-hook" || shot.shotRole === "kinetic-title") {
    return "hook";
  }
  if (shot.shotRole === "summary-payoff") {
    return "payoff";
  }
  if (shot.shotRole === "transition-bridge") {
    return "breath";
  }
  if (/proof|terminal|source-document/.test(shot.shotRole)) {
    return "proof";
  }
  if (shot.shotRole === "callout-insert") {
    return "emphasis";
  }
  if (shot.order === 0) {
    return "setup";
  }
  return "explain";
};

const transitionForShot = ({shot, index, previousShot}) => {
  if (index === 0) {
    return "crossfade";
  }
  if (previousShot?.sceneId !== shot.sceneId) {
    return "match-cut";
  }
  if (shot.shotRole === "source-document-closeup" || shot.shotRole === "terminal-demo") {
    return "cut";
  }
  if (shot.shotRole === "transition-bridge") {
    return "push";
  }
  if (shot.shotRole === "summary-payoff") {
    return "crossfade";
  }
  return "match-cut";
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

const captionBehaviorFor = ({shot, mediaType}) => {
  if (mediaType === "source-excerpt") {
    return "source-highlight";
  }
  if (mediaType === "terminal") {
    return "terminal-caption";
  }
  if (shot.shotRole === "callout-insert") {
    return "inline-callout";
  }
  if (mediaType === "kinetic-text") {
    return "lower-third";
  }
  return "none";
};

export const planEditDecisionList = async (
  {storyPlan, shotPlan, mediaMixPlan, animationPlan, narration, fps = FPS},
) => {
  const totalFrames = Math.round(storyPlan.totalDurationSeconds * fps);
  let secondsCursor = 0;

  const starts = shotPlan.shots.map((shot) => {
    const startSeconds = secondsCursor;
    secondsCursor += shot.durationSeconds;
    return Math.round(startSeconds * fps);
  });

  const decisions = shotPlan.shots.map((shot, index) => {
    const media = mediaMixPlan.assignments.find((item) => item.shotId === shot.shotId);
    const fromFrame = starts[index];
    const nextFrame = index === shotPlan.shots.length - 1 ? totalFrames : starts[index + 1];
    const mediaType = media?.mediaType ?? "diagram";

    return {
      cutId: `cut-${String(index + 1).padStart(3, "0")}`,
      shotId: shot.shotId,
      sceneId: shot.sceneId,
      fromFrame,
      durationFrames: Math.max(1, nextFrame - fromFrame),
      transition: transitionForShot({shot, index, previousShot: shotPlan.shots[index - 1]}),
      pacingRole: pacingRoleForShot(shot),
      narrationSegmentId: shot.sceneId,
      captionBehavior: captionBehaviorFor({shot, mediaType}),
      soundCue: soundCueForMedia(mediaType),
    };
  });

  return {
    kind: "EditDecisionList",
    version: "1.0.0",
    sourceHash: hashValue({storyPlan, shotPlan, mediaMixPlan, animationPlan, narration, fps}),
    fps,
    totalFrames,
    decisions,
  };
};
