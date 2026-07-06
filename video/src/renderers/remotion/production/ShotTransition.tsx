import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from "remotion";
import {theme} from "../../../styles/theme";
import {clamp} from "../../../utils/animation";

export const ShotTransition = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const entry = interpolate(frame, [0, 8], [0.28, 0], clamp);
  const exit = interpolate(frame, [durationInFrames - 8, durationInFrames], [0, 0.22], clamp);
  return (
    <AbsoluteFill
      style={{
        background: theme.gradients.page,
        opacity: Math.max(entry, exit),
        pointerEvents: "none",
      }}
    />
  );
};
