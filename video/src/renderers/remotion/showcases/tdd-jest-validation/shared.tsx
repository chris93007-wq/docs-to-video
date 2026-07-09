import type {CSSProperties, ReactNode} from "react";
import {Img, interpolate, spring, staticFile, useCurrentFrame} from "remotion";
import {EngineeringIcon, type EngineeringIconName} from "../../../../assets/icons/EngineeringIcons";
import {clamp} from "../../../../utils/animation";
import {oracleAssets} from "../sdd-orchestrator/brand";

export const tddPalette = {
  black: "#101210",
  panel: "#191C1A",
  panelRaised: "#222622",
  line: "#3A403B",
  lineSoft: "rgba(241,239,237,0.14)",
  cream: "#F1EFED",
  white: "#FFFFFF",
  muted: "#B9B4AF",
  red: "#C74634",
  redSoft: "#F8E2DE",
  green: "#6FA67B",
  greenBright: "#8FC79A",
  greenSoft: "#E3EEE6",
  gold: "#F1B13F",
  goldSoft: "#FFF0D2",
  ink: "#161513",
};

export const reveal = (frame: number, start = 0, duration = 18) =>
  interpolate(frame, [start, start + duration], [0, 1], clamp);

export const drift = (frame: number, amplitude = 8, speed = 0.025, offset = 0) =>
  Math.sin(frame * speed + offset) * amplitude;

export const enter = (frame: number, fps: number, delay = 0) =>
  spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: {damping: 22, stiffness: 105, mass: 0.82},
  });

export const toneColor = (tone: string) => {
  const tones: Record<string, string> = {
    red: tddPalette.red,
    green: tddPalette.greenBright,
    gold: tddPalette.gold,
    cream: tddPalette.cream,
  };
  return tones[tone] ?? tddPalette.cream;
};

