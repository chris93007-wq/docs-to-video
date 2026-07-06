import {interpolate} from "remotion";
import {EngineeringIcon} from "../../../assets/icons/EngineeringIcons";
import {theme} from "../../../styles/theme";
import {clamp} from "../../../utils/animation";
import {PathDraw} from "./PathDraw";
import {cleanLabel, iconForIndex, labelsForScene, primitiveColors, revealAt} from "./shared";
import type {VisualPrimitiveProps} from "./types";

export const PipelineFlow = ({scene, frame, fps}: VisualPrimitiveProps) => {
  const labels = labelsForScene(scene, 6);

  return (
    <svg
      width="1360"
      height="510"
      viewBox="0 0 1360 510"
      style={{position: "absolute", left: 500, top: 330}}
    >
      <defs>
        <marker id={`pipeline-arrow-${scene.id}`} markerWidth="16" markerHeight="16" refX="8" refY="8" orient="auto">
          <path d="M2 2 14 8 2 14Z" fill={theme.colors.lineStrong} />
        </marker>
      </defs>
      <PathDraw
        d="M90 244 C260 120 390 365 555 244 S845 125 1020 244 1168 330 1270 244"
        frame={frame}
        startFrame={10}
        endFrame={fps * 4.8}
        length={1550}
        markerEnd={`url(#pipeline-arrow-${scene.id})`}
      />
      {labels.map((label, index) => {
        const x = 90 + index * (1180 / Math.max(1, labels.length - 1));
        const y = index % 2 === 0 ? 184 : 302;
        const reveal = revealAt(frame, fps, index, 0.42);
        const color = primitiveColors[index % primitiveColors.length];
        return (
          <g
            key={label}
            opacity={reveal}
            style={{
              transformOrigin: `${x}px ${y}px`,
              transform: `scale(${interpolate(reveal, [0, 1], [0.86, 1], clamp)})`,
            }}
          >
            <circle cx={x} cy={y} r="58" fill="white" stroke={color} strokeWidth="4" />
            <circle cx={x} cy={y} r="72" fill="none" stroke={color} strokeWidth="2" opacity="0.16" />
            <EngineeringIcon
              name={iconForIndex(index)}
              stroke={color}
              size={46}
              style={{transform: `translate(${x - 23}px, ${y - 28}px)`}}
            />
            <text x={x} y={y + 84} textAnchor="middle" fill={theme.colors.ink} fontSize="22" fontWeight="740">
              {cleanLabel(label, 18)}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
