import {interpolate} from "remotion";
import {EngineeringIcon} from "../../../assets/icons/EngineeringIcons";
import {theme} from "../../../styles/theme";
import {clamp, fadeIn} from "../../../utils/animation";
import {TerminalChrome, primitiveColors, revealAt} from "./shared";
import type {VisualPrimitiveProps} from "./types";

const defaultCodexLines = [
  "Run this workflow for the Jira issue.",
  "Register durable artifacts.",
  "Stop for required approvals.",
  "Report blockers honestly.",
];

const defaultCliLines = [
  "npm run docs-video -- compile input.md",
  "npm run docs-video -- inspect story",
  "npm run docs-video -- validate-experience input.md",
  "npm run docs-video -- render input.md",
];

const runtimeEvents = [
  "run.created",
  "artifact.registered",
  "approval.required",
  "gate.checked",
  "manifest.written",
  "render.ready",
];

const codeLinesFor = (scene: VisualPrimitiveProps["scene"], type: "codex" | "cli") => {
  const sceneText = JSON.stringify({
    title: scene.title,
    purpose: scene.purpose,
    teachingPoint: scene.teachingPoint,
    emphasis: scene.visual.emphasis,
  });

  if (/sdd|orchestrator|skills are already in the repo|same runtime/i.test(sceneText) || scene.id === "developer-experience") {
    return type === "codex"
      ? [
          "Run SDD for RX-12345.",
          "Use the SDD coordinator.",
          "Create TDD unit tests.",
          "Register durable artifacts.",
          "Stop for required approvals.",
        ]
      : [
          "npm run sdd -- create --jira RX-12345",
          "npm run sdd -- auto-run --run <runId>",
          "npm run sdd -- status --run <runId>",
          "npm run sdd -- approve design --run <runId>",
          "npm run sdd -- manifest run --gate-only",
        ];
  }

  return type === "codex" ? defaultCodexLines : defaultCliLines;
};

const CodeWindow = ({
  title,
  lines,
  frame,
  fps,
  startSeconds,
}: {
  title: string;
  lines: string[];
  frame: number;
  fps: number;
  startSeconds: number;
}) => (
  <TerminalChrome title={title} style={{minHeight: 318}}>
    <div style={{fontFamily: theme.typography.mono, fontSize: 20, lineHeight: 1.5}}>
      {lines.map((line, index) => {
        const reveal = revealAt(frame - fps * startSeconds, fps, index, 0.34);
        return (
          <div
            key={line}
            style={{
              opacity: reveal,
              color: index === 0 ? "#FFFFFF" : "#C8D4E4",
              transform: `translateY(${interpolate(reveal, [0, 1], [8, 0], clamp)}px)`,
            }}
          >
            <span style={{color: theme.colors.teal}}>{title === "Codex" ? ">" : "$"}</span> {line}
          </div>
        );
      })}
    </div>
  </TerminalChrome>
);

export const TerminalSequence = ({scene, frame, fps}: VisualPrimitiveProps) => (
  <>
    <div
      style={{
        position: "absolute",
        left: 92,
        right: 92,
        top: 366,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 34,
      }}
    >
      <div
        style={{
          opacity: fadeIn(frame, 18, 20),
          transform: `translateY(${interpolate(frame, [18, 52], [24, 0], clamp)}px)`,
        }}
      >
        <CodeWindow title="Codex" lines={codeLinesFor(scene, "codex")} frame={frame} fps={fps} startSeconds={1} />
      </div>
      <div
        style={{
          opacity: fadeIn(frame, 48, 20),
          transform: `translateY(${interpolate(frame, [48, 82], [24, 0], clamp)}px)`,
        }}
      >
        <CodeWindow title="CLI" lines={codeLinesFor(scene, "cli")} frame={frame} fps={fps} startSeconds={2} />
      </div>
    </div>

    <div
      style={{
        position: "absolute",
        left: "50%",
        top: 742,
        transform: "translateX(-50%)",
        width: 980,
        minHeight: 144,
        borderRadius: theme.radius.lg,
        background: "rgba(255,255,255,0.92)",
        boxShadow: theme.shadow.soft,
        display: "grid",
        gridTemplateColumns: "210px 1fr",
        alignItems: "center",
        padding: "0 28px",
        opacity: fadeIn(frame, fps * 4.1, 18),
      }}
    >
      <div style={{display: "flex", alignItems: "center", gap: 14}}>
        <EngineeringIcon name="database" stroke={theme.colors.teal} size={54} />
        <div>
          <div style={{...theme.typography.label, color: theme.colors.ink}}>runtime</div>
          <div style={{...theme.typography.small, color: theme.colors.muted}}>event-sourced state</div>
        </div>
      </div>
      <div style={{display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10}}>
        {runtimeEvents.map((eventName, index) => {
          const reveal = revealAt(frame - fps * 4.5, fps, index, 0.22);
          return (
            <div
              key={eventName}
              style={{
                opacity: reveal,
                borderRadius: theme.radius.pill,
                background: "rgba(255,255,255,0.85)",
                color: primitiveColors[index % primitiveColors.length],
                border: `1px solid ${primitiveColors[index % primitiveColors.length]}`,
                padding: "10px 12px",
                textAlign: "center",
                ...theme.typography.small,
                fontWeight: 740,
              }}
            >
              {eventName}
            </div>
          );
        })}
      </div>
    </div>
  </>
);
