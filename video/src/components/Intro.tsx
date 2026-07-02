import {interpolate, useCurrentFrame} from "remotion";
import {BrandMark} from "../assets/svg/BrandMark";
import {SceneDefinition} from "../data/timeline";
import {theme} from "../styles/theme";
import {clamp, fadeIn, rise, softSpring} from "../utils/animation";
import {Pill, SceneFrame} from "./SceneFrame";

type Props = {
  scene: SceneDefinition;
  durationFrames: number;
};

export const IntroScene = ({scene, durationFrames}: Props) => {
  const frame = useCurrentFrame();
  const titleOpacity = fadeIn(frame, 16, 28);
  const markScale = interpolate(softSpring(frame, 8), [0, 1], [0.82, 1], clamp);

  return (
    <SceneFrame scene={scene} durationFrames={durationFrames}>
      <div
        style={{
          position: "absolute",
          inset: "0 96px",
          display: "grid",
          gridTemplateColumns: "1fr 610px",
          alignItems: "center",
          gap: 80,
        }}
      >
        <div>
          <Pill tone="teal" style={{opacity: fadeIn(frame, 8, 18), marginBottom: 34}}>
            SDD Orchestrator
          </Pill>
          <div
            style={{
              ...theme.typography.hero,
              opacity: titleOpacity,
              transform: `translateY(${rise(frame, 18, 34, 28)}px)`,
              maxWidth: 950,
            }}
          >
            Make spec-driven development easier to run.
          </div>
          <div
            style={{
              ...theme.typography.body,
              color: theme.colors.muted,
              width: 790,
              marginTop: 34,
              opacity: fadeIn(frame, 50, 24),
            }}
          >
            A stateful workflow that keeps requirements, design, implementation,
            validation, and evidence connected.
          </div>
        </div>
        <div
          style={{
            display: "grid",
            placeItems: "center",
            transform: `scale(${markScale})`,
            opacity: fadeIn(frame, 4, 24),
          }}
        >
          <BrandMark frame={frame} size={390} />
          <div
            style={{
              marginTop: 32,
              display: "grid",
              gridTemplateColumns: "repeat(3, auto)",
              gap: 14,
              opacity: fadeIn(frame, 62, 20),
            }}
          >
            <Pill>Scope</Pill>
            <Pill tone="violet">Validation</Pill>
            <Pill tone="gold">Evidence</Pill>
          </div>
        </div>
      </div>
    </SceneFrame>
  );
};
