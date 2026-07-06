import {interpolate} from "remotion";
import {EngineeringIcon} from "../icons/EngineeringIcons";
import {theme} from "../../styles/theme";
import {clamp, sequenceOpacity} from "../../utils/animation";

type Props = {
  frame: number;
};

const rows = [
  {left: "Reviewed requirements", right: "Design approval", tone: theme.colors.accent},
  {left: "Unit Test Target Plan", right: "TDD unit tests", tone: theme.colors.red},
  {left: "Implementation slices", right: "Drift checks", tone: theme.colors.teal},
  {left: "Browser evidence", right: "Lifecycle status", tone: theme.colors.violet},
];

export const GateDiagram = ({frame}: Props) => (
  <svg width="900" height="620" viewBox="0 0 900 620" role="img" aria-label="SDD validation gate evidence">
    <defs>
      <linearGradient id="gate-core" x1="330" y1="80" x2="570" y2="540">
        <stop offset="0%" stopColor={theme.colors.code} />
        <stop offset="100%" stopColor={theme.colors.codeSoft} />
      </linearGradient>
    </defs>
    <rect x="330" y="74" width="240" height="472" rx="32" fill="url(#gate-core)" />
    <path d="M390 546V232h120v314" fill="none" stroke="white" strokeWidth="6" opacity="0.75" />
    <path d="M362 232h176l-88-110z" fill="none" stroke="white" strokeWidth="6" opacity="0.75" />
    <EngineeringIcon name="gate" size={76} stroke="white" style={{transform: "translate(412px, 268px)"}} />
    <text x="450" y="392" textAnchor="middle" fill="white" fontSize="31" fontWeight="760">
      Gate
    </text>
    <text x="450" y="426" textAnchor="middle" fill="#B7C7DD" fontSize="18" fontWeight="600">
      evidence, not claims
    </text>

    {rows.map((row, index) => {
      const y = 110 + index * 118;
      const opacity = sequenceOpacity(frame - 10, index, 14);
      const leftX = interpolate(opacity, [0, 1], [82, 106], clamp);
      const rightX = interpolate(opacity, [0, 1], [698, 674], clamp);
      return (
        <g key={row.left} opacity={opacity}>
          <rect x={leftX} y={y} width="206" height="72" rx="16" fill={theme.colors.surface} stroke={row.tone} strokeWidth="3" />
          <rect x={rightX} y={y} width="206" height="72" rx="16" fill={theme.colors.surface} stroke={row.tone} strokeWidth="3" />
          <path d={`M${leftX + 206} ${y + 36}H330`} stroke={row.tone} strokeWidth="4" strokeLinecap="round" opacity="0.7" />
          <path d={`M570 ${y + 36}H${rightX}`} stroke={row.tone} strokeWidth="4" strokeLinecap="round" opacity="0.7" />
          <text x={leftX + 103} y={y + 43} textAnchor="middle" fill={theme.colors.ink} fontSize="19" fontWeight="720">
            {row.left}
          </text>
          <text x={rightX + 103} y={y + 43} textAnchor="middle" fill={theme.colors.ink} fontSize="19" fontWeight="720">
            {row.right}
          </text>
        </g>
      );
    })}
  </svg>
);
