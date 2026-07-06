import {interpolate} from "remotion";
import {EngineeringIcon} from "../../../assets/icons/EngineeringIcons";
import {theme} from "../../../styles/theme";
import {clamp} from "../../../utils/animation";
import {PathDraw} from "./PathDraw";
import {cleanLabel, labelsForScene, primitiveColors, revealAt} from "./shared";
import type {VisualPrimitiveProps} from "./types";

export const ParallelLanes = ({scene, frame, fps}: VisualPrimitiveProps) => {
  const labels = labelsForScene(scene, 4);
  const laneProgress = interpolate(frame, [fps * 0.6, fps * 6.4], [0, 1], clamp);

  return (
    <svg
      width="1180"
      height="560"
      viewBox="0 0 1180 560"
      style={{position: "absolute", right: 100, top: 322}}
    >
      {[0, 1, 2, 3].map((lane) => {
        const y = 116 + lane * 92;
        return (
          <g key={lane}>
            <PathDraw
              d={`M80 ${y} H820 C900 ${y}, 932 280, 1040 280`}
              frame={frame}
              startFrame={8 + lane * 8}
              endFrame={fps * 3.2}
              length={1060}
              color={primitiveColors[lane % primitiveColors.length]}
              width={4}
              opacity={0.7}
            />
            <circle
              cx={interpolate(laneProgress, [0, 1], [120, 770 + lane * 26], clamp)}
              cy={y}
              r="18"
              fill={primitiveColors[lane % primitiveColors.length]}
              opacity="0.88"
            />
          </g>
        );
      })}
      {labels.map((label, index) => {
        const reveal = revealAt(frame, fps, index, 0.46);
        const y = 80 + index * 92;
        return (
          <g key={label} opacity={reveal}>
            <rect x="80" y={y - 34} width="282" height="68" rx="16" fill="white" stroke={primitiveColors[index % primitiveColors.length]} strokeWidth="2" />
            <EngineeringIcon
              name={index % 2 === 0 ? "worker" : "branch"}
              stroke={primitiveColors[index % primitiveColors.length]}
              size={34}
              style={{transform: `translate(102px, ${y - 18}px)`}}
            />
            <text x="154" y={y + 7} fill={theme.colors.ink} fontSize="20" fontWeight="740">
              {cleanLabel(label, 24)}
            </text>
          </g>
        );
      })}
      <g opacity={revealAt(frame - fps * 3.6, fps, 0)}>
        <rect x="880" y="214" width="230" height="132" rx="26" fill={theme.colors.goldSoft} stroke={theme.colors.gold} strokeWidth="3" />
        <EngineeringIcon name="approval" stroke={theme.colors.gold} size={52} style={{transform: "translate(970px, 238px)"}} />
        <text x="995" y="320" textAnchor="middle" fill={theme.colors.ink} fontSize="24" fontWeight="780">
          safe merge
        </text>
      </g>
    </svg>
  );
};
