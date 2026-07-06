import {AbsoluteFill, interpolate} from "remotion";
import {theme} from "../../../styles/theme";
import {clamp} from "../../../utils/animation";
import {useShotMotion} from "./helpers";
import type {ProductionShotProps} from "./types";

const nodes = ["Jira", "Requirements", "Design", "Plan", "Jest", "Build", "Playwright", "Evidence"];

export const WorkflowWide = (_props: ProductionShotProps) => {
  const {frame, fps} = useShotMotion();
  const pathProgress = interpolate(frame, [8, fps * 2.4], [0, 1], clamp);

  return (
    <AbsoluteFill style={{padding: "190px 120px"}}>
      <svg width="1680" height="520" viewBox="0 0 1680 520">
        <path d="M90 260 C360 120 520 400 760 260 S1180 120 1590 260" fill="none" stroke="rgba(77,141,255,0.24)" strokeWidth="22" strokeLinecap="round" />
        <path d="M90 260 C360 120 520 400 760 260 S1180 120 1590 260" fill="none" stroke={theme.colors.accent} strokeWidth="8" strokeLinecap="round" strokeDasharray="1700" strokeDashoffset={1700 * (1 - pathProgress)} />
        {nodes.map((node, index) => {
          const x = 90 + index * 214;
          const reveal = interpolate(frame, [fps * (0.25 + index * 0.16), fps * (0.55 + index * 0.16)], [0, 1], clamp);
          return (
            <g key={node} transform={`translate(${x} ${index % 2 ? 315 : 180}) scale(${0.82 + reveal * 0.18})`} opacity={reveal}>
              <rect x="-70" y="-34" width="140" height="68" rx="14" fill="white" stroke={theme.colors.accent} strokeWidth="3" />
              <text textAnchor="middle" y="7" fontSize="24" fontWeight="760" fill={theme.colors.ink}>{node}</text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
