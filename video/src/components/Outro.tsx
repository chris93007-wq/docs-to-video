import {interpolate, useCurrentFrame} from "remotion";
import {BrandMark} from "../assets/svg/BrandMark";
import {SceneDefinition} from "../data/timeline";
import {theme} from "../styles/theme";
import {clamp, fadeIn, scaleIn} from "../utils/animation";
import {Pill, SceneFrame} from "./SceneFrame";

type Props = {
  scene: SceneDefinition;
  durationFrames: number;
};

export const OutroScene = ({scene, durationFrames}: Props) => {
  const frame = useCurrentFrame();
  const markScale = scaleIn(frame, 0);

  return (
    <SceneFrame scene={scene} durationFrames={durationFrames} align="center">
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          textAlign: "center",
          padding: "0 220px",
        }}
      >
        <div>
          <div style={{opacity: fadeIn(frame, 0, 14), transform: `scale(${markScale})`}}>
            <BrandMark frame={frame + 70} size={230} />
          </div>
          <div
            style={{
              ...theme.typography.hero,
              fontSize: 82,
              marginTop: 34,
              opacity: fadeIn(frame, 16, 18),
              transform: `translateY(${interpolate(frame, [16, 42], [30, 0], clamp)}px)`,
            }}
          >
            The orchestrator does not replace SDD discipline.
          </div>
          <div
            style={{
              ...theme.typography.h2,
              color: theme.colors.muted,
              fontWeight: 560,
              marginTop: 24,
              opacity: fadeIn(frame, 52, 18),
            }}
          >
            It makes the discipline runnable.
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 16,
              marginTop: 42,
              opacity: fadeIn(frame, 88, 16),
            }}
          >
            <Pill tone="blue">Specs stay true</Pill>
            <Pill tone="teal">Workers stay bounded</Pill>
            <Pill tone="violet">Evidence stays connected</Pill>
          </div>
        </div>
      </div>
    </SceneFrame>
  );
};
