import {interpolate, useCurrentFrame} from "remotion";
import {EngineeringIcon} from "../assets/icons/EngineeringIcons";
import {SceneDefinition} from "../data/timeline";
import {theme} from "../styles/theme";
import {clamp, fadeIn, sequenceOpacity} from "../utils/animation";
import {Pill, SceneFrame} from "./SceneFrame";

type Props = {
  scene: SceneDefinition;
  durationFrames: number;
};

const codexLines = [
  "Run SDD for RX-12345 in pharmacy-ui.",
  "Use the SDD coordinator.",
  "Register durable artifacts.",
  "Stop for required approvals.",
  "Create TDD unit tests before product code.",
  "Report blockers honestly.",
];

const cliLines = [
  "npm run sdd -- create --jira RX-12345",
  "npm run sdd -- auto-run --run <runId>",
  "npm run sdd -- status --run <runId>",
  "npm run sdd -- approve design --run <runId>",
  "npm run sdd -- manifest run --gate-only",
];

const runtimeEvents = [
  "run.created",
  "artifact.registered",
  "approval.required",
  "jest.baseline.recorded",
  "child.result.fanned-in",
  "gate.completed",
];

const CodeWindow = ({
  title,
  lines,
  frame,
  start,
}: {
  title: string;
  lines: string[];
  frame: number;
  start: number;
}) => (
  <div
    style={{
      background: theme.gradients.dark,
      borderRadius: theme.radius.lg,
      padding: 26,
      boxShadow: "0 26px 80px rgba(18, 24, 38, 0.22)",
      color: theme.colors.white,
      minHeight: 340,
    }}
  >
    <div style={{display: "flex", alignItems: "center", gap: 10, marginBottom: 24}}>
      <span style={{width: 12, height: 12, borderRadius: 99, background: theme.colors.red}} />
      <span style={{width: 12, height: 12, borderRadius: 99, background: theme.colors.gold}} />
      <span style={{width: 12, height: 12, borderRadius: 99, background: theme.colors.teal}} />
      <span style={{...theme.typography.small, marginLeft: 16, color: "#B7C7DD"}}>{title}</span>
    </div>
    <div style={{fontFamily: theme.typography.mono, fontSize: 20, lineHeight: 1.5}}>
      {lines.map((line, index) => {
        const opacity = sequenceOpacity(frame - start, index, 12);
        return (
          <div key={line} style={{opacity, color: index === 0 ? "#FFFFFF" : "#C8D4E4"}}>
            <span style={{color: theme.colors.teal}}>{title === "Codex" ? ">" : "$"}</span> {line}
          </div>
        );
      })}
    </div>
  </div>
);

export const DemoScene = ({scene, durationFrames}: Props) => {
  const frame = useCurrentFrame();
  const runtimeOpacity = fadeIn(frame, 82, 18);

  return (
    <SceneFrame
      scene={scene}
      durationFrames={durationFrames}
      eyebrow="Two interfaces"
      title="Codex and CLI share one runtime."
      subtitle="The entry point changes. The SDD run remains the source of truth."
    >
      <div
        style={{
          position: "absolute",
          left: 92,
          right: 92,
          top: 384,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 34,
        }}
      >
        <div style={{opacity: fadeIn(frame, 24, 20), transform: `translateY(${interpolate(frame, [24, 52], [24, 0], clamp)}px)`}}>
          <CodeWindow title="Codex" lines={codexLines} frame={frame} start={34} />
        </div>
        <div style={{opacity: fadeIn(frame, 54, 20), transform: `translateY(${interpolate(frame, [54, 82], [24, 0], clamp)}px)`}}>
          <CodeWindow title="CLI" lines={cliLines} frame={frame} start={64} />
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 754,
          transform: "translateX(-50%)",
          width: 960,
          height: 142,
          borderRadius: theme.radius.lg,
          background: "rgba(255,255,255,0.92)",
          boxShadow: theme.shadow.soft,
          display: "grid",
          gridTemplateColumns: "190px 1fr",
          alignItems: "center",
          padding: "0 28px",
          opacity: runtimeOpacity,
        }}
      >
        <div style={{display: "flex", alignItems: "center", gap: 14}}>
          <EngineeringIcon name="database" stroke={theme.colors.teal} size={54} />
          <div>
            <div style={{...theme.typography.label, color: theme.colors.ink}}>.sdd-runtime</div>
            <div style={{...theme.typography.small, color: theme.colors.muted}}>event-sourced state</div>
          </div>
        </div>
        <div style={{display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10}}>
          {runtimeEvents.map((eventName, index) => (
            <Pill
              key={eventName}
              tone={index % 3 === 0 ? "blue" : index % 3 === 1 ? "teal" : "violet"}
              style={{justifyContent: "center", opacity: sequenceOpacity(frame - 96, index, 8)}}
            >
              {eventName}
            </Pill>
          ))}
        </div>
      </div>
    </SceneFrame>
  );
};
