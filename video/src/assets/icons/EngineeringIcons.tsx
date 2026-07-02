import type {CSSProperties, ReactNode} from "react";

export type EngineeringIconName =
  | "approval"
  | "branch"
  | "browser"
  | "check"
  | "cloud"
  | "code"
  | "confluence"
  | "database"
  | "document"
  | "gate"
  | "jira"
  | "play"
  | "shield"
  | "terminal"
  | "timeline"
  | "worker";

type IconProps = {
  name: EngineeringIconName;
  size?: number;
  stroke?: string;
  fill?: string;
  style?: CSSProperties;
};

const iconPaths: Record<EngineeringIconName, ReactNode> = {
  approval: (
    <>
      <path d="M12 22h24c3.3 0 6 2.7 6 6v8c0 3.3-2.7 6-6 6H12c-3.3 0-6-2.7-6-6v-8c0-3.3 2.7-6 6-6Z" />
      <path d="m17 32 6 6 14-15" />
      <path d="M14 14h20" />
      <path d="M20 6h8v16h-8z" />
    </>
  ),
  branch: (
    <>
      <path d="M14 10v18c0 7.7 6.3 14 14 14h6" />
      <path d="M14 28h14c5.5 0 10-4.5 10-10v-6" />
      <circle cx="14" cy="10" r="5" />
      <circle cx="38" cy="12" r="5" />
      <circle cx="38" cy="42" r="5" />
    </>
  ),
  browser: (
    <>
      <rect x="6" y="9" width="42" height="34" rx="5" />
      <path d="M6 18h42" />
      <circle cx="14" cy="14" r="1.5" />
      <circle cx="20" cy="14" r="1.5" />
      <path d="M15 29h18" />
      <path d="M15 35h10" />
    </>
  ),
  check: (
    <>
      <circle cx="27" cy="27" r="21" />
      <path d="m17 28 7 7 15-17" />
    </>
  ),
  cloud: (
    <>
      <path d="M17 40h21a10 10 0 0 0 1-20 15 15 0 0 0-28-3A11.5 11.5 0 0 0 17 40Z" />
      <path d="M21 30h12" />
      <path d="M27 24v12" />
    </>
  ),
  code: (
    <>
      <rect x="6" y="8" width="42" height="38" rx="5" />
      <path d="M17 20 11 27l6 7" />
      <path d="m37 20 6 7-6 7" />
      <path d="m31 17-8 20" />
    </>
  ),
  confluence: (
    <>
      <path d="M13 18c6-7 14-7 20 0l4 5" />
      <path d="M41 36c-6 7-14 7-20 0l-4-5" />
      <path d="M10 32c-3-3-3-8 0-11l2-2" />
      <path d="M44 22c3 3 3 8 0 11l-2 2" />
    </>
  ),
  database: (
    <>
      <ellipse cx="27" cy="13" rx="18" ry="7" />
      <path d="M9 13v26c0 3.9 8.1 7 18 7s18-3.1 18-7V13" />
      <path d="M9 26c0 3.9 8.1 7 18 7s18-3.1 18-7" />
    </>
  ),
  document: (
    <>
      <path d="M14 6h18l10 10v32H14z" />
      <path d="M32 6v11h10" />
      <path d="M21 26h14" />
      <path d="M21 34h18" />
      <path d="M21 42h10" />
    </>
  ),
  gate: (
    <>
      <path d="M10 44V16h34v28" />
      <path d="M18 44V24h18v20" />
      <path d="M10 16l17-9 17 9" />
      <path d="M18 28h18" />
      <path d="M18 36h18" />
    </>
  ),
  jira: (
    <>
      <rect x="8" y="8" width="38" height="38" rx="7" />
      <path d="M17 18h20" />
      <path d="M17 27h20" />
      <path d="M17 36h11" />
      <circle cx="14" cy="18" r="1" />
      <circle cx="14" cy="27" r="1" />
      <circle cx="14" cy="36" r="1" />
    </>
  ),
  play: (
    <>
      <circle cx="27" cy="27" r="21" />
      <path d="M22 17v20l17-10z" />
    </>
  ),
  shield: (
    <>
      <path d="M27 6 44 13v13c0 11-7 18-17 22C17 44 10 37 10 26V13z" />
      <path d="m18 27 6 6 13-15" />
    </>
  ),
  terminal: (
    <>
      <rect x="6" y="9" width="42" height="36" rx="5" />
      <path d="m15 22 7 6-7 6" />
      <path d="M26 35h13" />
    </>
  ),
  timeline: (
    <>
      <path d="M10 27h34" />
      <circle cx="13" cy="27" r="5" />
      <circle cx="27" cy="27" r="5" />
      <circle cx="41" cy="27" r="5" />
      <path d="M13 14v8" />
      <path d="M27 32v8" />
      <path d="M41 14v8" />
    </>
  ),
  worker: (
    <>
      <circle cx="27" cy="17" r="9" />
      <path d="M12 46c2.4-9 8-14 15-14s12.6 5 15 14" />
      <path d="M20 16h14" />
      <path d="M22 9h10" />
    </>
  ),
};

export const EngineeringIcon = ({
  name,
  size = 54,
  stroke = "currentColor",
  fill = "none",
  style,
}: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 54 54"
    fill={fill}
    stroke={stroke}
    strokeWidth={2.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
  >
    {iconPaths[name]}
  </svg>
);
