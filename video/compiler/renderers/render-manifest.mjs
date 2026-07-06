import {hashValue} from "../utils.mjs";
import {assertValidArtifact} from "../schemas.mjs";

export const buildRenderManifest = ({
  renderer,
  storyPlan,
  visualPlan,
  shotPlan,
  mediaMixPlan,
  animationPlan,
  editDecisionList,
  narration,
  narrationAudio,
  assetManifest,
  showcase,
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

  const sceneById = new Map(storyPlan.scenes.map((scene) => [scene.id, scene]));
  const visualBySceneId = new Map(visualPlan.scenes.map((visual) => [visual.sceneId, visual]));
  const mediaByShotId = new Map((mediaMixPlan?.assignments ?? []).map((assignment) => [assignment.shotId, assignment]));
  const animationByShotId = new Map((animationPlan?.shots ?? []).map((animation) => [animation.shotId, animation]));
  const decisionByShotId = new Map((editDecisionList?.decisions ?? []).map((decision) => [decision.shotId, decision]));
  const shots = (shotPlan?.shots ?? []).map((shot) => {
    const scene = sceneById.get(shot.sceneId);
    const decision = decisionByShotId.get(shot.shotId);
    const startSeconds = decision ? decision.fromFrame / (editDecisionList?.fps ?? 30) : shot.startSeconds;
    const durationSeconds = decision ? decision.durationFrames / (editDecisionList?.fps ?? 30) : shot.durationSeconds;

    return {
      shotId: shot.shotId,
      sceneId: shot.sceneId,
      order: shot.order,
      title: scene?.title ?? shot.sceneId,
      purpose: scene?.purpose ?? shot.purpose,
      teachingPoint: scene?.teachingPoint ?? shot.purpose,
      shotRole: shot.shotRole,
      startSeconds: Number(startSeconds.toFixed(3)),
      durationSeconds: Number(durationSeconds.toFixed(3)),
      visualIntent: shot.visualIntent,
      framing: shot.framing,
      camera: shot.camera,
      onScreenText: shot.onScreenText,
      visual: visualBySceneId.get(shot.sceneId),
      media: mediaByShotId.get(shot.shotId),
      assets: assetManifest.assets.filter((asset) => asset.sceneId === shot.sceneId && (!asset.shotId || asset.shotId === shot.shotId)),
      animation: animationByShotId.get(shot.shotId),
      narration: narration.segments.find((segment) => segment.sceneId === shot.sceneId),
      decision,
    };
  });

  return assertValidArtifact("render", {
    kind: "RenderManifest",
    version: "1.0.0",
    renderer,
    sourceHash: hashValue({storyPlan, visualPlan, shotPlan, mediaMixPlan, animationPlan, editDecisionList, narration, narrationAudio, assetManifest, showcase}),
    ...(showcase ? {showcase} : {}),
    fps: 30,
    width: 1920,
    height: 1080,
    totalDurationSeconds: storyPlan.totalDurationSeconds,
    scenes,
    ...(shots.length > 0 ? {shots} : {}),
    ...(mediaMixPlan ? {mediaMix: mediaMixPlan} : {}),
    ...(editDecisionList ? {edl: editDecisionList} : {}),
    narration,
    ...(narrationAudio ? {narrationAudio} : {}),
  });
};
