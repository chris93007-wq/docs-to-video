import {interpolate} from "remotion";
import {EngineeringIcon} from "../../../../assets/icons/EngineeringIcons";
import {clamp, fadeIn, sequenceOpacity} from "../../../../utils/animation";
import content from "../../../../../content/sdd-orchestrator-launch-content.json";
import {OracleIcon, oracleAssets, useOracleBrand, useShowcaseTheme} from "./brand";
import {SddLiveCodexRun} from "./SddLiveDemoProof";
import {CodeWindow, ShowcaseFrame, ShowcaseSceneProps, TimingPill, useSceneBeats} from "./shared";

const SddCodexIllustrated = (props: ShowcaseSceneProps) => {
  const theme = useShowcaseTheme();
  const isOracle = useOracleBrand();
  const sceneContent = content.scenes["developer-experience"];
  const {frame, fadeAt, startFor, cue} = useSceneBeats(props);
  const approvalPulse = interpolate(frame % 64, [0, 32, 64], [0.28, 1, 0.28], clamp);
  const durationFrames = props.scene.durationSeconds * props.fps;
  const continueProgress = interpolate(frame, [durationFrames * 0.62, durationFrames * 0.88], [0, 1], clamp);
  const runStateStart = durationFrames * 0.3;
  const runStateStep = Math.max(6, durationFrames * 0.035);

  return (
    <ShowcaseFrame eyebrow={sceneContent.eyebrow} title={props.scene.title} subtitle={sceneContent.subtitle}>
      <div style={{position: "absolute", left: 94, right: 94, top: 420, display: "grid", gridTemplateColumns: "1.14fr 0.86fr", gap: 34}}>
        <div style={{opacity: fadeAt(0, 1.0), transform: `translateY(${interpolate(frame, [28, 58], [28, 0], clamp)}px)`}}>
          <CodeWindow title={sceneContent.promptTitle} lines={sceneContent.promptLines} frame={frame} start={startFor(0, 2)} accent={isOracle ? theme.colors.accent : theme.colors.teal} />
        </div>

        <div style={{minHeight: 430, borderRadius: theme.radius.lg, background: "rgba(255,255,255,0.92)", boxShadow: theme.shadow.soft, padding: 30, opacity: fadeAt(1, 5.0), transform: `translateY(${interpolate(frame, [durationFrames * 0.24, durationFrames * 0.34], [28, 0], clamp)}px)`}}>
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
            <div>
              <div style={{...theme.typography.label, color: theme.colors.accent, textTransform: "uppercase"}}>{sceneContent.stateEyebrow}</div>
              <div style={{...theme.typography.h2, fontSize: 42, marginTop: 10}}>{sceneContent.stateTitle}</div>
            </div>
            {isOracle ? <OracleIcon src={oracleAssets.icons.traceability} size={72} /> : <EngineeringIcon name="database" stroke={theme.colors.teal} size={72} />}
          </div>
          <div style={{marginTop: 30, display: "grid", gap: 12}}>
            {sceneContent.runEvents.map((event, index) => (
              <div key={event.name} style={{height: 48, borderRadius: 12, background: index === 3 ? theme.colors.goldSoft : theme.colors.surfaceMuted, border: `1px solid ${index === 3 ? theme.colors.gold : theme.colors.line}`, display: "grid", gridTemplateColumns: "42px 1fr auto", alignItems: "center", padding: "0 16px", opacity: sequenceOpacity(frame - runStateStart, index, runStateStep)}}>
                <div style={{width: 20, height: 20, borderRadius: 99, background: index < 3 ? theme.colors.teal : index === 3 ? theme.colors.gold : theme.colors.lineStrong}} />
                <div style={{...theme.typography.small, color: theme.colors.ink, fontWeight: 720}}>{event.name}</div>
                <div style={{...theme.typography.small, color: index === 3 ? theme.colors.gold : theme.colors.muted}}>{event.status}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{position: "absolute", left: 336, bottom: 98, width: 1248, height: 126, borderRadius: theme.radius.lg, background: theme.gradients.dark, color: theme.colors.white, boxShadow: "0 26px 90px rgba(21,27,43,0.24)", display: "grid", gridTemplateColumns: "250px 1fr 220px", alignItems: "center", padding: "0 34px", opacity: fadeAt(2, 10.8)}}>
        <div style={{display: "flex", alignItems: "center", gap: 16}}>
          <EngineeringIcon name="approval" stroke={theme.colors.gold} size={58} />
          <div>
            <div style={{...theme.typography.label, color: theme.colors.gold}}>{sceneContent.approvalHeading}</div>
            <div style={{...theme.typography.small, color: isOracle ? "#D9DDDA" : "#B7C7DD"}}>{cue(1, sceneContent.approvalFallback)}</div>
          </div>
        </div>
        <div style={{height: 8, borderRadius: 99, background: "rgba(255,255,255,0.16)", overflow: "hidden"}}>
          <div style={{height: "100%", width: `${Math.round(continueProgress * 100)}%`, background: theme.colors.teal, boxShadow: isOracle ? `0 0 30px rgba(92,146,109,${approvalPulse})` : `0 0 30px rgba(0,168,142,${approvalPulse})`}} />
        </div>
        <TimingPill opacity={fadeIn(frame, durationFrames * 0.7, 18)} tone="teal">{sceneContent.resumeLabel}</TimingPill>
      </div>
    </ShowcaseFrame>
  );
};

export const SddCodexRun = (props: ShowcaseSceneProps) => (
  props.presentationMode === "live-demo-hybrid" && props.liveDemo
    ? <SddLiveCodexRun {...props} />
    : <SddCodexIllustrated {...props} />
);
