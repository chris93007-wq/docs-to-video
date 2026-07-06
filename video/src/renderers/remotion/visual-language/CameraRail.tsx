import {interpolate} from "remotion";
import {clamp} from "../../../utils/animation";
import type {CameraRailProps} from "./types";

export const CameraRail = ({scene, frame, fps, children}: CameraRailProps) => {
  const camera = scene.animation?.camera ?? scene.visual.camera ?? "slow-push-in";
  const durationFrames = scene.durationSeconds * fps;
  const progress = interpolate(frame, [0, durationFrames], [0, 1], clamp);

  const x = /track-left|pan-across|rail/i.test(camera)
    ? interpolate(progress, [0, 1], [26, -34], clamp)
    : /pull-back/i.test(camera)
      ? 0
      : interpolate(progress, [0, 1], [0, -10], clamp);
  const y = /dolly-down|tilt/i.test(camera)
    ? interpolate(progress, [0, 1], [-18, 18], clamp)
    : 0;
  const scale = /pull-back/i.test(camera)
    ? interpolate(progress, [0, 1], [1.04, 0.98], clamp)
    : interpolate(progress, [0, 1], [0.985, 1.025], clamp);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: `translate(${x}px, ${y}px) scale(${scale})`,
        transformOrigin: "50% 50%",
      }}
    >
      {children}
    </div>
  );
};
