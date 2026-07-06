import {AbsoluteFill, interpolate} from "remotion";
import {theme} from "../../../styles/theme";
import {clamp} from "../../../utils/animation";
import {SmallLabel, useShotMotion} from "./helpers";
import type {ProductionShotProps} from "./types";

export const DiagramBuild = ({shot}: ProductionShotProps) => {
  const {frame, fps} = useShotMotion();
  const labels = ["Requirement", "Design", "Tests", "Implementation", "Validation", "Evidence"];

  return (
    <AbsoluteFill style={{padding: "120px 160px"}}>
      <SmallLabel>{shot.shotRole.replace(/-/g, " ")}</SmallLabel>
      <div style={{position: "relative", height: 700}}>
        {labels.map((label, index) => {
          const reveal = interpolate(frame, [fps * (0.2 + index * 0.18), fps * (0.55 + index * 0.18)], [0, 1], clamp);
          const x = 160 + (index % 3) * 450;
          const y = 120 + Math.floor(index / 3) * 270;
          return (
            <div key={label} style={{position: "absolute", left: x, top: y, opacity: reveal, transform: `translateY(${(1 - reveal) * 24}px)`, width: 260}}>
              <div style={{height: 92, borderRadius: 18, background: "white", border: `3px solid ${theme.colors.teal}`, display: "grid", placeItems: "center", boxShadow: theme.shadow.line, ...theme.typography.small, fontWeight: 800}}>
                {label}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
