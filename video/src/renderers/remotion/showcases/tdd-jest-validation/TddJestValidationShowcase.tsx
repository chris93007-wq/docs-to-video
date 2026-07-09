import {AbsoluteFill, interpolate, Sequence, useCurrentFrame} from "remotion";
import {clamp} from "../../../../utils/animation";
import {ShowcaseBrandProvider} from "../sdd-orchestrator/brand";
import {
  CapabilitiesScene,
  DashboardScene,
  GettingStartedScene,
  IntroWhatItIsScene,
  ProblemHookScene,
  RedGreenRefactorScene,
  SddFitScene,
  UsageCtaScene,
} from "./scenes";
import type {TddJestManifest, TddSceneProps} from "./types";

const TIMELINE = [
  {id: "introduction", startSeconds: 0, durationSeconds: 5, component: IntroWhatItIsScene},
  {id: "problem-hook", startSeconds: 5, durationSeconds: 17, component: ProblemHookScene},
  {id: "sdd-fit", startSeconds: 22, durationSeconds: 14, component: SddFitScene},
  {id: "capabilities", startSeconds: 36, durationSeconds: 17, component: CapabilitiesScene},
  {id: "getting-started", startSeconds: 53, durationSeconds: 20, component: GettingStartedScene},
  {id: "red-green-refactor", startSeconds: 73, durationSeconds: 34, component: RedGreenRefactorScene},
  {id: "dashboard", startSeconds: 107, durationSeconds: 18, component: DashboardScene},
  {id: "usage-cta", startSeconds: 125, durationSeconds: 18, component: UsageCtaScene},
] as const;

const SceneCut = ({
  Component,
  fps,
  durationInFrames,
  manifest,
}: {
  Component: (props: TddSceneProps) => JSX.Element;
  fps: number;
  durationInFrames: number;
  manifest: TddJestManifest;
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, 9, Math.max(10, durationInFrames - 9), durationInFrames],
    [0, 1, 1, 0],
    clamp,
  );
  const scale = interpolate(frame, [0, durationInFrames], [1.008, 1], clamp);
  return (
    <AbsoluteFill style={{opacity, transform: `scale(${scale})`, transformOrigin: "center"}}>
      <Component fps={fps} durationInFrames={durationInFrames} manifest={manifest} />
    </AbsoluteFill>
  );
};

export const TddJestValidationShowcase = ({manifest}: {manifest: TddJestManifest}) => (
  <ShowcaseBrandProvider mode="oracle-redwood">
    <AbsoluteFill style={{background: "#101210"}}>
      {TIMELINE.map((scene) => {
        const durationInFrames = Math.round(scene.durationSeconds * manifest.fps);
        return (
          <Sequence
            key={scene.id}
            name={scene.id}
            from={Math.round(scene.startSeconds * manifest.fps)}
            durationInFrames={durationInFrames}
          >
            <SceneCut
              Component={scene.component}
              fps={manifest.fps}
              durationInFrames={durationInFrames}
              manifest={manifest}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  </ShowcaseBrandProvider>
);

export const TDD_JEST_VISUAL_DURATION_SECONDS = 143;
