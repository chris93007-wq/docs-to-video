import {interpolate} from "remotion";
import {theme} from "../../styles/theme";
import {clamp, drawStroke} from "../../utils/animation";

type BrandMarkProps = {
  frame: number;
  size?: number;
};

export const BrandMark = ({frame, size = 220}: BrandMarkProps) => {
  const strokeOffset = drawStroke(frame, 8, 60);
  const pulse = interpolate(frame % 90, [0, 45, 90], [0.92, 1, 0.92], clamp);

  return (
    <svg width={size} height={size} viewBox="0 0 220 220" aria-label="SDD orchestrator mark">
      <defs>
        <linearGradient id="brand-mark-gradient" x1="22" y1="20" x2="190" y2="194">
          <stop offset="0%" stopColor={theme.colors.accent} />
          <stop offset="55%" stopColor={theme.colors.teal} />
          <stop offset="100%" stopColor={theme.colors.violet} />
        </linearGradient>
        <filter id="brand-mark-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="18" stdDeviation="15" floodColor="#2F405B" floodOpacity="0.18" />
        </filter>
      </defs>
      <circle cx="110" cy="110" r="88" fill="white" filter="url(#brand-mark-shadow)" />
      <path
        d="M59 113c0-31 22-55 51-55s51 24 51 55-22 55-51 55-51-24-51-55Z"
        fill="none"
        stroke="url(#brand-mark-gradient)"
        strokeWidth="15"
        strokeDasharray="360"
        strokeDashoffset={360 * strokeOffset}
        strokeLinecap="round"
      />
      <g style={{transformOrigin: "110px 110px", transform: `scale(${pulse})`}}>
        <circle cx="110" cy="110" r="34" fill={theme.colors.code} />
        <path d="M94 111h32" stroke="white" strokeWidth="8" strokeLinecap="round" />
        <path d="M111 94v33" stroke="white" strokeWidth="8" strokeLinecap="round" />
      </g>
      {[
        [110, 32],
        [178, 110],
        [110, 188],
        [42, 110],
      ].map(([cx, cy], index) => {
        const opacity = interpolate(frame, [18 + index * 10, 38 + index * 10], [0, 1], clamp);
        return <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="9" fill={theme.colors.teal} opacity={opacity} />;
      })}
    </svg>
  );
};