export const SceneShell = ({
  eyebrow,
  title,
  subtitle,
  children,
  headerWidth = 1120,
  showHeader = true,
}: {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  headerWidth?: number;
  showHeader?: boolean;
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: tddPalette.black,
        color: tddPalette.cream,
        fontFamily: "Oracle Sans, Arial, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 84% 16%, rgba(199,70,52,0.13), transparent 30%), radial-gradient(circle at 12% 88%, rgba(111,166,123,0.12), transparent 34%), linear-gradient(145deg, #101210 0%, #171A17 48%, #0E100E 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.09,
          backgroundImage:
            "linear-gradient(rgba(241,239,237,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(241,239,237,0.16) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "linear-gradient(to bottom, black, transparent 88%)",
        }}
      />
      <Img
        src={oracleAssets.texture}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0.035,
          mixBlendMode: "screen",
        }}
      />
      <Img
        src={oracleAssets.logo}
        style={{position: "absolute", right: 82, top: 54, width: 184, height: "auto", zIndex: 20}}
      />
      <div style={{position: "absolute", left: 82, bottom: 42, display: "flex", alignItems: "center", gap: 12, zIndex: 20}}>
        <div style={{width: 28, height: 3, borderRadius: 9, background: tddPalette.red}} />
        <span style={{fontSize: 15, letterSpacing: 1.7, fontWeight: 700, color: "rgba(241,239,237,0.58)"}}>
          TDD JEST VALIDATION GATE
        </span>
      </div>
      {showHeader ? (
        <div style={{position: "absolute", left: 92, top: 62, width: headerWidth, zIndex: 12}}>
          {eyebrow ? (
            <div
              style={{
                fontSize: 17,
                lineHeight: 1.2,
                letterSpacing: 2.4,
                fontWeight: 700,
                color: tddPalette.gold,
                opacity: reveal(frame, 2, 14),
              }}
            >
              {eyebrow}
            </div>
          ) : null}
          {title ? (
            <div
              style={{
                fontSize: 64,
                lineHeight: 1.01,
                letterSpacing: -1.4,
                fontWeight: 700,
                marginTop: 15,
                opacity: reveal(frame, 8, 18),
                transform: `translateY(${interpolate(reveal(frame, 8, 18), [0, 1], [18, 0], clamp)}px)`,
              }}
            >
              {title}
            </div>
          ) : null}
          {subtitle ? (
            <div
              style={{
                width: Math.min(headerWidth, 1000),
                fontSize: 26,
                lineHeight: 1.32,
                color: tddPalette.muted,
                marginTop: 17,
                opacity: reveal(frame, 18, 18),
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>
      ) : null}
      {children}
    </div>
  );
};

export const Panel = ({
  children,
  accent,
  style,
}: {
  children: ReactNode;
  accent?: string;
  style?: CSSProperties;
}) => (
  <div
    style={{
      borderRadius: 22,
      border: `1px solid ${accent ?? tddPalette.line}`,
      background: "linear-gradient(145deg, rgba(34,38,34,0.98), rgba(22,25,23,0.98))",
      boxShadow: "0 28px 80px rgba(0,0,0,0.28)",
      overflow: "hidden",
      ...style,
    }}
  >
    {children}
  </div>
);

export const IconBadge = ({
  icon,
  color,
  size = 54,
}: {
  icon: EngineeringIconName;
  color: string;
  size?: number;
}) => (
  <div
    style={{
      width: size + 24,
      height: size + 24,
      borderRadius: 18,
      display: "grid",
      placeItems: "center",
      background: `${color}20`,
      border: `1px solid ${color}82`,
      flex: "0 0 auto",
    }}
  >
    <EngineeringIcon name={icon} size={size} stroke={color} />
  </div>
);

export const TerminalPanel = ({
  title,
  lines,
  accent = tddPalette.greenBright,
  compact = false,
}: {
  title: string;
  lines: readonly string[];
  accent?: string;
  compact?: boolean;
}) => {
  const frame = useCurrentFrame();
  return (
    <Panel style={{height: "100%", background: "#111411"}} accent={`${accent}66`}>
      <div style={{height: 48, borderBottom: `1px solid ${tddPalette.line}`, display: "flex", alignItems: "center", gap: 8, padding: "0 18px"}}>
        {[tddPalette.red, tddPalette.gold, tddPalette.green].map((color) => (
          <span key={color} style={{width: 10, height: 10, borderRadius: 99, background: color}} />
        ))}
        <span style={{fontSize: 16, color: tddPalette.muted, marginLeft: 10}}>{title}</span>
      </div>
      <div style={{padding: compact ? "18px 22px" : "26px 28px", fontFamily: "SFMono-Regular, Menlo, Consolas, monospace", fontSize: compact ? 19 : 22, lineHeight: 1.55}}>
        {lines.map((line, index) => (
          <div key={`${line}-${index}`} style={{opacity: reveal(frame, 8 + index * 8, 14), color: index === 0 ? tddPalette.white : "#C9D0C9"}}>
            <span style={{color: accent}}>{index === 0 ? ">" : "$"}</span> {line}
          </div>
        ))}
      </div>
    </Panel>
  );
};

export const MediaPanel = ({
  source,
  label,
  fallback,
  objectPosition = "center",
  mediaStyle,
}: {
  source?: string;
  label: string;
  fallback: ReactNode;
  objectPosition?: string;
  mediaStyle?: CSSProperties;
}) => (
  <Panel style={{position: "relative", width: "100%", height: "100%", background: "#111411"}}>
    {source ? (
      <Img
        src={staticFile(source)}
        style={{position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition, ...mediaStyle}}
      />
    ) : (
      fallback
    )}
    <div
      style={{
        position: "absolute",
        left: 20,
        top: 18,
        padding: "8px 12px",
        borderRadius: 999,
        background: "rgba(16,18,16,0.82)",
        border: `1px solid ${tddPalette.lineSoft}`,
        color: tddPalette.cream,
        fontSize: 14,
        letterSpacing: 1.4,
        fontWeight: 700,
      }}
    >
      {label}
    </div>
  </Panel>
);

export const SmallCheck = ({label, active = true}: {label: string; active?: boolean}) => (
  <div style={{display: "flex", alignItems: "center", gap: 10, color: active ? tddPalette.cream : tddPalette.muted}}>
    <div
      style={{
        width: 22,
        height: 22,
        borderRadius: 99,
        display: "grid",
        placeItems: "center",
        background: active ? `${tddPalette.green}30` : "rgba(255,255,255,0.06)",
        border: `1px solid ${active ? tddPalette.green : tddPalette.line}`,
        color: active ? tddPalette.greenBright : tddPalette.muted,
        fontSize: 14,
        fontWeight: 800,
      }}
    >
      {active ? "✓" : "·"}
    </div>
    <span style={{fontSize: 18, lineHeight: 1.2}}>{label}</span>
  </div>
);
