import type {ReactNode} from "react";
import {interpolate, useCurrentFrame} from "remotion";
import {EngineeringIcon, EngineeringIconName} from "../../../../assets/icons/EngineeringIcons";
import {clamp, fadeIn, sequenceOpacity} from "../../../../utils/animation";
import {oracleAssets, useOracleBrand, useShowcaseTheme} from "./brand";

export type ShowcaseScene = typeof import("../../../../compiler/generated/render-manifest.json")["scenes"][number];
export type ShowcaseShot = NonNullable<typeof import("../../../../compiler/generated/render-manifest.json")["shots"]>[number];
export type ShowcaseEdl = NonNullable<typeof import("../../../../compiler/generated/render-manifest.json")["edl"]>["decisions"][number];

export type ShowcaseLiveDemoAsset = {
  id: string;
  kind: "image" | "video";
  staticFile: string;
  sourceFile: string;
  sourceStartSeconds: number;
  sourceDurationSeconds?: number;
};

export type ShowcaseLiveDemo = {
  featureKey: string;
  provenanceFile: string;
  assets: ShowcaseLiveDemoAsset[];
  developerExperience: {
    assetId: string;
    revealSeconds: number;
  };
  workflowProofs: Array<{
    assetId: string;
    startSeconds: number;
    endSeconds: number;
    objectPosition: string;
  }>;
};

export type ShowcasePresentationMode = "default" | "live-demo-hybrid";

export type ShowcaseSceneProps = {
  scene: ShowcaseScene;
  shots: ShowcaseShot[];
  edl: ShowcaseEdl[];
  fps: number;
  presentationMode?: ShowcasePresentationMode;
  liveDemo?: ShowcaseLiveDemo | null;
};

