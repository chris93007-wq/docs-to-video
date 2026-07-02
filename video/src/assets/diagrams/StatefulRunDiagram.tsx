import {interpolate} from "remotion";
import {EngineeringIcon, EngineeringIconName} from "../icons/EngineeringIcons";
import {theme} from "../../styles/theme";
import {clamp, drawStroke, sequenceOpacity} from "../../utils/animation";

type RunNode = {
  label: string;
  icon: EngineeringIconName;
  x: number;
  y: number;
  color: string;
  soft: string;
};

const nodes: RunNode[] = [
  {label: "Status", icon: "timeline", x: 130, y: 68, color: theme.colors.accent, soft: theme.colors.accentSoft},
  {label: "Blockers", icon: "shield", x: 548, y: 74, color: theme.colors.red, soft: theme.colors.redSoft},
  {label: "Approvals", icon: "approval", x: 548, y: 324, color: theme.colors.gold, soft: theme.colors.goldSoft},
  {label: "Artifacts", icon: "document", x: 350, y: 438, color: theme.colors.violet, soft: theme.colors.violetSoft},
  {label: "Events", icon: "database", x: 70, y: 315, color: theme.colors.teal, soft: theme.colors.tealSoft},
];

type Props = {
  frame: number;
};

export const StatefulRunDiagram = ({frame}: Props) => {
  const centerOpacity = interpolate(frame, [0, 24], [0, 1], clamp);
  const centerScale = interpolate(frame, [0, 32], [0.94, 1], clamp);
  const connectorOffset = drawStroke(frame, 18, 88);

  return (
    <svg width="720" height="520" viewBox="0 0 720 520" role="img" aria-label="Stateful SDD run diagram">
      <defs>
        <linearGradient id="stateful-run-center" x1="217" y1="120" x2="493" y2="400">
          <stop offset="0%" stopColor={theme.colors.accent} />
          <stop offset="100%" stopColor={theme.colors.teal} />
        </linearGradient>
        <filter id="stateful-run-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="24" stdDeviation="18" floodColor="#2B3A55" floodOpacity="0.14" />
        </filter>
      </defs>

      {nodes.map((node) => (
        <path
          key={`connector-${node.label}`}
          d={`M360 260 L${node.x + 44} ${node.y + 44}`}
          fill="none"
          stroke={theme.colors.lineStrong}
          strokeWidth="3"
          strokeDasharray="480"
          strokeDashoffset={480 * connectorOffset}
          strokeLinecap="round"
        />
      ))}

      <g opacity={centerOpacity} style={{transformOrigin: "360px 260px", transform: `scale(${centerScale})`}}>
        <circle cx="360" cy="260" r="112" fill="url(#stateful-run-center)" filter="url(#stateful-run-shadow)" />
        <circle cx="360" cy="260" r="84" fill="rgba(255,255,255,0.16)" />
        <path d="M318 258h84" stroke="white" strokeWidth="12" strokeLinecap="round" />
        <path d="M360 215v88" stroke="white" strokeWidth="12" strokeLinecap="round" />
        <text x="360" y="398" textAnchor="middle" fill={theme.colors.ink} fontSize="26" fontWeight="740">
          SDD run
        </text>
      </g>

      {nodes.map((node, index) => {
        const opacity = sequenceOpacity(frame - 35, index, 9);
        const lift = interpolate(opacity, [0, 1], [16, 0], clamp);
        return (
          <g
            key={node.label}
            opacity={opacity}
            style={{transform: `translateY(${lift}px)`}}
          >
            <rect x={node.x} y={node.y} width="150" height="88" rx="20" fill={node.soft} stroke={node.color} strokeWidth="2" />
            <EngineeringIcon name={node.icon} size={40} stroke={node.color} style={{transform: `translate(${node.x + 18}px, ${node.y + 22}px)`}} />
            <text x={node.x + 72} y={node.y + 53} fill={theme.colors.ink} fontSize="22" fontWeight="720">
              {node.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
