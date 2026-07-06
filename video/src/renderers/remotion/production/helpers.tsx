import {interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";
import {theme} from "../../../styles/theme";
import {clamp} from "../../../utils/animation";
import type {ProductionShot} from "./types";

export const textForShot = (shot: ProductionShot, fallback = shot.teachingPoint) =>
  shot.onScreenText?.[0] ?? fallback;

export const useShotMotion = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const progress = interpolate(frame, [0, Math.max(1, durationInFrames - 1)], [0, 1], clamp);
  const enter = spring({frame, fps, config: {damping: 18, stiffness: 120}});
  return {frame, fps, durationInFrames, progress, enter};
};

export const panelStyle = {
  background: "rgba(255,255,255,0.94)",
  border: "1px solid rgba(175,192,214,0.72)",
  borderRadius: 16,
  boxShadow: theme.shadow.soft,
} as const;

export const SmallLabel = ({children}: {children: string}) => (
  <div
    style={{
      ...theme.typography.label,
      color: theme.colors.accent,
      textTransform: "uppercase",
      marginBottom: 16,
    }}
  >
    {children}
  </div>
);
