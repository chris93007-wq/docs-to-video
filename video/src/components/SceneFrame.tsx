import type {CSSProperties, ReactNode} from "react";
import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";
import {SceneDefinition} from "../data/timeline";
import {theme} from "../styles/theme";
import {clamp, fadeIn, fadeOut, rise} from "../utils/animation";

type SceneFrameProps = {
  scene: SceneDefinition;
  durationFrames: number;
  children: ReactNode;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  align?: "left" | "center";
  style?: CSSProperties;
};

export const SceneFrame = ({
  scene,
  durationFrames,
  children,
  eyebrow,
  title,
  subtitle,
  align = "left",
  style,
}: SceneFrameProps) => {
  const frame = useCurrentFrame();
  const fade = Math.min(
    fadeIn(frame, 0, 18),
    fadeOut(frame, durationFrames - 24, 24),
  );

  return (
    <AbsoluteFill
      style={{
        background: theme.gradients.page,
        color: theme.colors.ink,
        fontFamily: theme.typography.family,
        overflow: "hidden",
        ...style,
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(175,192,214,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(175,192,214,0.18) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          opacity: 0.34,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: fade,
        }}
      >
        {(eyebrow || title || subtitle) && (
          <div
            style={{
              position: "absolute",
              top: 76,
              left: align === "left" ? 96 : 0,
              right: align === "center" ? 0 : "auto",
              width: align === "center" ? "100%" : 820,
              textAlign: align,
              zIndex: 4,
            }}
          >
            {eyebrow && (
              <div
                style={{
                  ...theme.typography.label,
                  color: theme.colors.accent,
                  textTransform: "uppercase",
                  marginBottom: 20,
                  opacity: fadeIn(frame, 0, 16),
                }}
              >
                {eyebrow}
              </div>
            )}
            {title && (
              <div
                style={{
                  ...theme.typography.h1,
                  transform: `translateY(${rise(frame, 0, 18, 24)}px)`,
                }}
              >
                {title}
              </div>
            )}
            {subtitle && (
              <div
                style={{
                  ...theme.typography.body,
                  color: theme.colors.muted,
                  width: align === "center" ? 980 : 760,
                  margin: align === "center" ? "22px auto 0" : "22px 0 0",
                }}
              >
                {subtitle}
              </div>
            )}
          </div>
        )}
        {children}
      </div>
    </AbsoluteFill>
  );
};

type PillProps = {
  children: ReactNode;
  tone?: "blue" | "teal" | "gold" | "red" | "violet" | "dark";
  style?: CSSProperties;
};

const toneMap = {
  blue: [theme.colors.accent, theme.colors.accentSoft],
  teal: [theme.colors.teal, theme.colors.tealSoft],
  gold: [theme.colors.gold, theme.colors.goldSoft],
  red: [theme.colors.red, theme.colors.redSoft],
  violet: [theme.colors.violet, theme.colors.violetSoft],
  dark: [theme.colors.code, theme.colors.surfaceMuted],
};

export const Pill = ({children, tone = "blue", style}: PillProps) => {
  const [color, fill] = toneMap[tone];
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: theme.radius.pill,
        background: fill,
        color,
        padding: "12px 18px",
        ...theme.typography.small,
        fontWeight: 740,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Readout = ({
  label,
  value,
  progress,
  color = theme.colors.accent,
}: {
  label: string;
  value: string;
  progress: number;
  color?: string;
}) => {
  const width = interpolate(progress, [0, 1], [0, 100], clamp);
  return (
    <div style={{width: 380}}>
      <div style={{display: "flex", justifyContent: "space-between", marginBottom: 10}}>
        <span style={{...theme.typography.small, color: theme.colors.muted}}>{label}</span>
        <span style={{...theme.typography.small, color: theme.colors.ink, fontWeight: 760}}>{value}</span>
      </div>
      <div style={{height: 8, borderRadius: 99, background: theme.colors.surfaceMuted, overflow: "hidden"}}>
        <div style={{height: "100%", width: `${width}%`, background: color, borderRadius: 99}} />
      </div>
    </div>
  );
};
