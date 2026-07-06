import {interpolate} from "remotion";
import {EngineeringIcon} from "../../../../assets/icons/EngineeringIcons";
import {theme} from "../../../../styles/theme";
import {clamp, fadeIn, sequenceOpacity} from "../../../../utils/animation";
import {CodeWindow, ShowcaseFrame, ShowcaseSceneProps, TimingPill, useSceneBeats} from "./shared";

const codexPrompt = [
  "Run SDD for RX-12345 in pharmacy-ui.",
  "Use the SDD coordinator.",
  "Start from requirements intake.",
  "Register durable artifacts.",
  "Stop for required approvals.",
  "Create TDD unit tests before product code.",
  "Run Playwright validation after implementation.",
];

const runEvents = [
  "run.created",
  "requirements.intake",
  "design.generated",
  "approval.required",
  "tdd.unit_tests.ready",
  "playwright.validated",
];

export const SddCodexRun = (props: ShowcaseSceneProps) => {
  const {frame, fadeAt, startFor, cue} = useSceneBeats(props);
  const approvalPulse = interpolate(frame % 64, [0, 32, 64], [0.28, 1, 0.28], clamp);
  const continueProgress = interpolate(frame, [322, 420], [0, 1], clamp);

  return (
    <ShowcaseFrame eyebrow="Codex Workflow" title="Codex Becomes the Guided Coordinator">
      <div style={{position: "absolute", left: 94, right: 94, top: 420, display: "grid", gridTemplateColumns: "1.14fr 0.86fr", gap: 34}}>
        <div style={{opacity: fadeAt(0, 1.0), transform: `translateY(${interpolate(frame, [28, 58], [28, 0], clamp)}px)`}}>
          <CodeWindow title="Codex" lines={codexPrompt} frame={frame} start={startFor(0, 2)} accent={theme.colors.teal} />
        </div>

        <div style={{minHeight: 430, borderRadius: theme.radius.lg, background: "rgba(255,255,255,0.92)", boxShadow: theme.shadow.soft, padding: 30, opacity: fadeAt(1, 5.0), transform: `translateY(${interpolate(frame, [120, 152], [28, 0], clamp)}px)`}}>
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
            <div>
              <div style={{...theme.typography.label, color: theme.colors.accent, textTransform: "uppercase"}}>SDD Run State</div>
              <div style={{...theme.typography.h2, fontSize: 42, marginTop: 10}}>.sdd-runtime</div>
            </div>
            <EngineeringIcon name="database" stroke={theme.colors.teal} size={72} />
          </div>
          <div style={{marginTop: 30, display: "grid", gap: 12}}>
            {runEvents.map((eventName, index) => (
              <div key={eventName} style={{height: 48, borderRadius: 12, background: index === 3 ? theme.colors.goldSoft : theme.colors.surfaceMuted, border: `1px solid ${index === 3 ? theme.colors.gold : theme.colors.line}`, display: "grid", gridTemplateColumns: "42px 1fr auto", alignItems: "center", padding: "0 16px", opacity: sequenceOpacity(frame - 154, index, 10)}}>
                <div style={{width: 20, height: 20, borderRadius: 99, background: index < 3 ? theme.colors.teal : index === 3 ? theme.colors.gold : theme.colors.lineStrong}} />
                <div style={{...theme.typography.small, color: theme.colors.ink, fontWeight: 720}}>{eventName}</div>
                <div style={{...theme.typography.small, color: index === 3 ? theme.colors.gold : theme.colors.muted}}>{index === 3 ? "Waiting" : index < 3 ? "Done" : "Next"}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{position: "absolute", left: 336, bottom: 98, width: 1248, height: 126, borderRadius: theme.radius.lg, background: theme.gradients.dark, color: theme.colors.white, boxShadow: "0 26px 90px rgba(21,27,43,0.24)", display: "grid", gridTemplateColumns: "250px 1fr 220px", alignItems: "center", padding: "0 34px", opacity: fadeAt(2, 10.8)}}>
        <div style={{display: "flex", alignItems: "center", gap: 16}}>
          <EngineeringIcon name="approval" stroke={theme.colors.gold} size={58} />
          <div>
            <div style={{...theme.typography.label, color: theme.colors.gold}}>Approval Required</div>
            <div style={{...theme.typography.small, color: "#B7C7DD"}}>{cue(2, "Stop for Human Review")}</div>
          </div>
        </div>
        <div style={{height: 8, borderRadius: 99, background: "rgba(255,255,255,0.16)", overflow: "hidden"}}>
          <div style={{height: "100%", width: `${Math.round(continueProgress * 100)}%`, background: theme.colors.teal, boxShadow: `0 0 30px rgba(0,168,142,${approvalPulse})`}} />
        </div>
        <TimingPill opacity={fadeIn(frame, 350, 18)} tone="teal">Resume After Approval</TimingPill>
      </div>
    </ShowcaseFrame>
  );
};
