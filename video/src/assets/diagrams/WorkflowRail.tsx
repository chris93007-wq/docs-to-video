import {interpolate} from "remotion";
import {EngineeringIcon, EngineeringIconName} from "../icons/EngineeringIcons";
import {theme} from "../../styles/theme";
import {clamp, drawStroke} from "../../utils/animation";

type Phase = {
  label: string;
  short: string;
  icon: EngineeringIconName;
  color: string;
};

const phases: Phase[] = [
  {label: "Requirements intake", short: "Intake", icon: "jira", color: theme.colors.accent},
  {label: "Design authoring", short: "Design", icon: "document", color: theme.colors.violet},
  {label: "Implementation plan", short: "Plan", icon: "timeline", color: theme.colors.gold},
  {label: "Red-phase Jest", short: "Jest", icon: "gate", color: theme.colors.red},
  {label: "Bounded implementation", short: "Build", icon: "code", color: theme.colors.teal},
  {label: "Playwright validation", short: "Browser", icon: "browser", color: theme.colors.accent},
  {label: "Lifecycle update", short: "Close", icon: "check", color: theme.colors.teal},
];

type Props = {
  frame: number;
};

export const WorkflowRail = ({frame}: Props) => {
  const pathDraw = drawStroke(frame, 10, 140);
  const activeProgress = interpolate(frame, [10, 190], [0, phases.length - 1], clamp);

  return (
    <svg width="1500" height="530" viewBox="0 0 1500 530" role="img" aria-label="Canonical SDD workflow">
      <defs>
        <marker id="workflow-arrow" markerWidth="16" markerHeight="16" refX="8" refY="8" orient="auto">
          <path d="M2 2 14 8 2 14Z" fill={theme.colors.lineStrong} />
        </marker>
      </defs>
      <path
        d="M130 246 C290 145 395 347 548 246 S820 147 975 246 1223 345 1370 246"
        fill="none"
        stroke={theme.colors.lineStrong}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="1700"
        strokeDashoffset={1700 * pathDraw}
        markerEnd="url(#workflow-arrow)"
      />
      {phases.map((phase, index) => {
        const x = 130 + index * 205;
        const y = index % 2 === 0 ? 190 : 285;
        const appear = interpolate(frame, [24 + index * 14, 48 + index * 14], [0, 1], clamp);
        const active = activeProgress >= index ? 1 : 0;
        const nodeScale = interpolate(appear, [0, 1], [0.86, 1], clamp);
        return (
          <g key={phase.label} opacity={appear} style={{transformOrigin: `${x}px ${y}px`, transform: `scale(${nodeScale})`}}>
            <circle cx={x} cy={y} r="61" fill={active ? phase.color : theme.colors.surface} stroke={phase.color} strokeWidth="4" />
            <circle cx={x} cy={y} r="74" fill="none" stroke={phase.color} strokeWidth="2" opacity={active ? 0.2 : 0.08} />
            <EngineeringIcon name={phase.icon} size={50} stroke={active ? theme.colors.white : phase.color} style={{transform: `translate(${x - 25}px, ${y - 31}px)`}} />
            <text x={x} y={y + 74} textAnchor="middle" fill={theme.colors.ink} fontSize="25" fontWeight="740">
              {phase.short}
            </text>
            <text x={x} y={y + 105} textAnchor="middle" fill={theme.colors.muted} fontSize="17" fontWeight="560">
              {phase.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
