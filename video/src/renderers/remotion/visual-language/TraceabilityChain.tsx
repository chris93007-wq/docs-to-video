import {interpolate} from "remotion";
import {EngineeringIcon} from "../../../assets/icons/EngineeringIcons";
import {theme} from "../../../styles/theme";
import {clamp} from "../../../utils/animation";
import {PathDraw} from "./PathDraw";
import {cleanLabel, iconForIndex, labelsForScene, primitiveColors, revealAt} from "./shared";
import type {VisualPrimitiveProps} from "./types";

export const TraceabilityChain = ({scene, frame, fps}: VisualPrimitiveProps) => {
  const labels = labelsForScene(scene, 5);

  return (
    <svg
      width="1180"
      height="500"
      viewBox="0 0 1180 500"
      style={{position: "absolute", right: 110, top: 354}}
    >
      <PathDraw
        d="M92 250 C260 95 380 395 548 250 S824 110 1048 250"
        frame={frame}
        startFrame={8}
        endFrame={fps * 3.8}
        length={1300}
      />
      {labels.map((label, index) => {
        const x = 92 + index * (956 / Math.max(1, labels.length - 1));
        const y = index % 2 === 0 ? 214 : 292;
        const reveal = revealAt(frame, fps, index, 0.48);
        const color = primitiveColors[index % primitiveColors.length];
        return (
          <g key={label} opacity={reveal}>
            <rect
              x={x - 104}
              y={y - 48}
              width="208"
              height="96"
              rx="22"
              fill="rgba(255,255,255,0.92)"
              stroke={color}
              strokeWidth="3"
            />
            <EngineeringIcon
              name={iconForIndex(index)}
              stroke={color}
              size={34}
              style={{transform: `translate(${x - 84}px, ${y - 18}px)`}}
            />
            <text x={x - 36} y={y + 7} fill={theme.colors.ink} fontSize="19" fontWeight="740">
              {cleanLabel(label, 22)}
            </text>
            <circle
              cx={x}
              cy={y + 67}
              r={interpolate(reveal, [0, 1], [2, 8], clamp)}
              fill={color}
              opacity="0.72"
            />
          </g>
        );
      })}
    </svg>
  );
};
