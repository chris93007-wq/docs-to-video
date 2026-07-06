import {interpolate} from "remotion";
import {theme} from "../../../styles/theme";
import {clamp} from "../../../utils/animation";
import {cleanLabel, primitiveColors, revealAt} from "./shared";

type ProgressiveHighlightProps = {
  labels: string[];
  frame: number;
  fps: number;
  x?: number;
  y?: number;
  width?: number;
};

export const ProgressiveHighlight = ({
  labels,
  frame,
  fps,
  x = 0,
  y = 0,
  width = 520,
}: ProgressiveHighlightProps) => (
  <div style={{position: "absolute", left: x, top: y, width, display: "grid", gap: 12}}>
    {labels.slice(0, 4).map((label, index) => {
      const reveal = revealAt(frame, fps, index, 0.46);
      const color = primitiveColors[index % primitiveColors.length];
      return (
        <div
          key={`${label}-${index}`}
          style={{
            opacity: reveal,
            transform: `translateY(${interpolate(reveal, [0, 1], [18, 0], clamp)}px)`,
            borderRadius: theme.radius.md,
            background: "rgba(255,255,255,0.9)",
            border: `2px solid ${color}`,
            boxShadow: theme.shadow.line,
            padding: "14px 18px",
            ...theme.typography.small,
            color: theme.colors.ink,
            fontWeight: 740,
          }}
        >
          {cleanLabel(label, 58)}
        </div>
      );
    })}
  </div>
);
