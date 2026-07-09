import {AbsoluteFill, interpolate, Sequence, useCurrentFrame} from "remotion";
import {SddApprovalGate} from "./SddApprovalGate";
import {SddCodexRun} from "./SddCodexRun";
import {SddContributionCta} from "./SddContributionCta";
import {SddEvidenceChain} from "./SddEvidenceChain";
import {SddGuardrails} from "./SddGuardrails";
import {SddHookTangle} from "./SddHookTangle";
import {SddWorkflowRail} from "./SddWorkflowRail";
import {ShowcaseBrandMode, ShowcaseBrandProvider} from "./brand";
import type {
  ShowcaseEdl,
  ShowcaseLiveDemo,
  ShowcasePresentationMode,
  ShowcaseScene,
  ShowcaseShot,
} from "./shared";

type ShowcaseManifest = typeof import("../../../../compiler/generated/render-manifest.json") & {
  showcase?: string;
  brandMode?: ShowcaseBrandMode;
  presentationMode?: ShowcasePresentationMode;
  liveDemo?: ShowcaseLiveDemo | null;
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

const ShowcaseSceneCut = ({
  Component,
  scene,
  shots,
  edl,
  fps,
  brandMode,
  presentationMode,
  liveDemo,
}: {
  Component: ReturnType<typeof componentForScene>;
  scene: ShowcaseScene;
  shots: ShowcaseShot[];
  edl: ShowcaseEdl[];
  fps: number;
  brandMode: ShowcaseBrandMode;
  presentationMode: ShowcasePresentationMode;
  liveDemo?: ShowcaseLiveDemo | null;
}) => {
  const frame = useCurrentFrame();
  const durationFrames = Math.round(scene.durationSeconds * fps);
  const opacity = interpolate(
    frame,
    [0, 8, Math.max(9, durationFrames - 8), durationFrames],
    [0, 1, 1, 0],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"},
  );
  const scale = interpolate(frame, [0, durationFrames], [brandMode === "oracle-redwood" ? 1 : 1.015, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{opacity, transform: `scale(${scale})`, transformOrigin: "center"}}>
      <Component
        scene={scene}
        shots={shots}
        edl={edl}
        fps={fps}
        presentationMode={presentationMode}
        liveDemo={liveDemo}
      />
    </AbsoluteFill>
  );
};

export const SddShowcaseComposition = ({manifest}: {manifest: ShowcaseManifest}) => {
  const allShots = [...(manifest.shots ?? [])].sort((a, b) => a.startSeconds - b.startSeconds);
  const allDecisions = manifest.edl?.decisions ?? [];

  const brandMode = manifest.brandMode ?? "legacy";
  const presentationMode = manifest.presentationMode ?? "default";
  return (
    <ShowcaseBrandProvider mode={brandMode}>
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
            <ShowcaseSceneCut
              Component={Component}
              scene={scene}
              shots={shots}
              edl={edl}
              fps={manifest.fps}
              brandMode={brandMode}
              presentationMode={presentationMode}
              liveDemo={manifest.liveDemo}
            />
          </Sequence>
        );
      })}
    </ShowcaseBrandProvider>
  );
};
