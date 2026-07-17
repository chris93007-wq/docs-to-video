import {Img, interpolate, OffthreadVideo, staticFile, useCurrentFrame} from "remotion";
import {EngineeringIcon} from "../../../../assets/icons/EngineeringIcons";
import {clamp, fadeIn} from "../../../../utils/animation";
import content from "../../../../../content/sdd-orchestrator-launch-content.json";
import {OracleIcon, colorForTone, oracleAssets, useOracleBrand, useShowcaseTheme} from "./brand";
import {ShowcaseFrame, type ShowcaseSceneProps} from "./shared";

const liveContent = content.liveDemo;

const proofOpacity = (seconds: number, start: number, end: number) => interpolate(
  seconds,
  [start, start + 0.22, Math.max(start + 0.24, end - 0.22), end],
  [0, 1, 1, 0],
  clamp,
);

const LiveBadge = ({featureKey}: {featureKey: string}) => {
  const theme = useShowcaseTheme();
  const isOracle = useOracleBrand();
  return (
    <div style={{display: "inline-flex", alignItems: "center", gap: 10, padding: "9px 14px", borderRadius: theme.radius.pill, background: isOracle ? "rgba(60,69,69,0.94)" : "rgba(18,24,38,0.88)", color: theme.colors.white, ...theme.typography.small, fontWeight: 760, letterSpacing: 0.4}}>
      <span style={{width: 10, height: 10, borderRadius: 99, background: theme.colors.red, boxShadow: `0 0 0 5px ${theme.colors.redSoft}`}} />
      {liveContent.badge} · {featureKey}
    </div>
  );
};

