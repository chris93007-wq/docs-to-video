import {interpolate} from "remotion";
import {EngineeringIcon} from "../../../assets/icons/EngineeringIcons";
import {theme} from "../../../styles/theme";
import {clamp} from "../../../utils/animation";
import {cleanLabel, iconForIndex, labelsForScene, primitiveColors, revealAt} from "./shared";
import type {VisualPrimitiveProps} from "./types";

type PathDrawProps = {
  d: string;
  frame: number;
  startFrame?: number;
  endFrame?: number;
  length?: number;
  color?: string;
  width?: number;
  opacity?: number;
  markerEnd?: string;
};

export const PathDraw = ({
  d,
  frame,
  startFrame = 8,
  endFrame = 90,
  length = 1000,
  color = theme.colors.lineStrong,
  width = 5,
  opacity = 1,
  markerEnd,
}: PathDrawProps) => {
  const offset = interpolate(frame, [startFrame, endFrame], [length, 0], clamp);

  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={length}
      strokeDashoffset={offset}
      opacity={opacity}
      markerEnd={markerEnd}
    />
  );
};

export const PathDrawPrimitive = ({scene, frame, fps}: VisualPrimitiveProps) => {
  const labels = labelsForScene(scene, 4);
  const knot = interpolate(frame, [fps * 0.8, fps * 4.4], [0, 1], clamp);

  return (
    <>
      <svg width="980" height="640" viewBox="0 0 980 640" style={{position: "absolute", right: 78, top: 300}}>
        <path
          d="M118 330 C290 80 420 540 575 260 S742 109 866 330"
          fill="none"
          stroke={theme.colors.lineStrong}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray="1200"
          strokeDashoffset={1200 * (1 - knot)}
        />
        <path
          d="M106 222 C324 552 468 84 618 390 S798 494 870 202"
          fill="none"
          stroke={theme.colors.lineStrong}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="1200"
          strokeDashoffset={1200 * (1 - knot)}
          opacity="0.68"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          right: 116,
          top: 316,
          width: 890,
          height: 560,
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 26,
        }}
      >
        {labels.map((label, index) => {
          const reveal = revealAt(frame - fps * 1.4, fps, index, 0.42);
          const color = primitiveColors[index % primitiveColors.length];
          return (
            <div
              key={label}
              style={{
                opacity: reveal,
                transform: `translateY(${interpolate(reveal, [0, 1], [26, 0], clamp)}px)`,
                background: "rgba(255,255,255,0.88)",
                border: `2px solid ${color}`,
                borderRadius: theme.radius.lg,
                padding: 28,
                boxShadow: theme.shadow.soft,
              }}
            >
              <EngineeringIcon name={iconForIndex(index)} stroke={color} size={62} />
              <div style={{...theme.typography.h2, fontSize: 31, marginTop: 22}}>
                {cleanLabel(label, 24)}
              </div>
              <div style={{...theme.typography.small, color: theme.colors.muted, marginTop: 12}}>
                memory should not be the runtime
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
