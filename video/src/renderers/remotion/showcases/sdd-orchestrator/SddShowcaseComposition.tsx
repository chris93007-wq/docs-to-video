import {Sequence} from "remotion";
import {SddApprovalGate} from "./SddApprovalGate";
import {SddCodexRun} from "./SddCodexRun";
import {SddContributionCta} from "./SddContributionCta";
import {SddEvidenceChain} from "./SddEvidenceChain";
import {SddGuardrails} from "./SddGuardrails";
import {SddHookTangle} from "./SddHookTangle";
import {SddWorkflowRail} from "./SddWorkflowRail";
import type {ShowcaseEdl, ShowcaseScene, ShowcaseShot} from "./shared";

type ShowcaseManifest = typeof import("../../../../compiler/generated/render-manifest.json") & {
  showcase?: string;
  shots?: ShowcaseShot[];
  edl?: {
    decisions?: ShowcaseEdl[];
  };
};

const componentForScene = (scene: ShowcaseScene) => {
  switch (scene.id) {
    case "hook":
      return SddHookTangle;
    case "problem":
      return SddApprovalGate;
    case "solution":
      return SddEvidenceChain;
    case "developer-experience":
    case "demo":
      return SddCodexRun;
    case "workflow":
      return SddWorkflowRail;
    case "guardrails":
      return SddGuardrails;
    case "conclusion":
    case "outro":
      return SddContributionCta;
    default:
      return SddEvidenceChain;
  }
};

export const SddShowcaseComposition = ({manifest}: {manifest: ShowcaseManifest}) => {
  const allShots = [...(manifest.shots ?? [])].sort((a, b) => a.startSeconds - b.startSeconds);
  const allDecisions = manifest.edl?.decisions ?? [];

  return (
    <>
      {manifest.scenes.map((scene) => {
        const Component = componentForScene(scene);
        const shots = allShots.filter((shot) => shot.sceneId === scene.id);
        const shotIds = new Set(shots.map((shot) => shot.shotId));
        const edl = allDecisions.filter((decision) => shotIds.has(decision.shotId));

        return (
          <Sequence
            key={scene.id}
            from={Math.round(scene.startSeconds * manifest.fps)}
            durationInFrames={Math.round(scene.durationSeconds * manifest.fps)}
          >
            <Component scene={scene} shots={shots} edl={edl} fps={manifest.fps} />
          </Sequence>
        );
      })}
    </>
  );
};