export const cleanText = (value: string, max = 142) => {
  const text = String(value ?? "").replace(/\[[^\]]+\]\([^)]+\)/g, "").replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max - 3)}...` : text;
};

export const useSceneBeats = ({scene, shots, fps}: ShowcaseSceneProps) => {
  const frame = useCurrentFrame();
  const startFor = (index: number, fallbackSeconds: number) => {
    const shot = shots[index];
    if (!shot) {
      return Math.round(fallbackSeconds * fps);
    }
    return Math.max(0, Math.round((shot.startSeconds - scene.startSeconds) * fps));
  };
  const fadeAt = (index: number, fallbackSeconds: number, frames = 18) =>
    fadeIn(frame, startFor(index, fallbackSeconds), frames);
  const cue = (index: number, fallback: string, max = 72) =>
    cleanText(shots[index]?.onScreenText?.[0] ?? fallback, max);

  return {frame, startFor, fadeAt, cue};
};

export const ShowcaseFrame = ({
  eyebrow,
  title,
  subtitle,
  children,
  align = "left",
}: {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  align?: "left" | "center";
}) => {
  const frame = useCurrentFrame();
  const theme = useShowcaseTheme();
  const isOracle = useOracleBrand();
  return (
    <div style={{position: "absolute", inset: 0, overflow: "hidden", background: theme.gradients.page, color: theme.colors.ink, fontFamily: theme.typography.family}}>
      {isOracle ? (
        <>
          <img src={oracleAssets.texture} style={{position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.075, mixBlendMode: "multiply"}} />
          <div style={{position: "absolute", inset: -80, background: "radial-gradient(circle at 78% 24%, rgba(92,146,109,0.12), transparent 34%), radial-gradient(circle at 16% 82%, rgba(222,176,104,0.12), transparent 36%)"}} />
          <img src={oracleAssets.logo} style={{position: "absolute", right: 96, top: 68, width: 190, height: "auto", objectFit: "contain", zIndex: 8}} />
          <img src={oracleAssets.oTag} style={{position: "absolute", right: 42, bottom: 42, width: 42, height: 42, objectFit: "contain", zIndex: 8}} />
        </>
      ) : (
        <>
          <div style={{position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(175,192,214,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(175,192,214,0.18) 1px, transparent 1px)", backgroundSize: "64px 64px", opacity: 0.26}} />
          <div style={{position: "absolute", inset: -80, background: "radial-gradient(circle at 72% 28%, rgba(47,128,237,0.14), transparent 32%), radial-gradient(circle at 18% 78%, rgba(0,168,142,0.14), transparent 34%)"}} />
        </>
      )}
      {(eyebrow || title || subtitle) ? (
        <div style={{position: "absolute", top: 76, left: align === "left" ? 96 : 0, right: align === "center" ? 0 : "auto", width: align === "center" ? "100%" : 880, textAlign: align, zIndex: 5}}>
          {eyebrow ? <div style={{...theme.typography.label, color: theme.colors.accent, textTransform: "uppercase", marginBottom: 20, opacity: fadeIn(frame, 0, 16)}}>{eyebrow}</div> : null}
          {title ? <div style={{...theme.typography.h1, maxWidth: align === "center" ? 1280 : 900, margin: align === "center" ? "0 auto" : 0}}>{title}</div> : null}
          {subtitle ? <div style={{...theme.typography.body, color: theme.colors.muted, width: align === "center" ? 1000 : 760, margin: align === "center" ? "22px auto 0" : "22px 0 0"}}>{subtitle}</div> : null}
        </div>
      ) : null}
      {children}
    </div>
  );
};

export const FloatingChip = ({
  icon,
  label,
  detail,
  color,
  x,
  y,
  opacity,
}: {
  icon: EngineeringIconName;
  label: string;
  detail?: string;
  color: string;
  x: number;
  y: number;
  opacity: number;
}) => {
  const theme = useShowcaseTheme();
  return (
    <div style={{position: "absolute", left: x, top: y, width: 250, padding: 20, borderRadius: theme.radius.lg, background: "rgba(255,255,255,0.94)", border: `2px solid ${color}`, boxShadow: theme.shadow.soft, opacity, transform: `translateY(${interpolate(opacity, [0, 1], [18, 0], clamp)}px)`}}>
      <EngineeringIcon name={icon} stroke={color} size={48} />
      <div style={{...theme.typography.label, color: theme.colors.ink, marginTop: 12}}>{label}</div>
      {detail ? <div style={{...theme.typography.small, color: theme.colors.muted, marginTop: 8}}>{detail}</div> : null}
    </div>
  );
};

export const CodeWindow = ({
  title,
  lines,
  frame,
  start,
  accent,
}: {
  title: string;
  lines: string[];
  frame: number;
  start: number;
  accent?: string;
}) => {
  const theme = useShowcaseTheme();
  const resolvedAccent = accent ?? theme.colors.teal;
  return (
  <div style={{background: theme.gradients.dark, borderRadius: theme.radius.lg, padding: 26, boxShadow: "0 26px 80px rgba(18, 24, 38, 0.22)", color: theme.colors.white, minHeight: 360}}>
    <div style={{display: "flex", alignItems: "center", gap: 10, marginBottom: 24}}>
      <span style={{width: 12, height: 12, borderRadius: 99, background: theme.colors.red}} />
      <span style={{width: 12, height: 12, borderRadius: 99, background: theme.colors.gold}} />
      <span style={{width: 12, height: 12, borderRadius: 99, background: theme.colors.teal}} />
      <span style={{...theme.typography.small, marginLeft: 16, color: "#B7C7DD"}}>{title}</span>
    </div>
    <div style={{fontFamily: theme.typography.mono, fontSize: 22, lineHeight: 1.48}}>
      {lines.map((line, index) => {
        const opacity = sequenceOpacity(frame - start, index, 12);
        return (
          <div key={line} style={{opacity, color: index === 0 ? "#FFFFFF" : "#C8D4E4"}}>
            <span style={{color: resolvedAccent}}>{title === "Codex" ? ">" : "$"}</span> {line}
          </div>
        );
      })}
    </div>
  </div>
  );
};

export const TimingPill = ({children, opacity, tone = "dark"}: {children: string; opacity: number; tone?: "blue" | "teal" | "gold" | "red" | "violet" | "dark"}) => {
  const theme = useShowcaseTheme();
  const isOracle = useOracleBrand();
  const oracleTone = {
    blue: theme.colors.accent,
    teal: theme.colors.teal,
    gold: theme.colors.gold,
    red: theme.colors.red,
    violet: theme.colors.violet,
    dark: theme.colors.code,
  }[tone];
  const legacyFill = {
    blue: theme.colors.accentSoft,
    teal: theme.colors.tealSoft,
    gold: theme.colors.goldSoft,
    red: theme.colors.redSoft,
    violet: theme.colors.violetSoft,
    dark: theme.colors.surfaceMuted,
  }[tone];
  return (
    <div style={{opacity, transform: `translateY(${interpolate(opacity, [0, 1], [18, 0], clamp)}px)`}}>
      {isOracle ? (
        <div style={{padding: "10px 16px", borderRadius: theme.radius.pill, background: `${oracleTone}1F`, border: `1px solid ${oracleTone}`, color: theme.colors.ink, ...theme.typography.small, fontWeight: 700}}>{children}</div>
      ) : (
        <div style={{display: "inline-flex", alignItems: "center", borderRadius: theme.radius.pill, background: legacyFill, color: oracleTone, padding: "12px 18px", ...theme.typography.small, fontWeight: 740}}>{children}</div>
      )}
    </div>
  );
};
