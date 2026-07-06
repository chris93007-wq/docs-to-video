import {interpolate} from "remotion";
import {theme} from "../../../styles/theme";
import {clamp} from "../../../utils/animation";

export const SceneTransition = ({
  frame,
  durationFrames,
}: {
  frame: number;
  durationFrames: number;
}) => {
  const entry = interpolate(frame, [0, 18], [1, 0], clamp);
  const exit = interpolate(frame, [durationFrames - 20, durationFrames], [0, 1], clamp);

  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: theme.gradients.page,
          opacity: entry,
          zIndex: 30,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(255,255,255,0.92)",
          opacity: exit,
          zIndex: 30,
          pointerEvents: "none",
        }}
      />
    </>
  );
};