export const SddLiveCodexRun = (props: ShowcaseSceneProps) => {
  const theme = useShowcaseTheme();
  const isOracle = useOracleBrand();
  const frame = useCurrentFrame();
  const asset = props.liveDemo?.assets.find((item) => item.id === props.liveDemo?.developerExperience.assetId);
  const revealFrame = Math.round((props.liveDemo?.developerExperience.revealSeconds ?? 1.2) * props.fps);
  const proofIn = fadeIn(frame, revealFrame, 14);
  const durationFrames = Math.round(props.scene.durationSeconds * props.fps);
  const cameraScale = interpolate(frame, [0, durationFrames], [1.01, 1.055], clamp);
  const promptOpacity = interpolate(
    frame,
    [revealFrame + 2, revealFrame + 12, revealFrame + 135, revealFrame + 155],
    [0, 1, 1, 0],
    clamp,
  );

  if (!asset || !props.liveDemo) {
    return null;
  }

  return (
    <ShowcaseFrame
      eyebrow={liveContent.codex.eyebrow}
      title={props.scene.title}
      subtitle={liveContent.codex.subtitle}
    >
      <div style={{position: "absolute", left: 88, right: 88, top: 344, height: 674, borderRadius: 34, overflow: "hidden", background: theme.gradients.dark, boxShadow: isOracle ? "0 36px 120px rgba(49,45,42,0.24)" : "0 36px 120px rgba(18,24,38,0.28)", opacity: proofIn}}>
        <div style={{position: "absolute", left: 28, top: 28, bottom: 28, width: 1218, overflow: "hidden", borderRadius: 24, background: theme.colors.code}}>
          <OffthreadVideo
            src={staticFile(asset.staticFile)}
            muted
            style={{position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 50%", transform: `scale(${cameraScale})`}}
          />
          <div style={{position: "absolute", left: 0, right: 0, top: 0, height: 62, background: isOracle ? "linear-gradient(180deg, rgba(60,69,69,0.98), rgba(60,69,69,0.76))" : "linear-gradient(180deg, rgba(17,24,39,0.96), rgba(17,24,39,0.72))", display: "flex", alignItems: "center", padding: "0 20px"}}>
            <LiveBadge featureKey={props.liveDemo.featureKey} />
          </div>
          <div style={{position: "absolute", left: 286, top: 270, width: 660, minHeight: 96, padding: "18px 22px", borderRadius: 18, background: "rgba(255,255,255,0.98)", border: `1px solid ${theme.colors.line}`, boxShadow: isOracle ? "0 18px 56px rgba(49,45,42,0.18)" : "0 18px 56px rgba(18,24,38,0.2)", opacity: promptOpacity, ...theme.typography.body, fontSize: 22, lineHeight: 1.32, color: theme.colors.ink}}>
            {liveContent.codex.prompt}
          </div>
          <div style={{position: "absolute", left: 0, right: 0, bottom: 0, height: 110, background: isOracle ? "linear-gradient(0deg, rgba(60,69,69,0.9), transparent)" : "linear-gradient(0deg, rgba(17,24,39,0.88), transparent)"}} />
        </div>

        <div style={{position: "absolute", right: 28, top: 28, bottom: 28, width: 398, borderRadius: 24, padding: 30, background: "rgba(255,255,255,0.96)", border: `1px solid ${theme.colors.line}`, display: "flex", flexDirection: "column"}}>
          <div style={{...theme.typography.label, color: theme.colors.accent, textTransform: "uppercase"}}>{liveContent.sourceLabel}</div>
          <div style={{...theme.typography.h2, fontSize: 38, lineHeight: 1.06, marginTop: 14}}>{liveContent.codex.title}</div>
          <div style={{marginTop: 28, display: "grid", gap: 14}}>
            {liveContent.codex.details.map((detail, index) => (
              <div key={detail} style={{display: "grid", gridTemplateColumns: "38px 1fr", alignItems: "center", minHeight: 58, padding: "0 14px", borderRadius: 14, background: theme.colors.surfaceMuted, border: `1px solid ${theme.colors.line}`, opacity: fadeIn(frame, revealFrame + 18 + index * 10, 12)}}>
                {isOracle ? (
                  <OracleIcon src={[oracleAssets.icons.codex, oracleAssets.icons.traceability, oracleAssets.icons.automation][index]} size={28} />
                ) : (
                  <EngineeringIcon name={index === 0 ? "confluence" : index === 1 ? "database" : "approval"} stroke={index === 2 ? theme.colors.gold : theme.colors.teal} size={28} />
                )}
                <span style={{...theme.typography.small, color: theme.colors.ink, fontWeight: 720}}>{detail}</span>
              </div>
            ))}
          </div>
          <div style={{marginTop: "auto", padding: "18px 20px", borderRadius: 16, background: theme.colors.tealSoft, border: `1px solid ${theme.colors.teal}`, display: "flex", alignItems: "center", gap: 14}}>
            {isOracle ? <OracleIcon src={oracleAssets.icons.automation} size={34} /> : <EngineeringIcon name="check" stroke={theme.colors.teal} size={34} />}
            <span style={{...theme.typography.label, color: theme.colors.ink}}>{liveContent.codex.status}</span>
          </div>
        </div>
      </div>
    </ShowcaseFrame>
  );
};

export const SddLiveWorkflow = (props: ShowcaseSceneProps) => {
  const theme = useShowcaseTheme();
  const isOracle = useOracleBrand();
  const frame = useCurrentFrame();
  const seconds = frame / props.fps;
  const sceneContent = content.scenes.workflow;
  const liveDemo = props.liveDemo;

  if (!liveDemo) {
    return null;
  }

  const proofContent = new Map(liveContent.workflow.proofs.map((proof) => [proof.id, proof]));
  const proofItems = liveDemo.workflowProofs.map((proof) => ({
    ...proof,
    asset: liveDemo.assets.find((asset) => asset.id === proof.assetId),
    content: proofContent.get(proof.assetId),
  })).filter((proof) => proof.asset && proof.content);
  const activeProof = [...proofItems].reverse().find((proof) => seconds >= proof.startSeconds) ?? proofItems[0];
  const stageIndices = [1, 2, 3, 5, 6, 7];
  const stageStarts = [0, 1.682, 2.664, 4.439, 6.526, 7.963];
  const stageTones = ["violet", "teal", "accent", "red", "teal", "violet"];
  const activeStage = stageStarts.reduce((current, start, index) => seconds >= start ? index : current, 0);

  return (
    <ShowcaseFrame
      eyebrow={liveContent.workflow.eyebrow}
      title={props.scene.title}
      subtitle={sceneContent.subtitle}
    >
      <div style={{position: "absolute", left: 88, right: 88, top: 326, height: 700, borderRadius: 34, overflow: "hidden", background: theme.gradients.dark, boxShadow: isOracle ? "0 36px 120px rgba(49,45,42,0.24)" : "0 36px 120px rgba(18,24,38,0.28)"}}>
        <div style={{position: "absolute", left: 28, right: 28, top: 24, height: 92, display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12}}>
          {stageIndices.map((stepIndex, index) => {
            const step = sceneContent.steps[stepIndex];
            const isActive = index <= activeStage;
            const color = colorForTone(theme, stageTones[index]);
            return (
              <div key={step.label} style={{borderRadius: 16, border: `1px solid ${isActive ? color : "rgba(255,255,255,0.18)"}`, background: isActive ? `${color}30` : "rgba(255,255,255,0.08)", color: theme.colors.white, display: "flex", alignItems: "center", gap: 12, padding: "0 16px", opacity: fadeIn(frame, index * 7, 12)}}>
                <span style={{width: 12, height: 12, borderRadius: 99, flex: "0 0 auto", background: isActive ? color : "rgba(255,255,255,0.24)"}} />
                <div>
                  <div style={{...theme.typography.label, fontSize: 15, lineHeight: 1.05}}>{step.label}</div>
                  <div style={{...theme.typography.small, fontSize: 11, color: "rgba(255,255,255,0.66)", marginTop: 4}}>{step.detail}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{position: "absolute", left: 28, top: 134, width: 1168, height: 536, overflow: "hidden", borderRadius: 24, background: theme.colors.code}}>
          {proofItems.map((proof) => (
            <Img
              key={proof.assetId}
              src={staticFile(proof.asset!.staticFile)}
              style={{position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: proof.objectPosition, transform: "scale(1.035)", opacity: proofOpacity(seconds, proof.startSeconds, proof.endSeconds)}}
            />
          ))}
          <div style={{position: "absolute", left: 0, right: 0, top: 0, height: 58, background: isOracle ? "linear-gradient(180deg, rgba(60,69,69,0.99), rgba(60,69,69,0.74))" : "linear-gradient(180deg, rgba(17,24,39,0.98), rgba(17,24,39,0.7))", display: "flex", alignItems: "center", padding: "0 18px"}}>
            <LiveBadge featureKey={liveDemo.featureKey} />
          </div>
          <div style={{position: "absolute", left: 0, right: 0, bottom: 0, height: activeProof?.assetId === "requirements" ? 190 : 86, background: isOracle ? "linear-gradient(0deg, rgba(60,69,69,0.92), transparent)" : "linear-gradient(0deg, rgba(17,24,39,0.9), transparent)"}} />
        </div>

        <div style={{position: "absolute", right: 28, top: 134, width: 452, height: 536, borderRadius: 24, padding: 30, background: "rgba(255,255,255,0.96)", border: `1px solid ${theme.colors.line}`, display: "flex", flexDirection: "column"}}>
          <div style={{...theme.typography.label, color: theme.colors.accent, textTransform: "uppercase"}}>{liveContent.sourceLabel}</div>
          <div style={{...theme.typography.h2, fontSize: 34, lineHeight: 1.08, marginTop: 12}}>{liveContent.workflow.title}</div>
          <div style={{height: 1, background: theme.colors.line, margin: "24px 0"}} />
          {activeProof?.content ? (
            <div>
              <div style={{display: "flex", alignItems: "center", gap: 14}}>
                <span style={{width: 16, height: 16, borderRadius: 99, background: colorForTone(theme, activeProof.content.tone)}} />
                <div style={{...theme.typography.h2, fontSize: 30}}>{activeProof.content.label}</div>
              </div>
              <div style={{...theme.typography.body, fontSize: 22, lineHeight: 1.32, color: theme.colors.muted, marginTop: 16}}>{activeProof.content.detail}</div>
            </div>
          ) : null}
          <div style={{marginTop: "auto", display: "flex", flexWrap: "wrap", gap: 10}}>
            {sceneContent.evidenceItems.slice(0, 4).map((item) => (
              <div key={item} style={{padding: "10px 13px", borderRadius: theme.radius.pill, background: theme.colors.surfaceMuted, border: `1px solid ${theme.colors.line}`, ...theme.typography.small, color: theme.colors.ink, fontWeight: 700}}>{item}</div>
            ))}
          </div>
        </div>
      </div>
    </ShowcaseFrame>
  );
};
