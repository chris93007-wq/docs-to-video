import type {CSSProperties, ReactNode} from "react";
import {interpolate} from "remotion";
import {EngineeringIcon, EngineeringIconName} from "../../../assets/icons/EngineeringIcons";
import {theme} from "../../../styles/theme";
import {clamp} from "../../../utils/animation";
import type {VisualLanguageScene} from "./types";

export const primitiveColors = [
  theme.colors.accent,
  theme.colors.teal,
  theme.colors.violet,
  theme.colors.gold,
  theme.colors.red,
];

export const cleanLabel = (value: string, max = 34) => {
  const compact = value.replace(/\[[^\]]+\]\([^)]+\)/g, "").replace(/\s+/g, " ").trim();
  return compact.length > max ? `${compact.slice(0, max - 3)}...` : compact;
};

export const labelsForScene = (scene: VisualLanguageScene, fallbackCount = 5) => {
  const defaultLabelsByScene: Record<string, string[]> = {
    hook: ["Scope", "Validation", "Evidence", "Control plane", "Source of truth"],
    problem: ["Which skill?", "Which artifact?", "Stop here?", "Gate ready?", "Thread context"],
    pain: ["Scattered context", "Approval drift", "Unbounded slices", "Stale evidence", "Manual fan-in"],
    solution: ["Status", "Blockers", "Approvals", "Artifacts", "Events"],
    workflow: ["Requirements", "Design", "Plan", "Unit tests", "Build", "Validation"],
    benefits: ["Lower cognitive load", "Easier onboarding", "Resumable execution", "Safer fan-out", "Stronger traceability"],
    "developer-experience": ["create", "auto-run", "status", "approve", "manifest"],
    conclusion: ["Specs true", "Bounded work", "Evidence linked", "Move quickly", "Keep control"],
  };
  const defaults = defaultLabelsByScene[scene.id] ?? ["Source", "Model", "Plan", "Evidence", "Video"];
  const preferDefaults = new Set([
    "hook",
    "problem",
    "pain",
    "benefits",
    "conclusion",
  ]).has(scene.id);
  const labels = [
    ...(scene.animation?.focus ?? []),
    ...(scene.visual.emphasis ?? []),
    scene.teachingPoint,
  ].filter(Boolean);

  const orderedLabels = preferDefaults ? [...defaults, ...labels] : [...labels, ...defaults];
  const unique: string[] = [];
  for (const label of orderedLabels) {
    if (unique.length >= fallbackCount) {
      break;
    }
    const cleaned = cleanLabel(label);
    if (!unique.includes(cleaned)) {
      unique.push(cleaned);
    }
  }

  return unique.slice(0, fallbackCount);
};

export const iconForIndex = (index: number): EngineeringIconName => {
  const icons: EngineeringIconName[] = [
    "document",
    "timeline",
    "gate",
    "database",
    "terminal",
    "check",
    "branch",
    "approval",
  ];
  return icons[index % icons.length];
};

export const revealAt = (frame: number, fps: number, index: number, gapSeconds = 0.38) =>
  interpolate(frame, [fps * (0.5 + index * gapSeconds), fps * (1.05 + index * gapSeconds)], [0, 1], clamp);

export const TechnicalGrid = ({opacity = 0.34}: {opacity?: number}) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      backgroundImage:
        "linear-gradient(rgba(175,192,214,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(175,192,214,0.18) 1px, transparent 1px)",
      backgroundSize: "64px 64px",
      opacity,
    }}
  />
);

export const MiniNode = ({
  label,
  color,
  icon,
  style,
}: {
  label: string;
  color: string;
  icon?: EngineeringIconName;
  style?: CSSProperties;
}) => (
  <div
    style={{
      borderRadius: theme.radius.md,
      background: "rgba(255,255,255,0.92)",
      border: `2px solid ${color}`,
      boxShadow: theme.shadow.line,
      padding: "16px 18px",
      display: "flex",
      alignItems: "center",
      gap: 12,
      minHeight: 74,
      ...style,
    }}
  >
    {icon && <EngineeringIcon name={icon} stroke={color} size={34} />}
    <div style={{...theme.typography.small, color: theme.colors.ink, fontWeight: 760}}>
      {label}
    </div>
  </div>
);

export const TerminalChrome = ({
  title,
  children,
  style,
}: {
  title: string;
  children: ReactNode;
  style?: CSSProperties;
}) => (
  <div
    style={{
      background: theme.gradients.dark,
      borderRadius: theme.radius.lg,
      padding: 24,
      color: theme.colors.white,
      boxShadow: "0 26px 80px rgba(18, 24, 38, 0.22)",
      ...style,
    }}
  >
    <div style={{display: "flex", alignItems: "center", gap: 10, marginBottom: 22}}>
      <span style={{width: 12, height: 12, borderRadius: 99, background: theme.colors.red}} />
      <span style={{width: 12, height: 12, borderRadius: 99, background: theme.colors.gold}} />
      <span style={{width: 12, height: 12, borderRadius: 99, background: theme.colors.teal}} />
      <span style={{...theme.typography.small, marginLeft: 16, color: "#B7C7DD"}}>{title}</span>
    </div>
    {children}
  </div>
);
