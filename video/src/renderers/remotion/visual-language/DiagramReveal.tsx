import {interpolate} from "remotion";
import {EngineeringIcon} from "../../../assets/icons/EngineeringIcons";
import {theme} from "../../../styles/theme";
import {clamp} from "../../../utils/animation";
import {PathDraw} from "./PathDraw";
import {cleanLabel, iconForIndex, labelsForScene, primitiveColors, revealAt} from "./shared";
import type {VisualPrimitiveProps} from "./types";

export const DiagramReveal = ({scene, frame, fps}: VisualPrimitiveProps) => {
  const labels = labelsForScene(scene, 6);

  return (
    <svg width="1040" height="620" viewBox="0 0 1040 620" style={{position: "absolute", right: 110, top: 284}}>
      <defs>
        <linearGradient id={`diagram-core-${scene.id}`} x1="360" y1="170" x2="680" y2="470">
          <stop offset="0%" stopColor={theme.colors.accent} />
          <stop offset="100%" stopColor={theme.colors.teal} />
        </linearGradient>
      </defs>
      {labels.map((_, index) => {
        const angle = (Math.PI * 2 * index) / labels.length;
        const x = 520 + Math.cos(angle) * 360;
        const y = 310 + Math.sin(angle) * 210;
        return (
          <PathDraw
            key={`diagram-connector-${index}`}
            d={`M520 310 L${x} ${y}`}
            frame={frame}
            startFrame={18 + index * 6}
            endFrame={fps * 3.2}
            length={520}
            color={theme.colors.lineStrong}
            width={3}
            opacity={0.66}
          />
        );
      })}
      <g opacity={interpolate(frame, [0, 24], [0, 1], clamp)}>
        <circle cx="520" cy="310" r="118" fill={`url(#diagram-core-${scene.id})`} />
        <circle cx="520" cy="310" r="82" fill="rgba(255,255,255,0.18)" />
        <EngineeringIcon name="code" stroke="white" size={78} style={{transform: "translate(481px, 270px)"}} />
        <text x="520" y="446" textAnchor="middle" fill={theme.colors.ink} fontSize="28" fontWeight="780">
          {cleanLabel(scene.title, 22)}
        </text>
      </g>
      {labels.map((label, index) => {
        const angle = (Math.PI * 2 * index) / labels.length;
        const x = 520 + Math.cos(angle) * 360;
        const y = 310 + Math.sin(angle) * 210;
        const reveal = revealAt(frame - fps * 1.2, fps, index, 0.24);
        const color = primitiveColors[index % primitiveColors.length];
        return (
          <g key={label} opacity={reveal}>
            <rect x={x - 90} y={y - 42} width="180" height="84" rx="20" fill="white" stroke={color} strokeWidth="3" />
            <EngineeringIcon
              name={iconForIndex(index)}
              stroke={color}
              size={30}
              style={{transform: `translate(${x - 72}px, ${y - 16}px)`}}
            />
            <text x={x - 28} y={y + 6} fill={theme.colors.ink} fontSize="18" fontWeight="730">
              {cleanLabel(label, 15)}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
