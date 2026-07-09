import {interpolate} from "remotion";
import {EngineeringIcon, EngineeringIconName} from "../../../../assets/icons/EngineeringIcons";
import {clamp, sequenceOpacity} from "../../../../utils/animation";
import content from "../../../../../content/sdd-orchestrator-launch-content.json";
import {colorForTone, useOracleBrand, useShowcaseTheme} from "./brand";
import {SddLiveWorkflow} from "./SddLiveDemoProof";
import {ShowcaseFrame, ShowcaseSceneProps, useSceneBeats} from "./shared";

type RailStep = {
  label: string;
  detail: string;
  icon: EngineeringIconName;
  color: string;
};

const SddWorkflowIllustrated = (props: ShowcaseSceneProps) => {
  const theme = useShowcaseTheme();
  const isOracle = useOracleBrand();
  const sceneContent = content.scenes.workflow;
  const legacyTones = ["accent", "violet", "teal", "accent", "gold", "red", "teal", "accent", "teal", "violet"];
  const steps: RailStep[] = sceneContent.steps.map((step, index) => ({
    ...step,
    icon: step.icon as EngineeringIconName,
    color: colorForTone(theme, isOracle ? step.tone : legacyTones[index]),
  }));
  const {frame, fadeAt, startFor} = useSceneBeats(props);
  const railStart = startFor(0, 0.8);
  const localFrame = Math.max(0, frame - railStart);
  const railDraw = interpolate(localFrame, [12, 154], [0, 1], clamp);
  const activeProgress = interpolate(localFrame, [20, 214], [0, steps.length - 1], clamp);
  const gateFocus = fadeAt(2, 9.4, 20);
  const evidenceOpacity = fadeAt(4, 17.2, 22);

  return (
    <ShowcaseFrame
      eyebrow={sceneContent.eyebrow}
      title={props.scene.title}
      subtitle={sceneContent.subtitle}
    >
      <div style={{position: "absolute", left: 98, right: 98, top: 336, height: 592, borderRadius: 34, background: theme.gradients.dark, boxShadow: "0 38px 130px rgba(21,27,43,0.24)", overflow: "hidden", opacity: fadeAt(0, 0.8)}}>
        <div style={{position: "absolute", inset: 0, background: isOracle ? "radial-gradient(circle at 18% 18%, rgba(222,176,104,0.2), transparent 34%), radial-gradient(circle at 72% 72%, rgba(92,146,109,0.18), transparent 38%)" : "radial-gradient(circle at 18% 18%, rgba(47,128,237,0.28), transparent 34%), radial-gradient(circle at 72% 72%, rgba(0,168,142,0.2), transparent 38%)"}} />
        <div style={{position: "absolute", left: 46, top: 38}}>
          <div style={{...theme.typography.label, color: isOracle ? theme.colors.violet : "#8FD8FF", textTransform: "uppercase"}}>{sceneContent.panelEyebrow}</div>
          <div style={{...theme.typography.h2, fontSize: 40, color: theme.colors.white, marginTop: 10}}>{sceneContent.panelTitle}</div>
        </div>

        <div style={{position: "absolute", right: 42, top: 44, display: "flex", gap: 10}}>
          {sceneContent.legend.map((label, index) => ({
            label,
            color: [theme.colors.teal, theme.colors.gold, theme.colors.accent][index],
          })).map((item) => (
            <div key={item.label} style={{padding: "10px 14px", borderRadius: theme.radius.pill, background: "rgba(255,255,255,0.12)", border: `1px solid ${item.color}`, color: theme.colors.white, ...theme.typography.small, fontWeight: 760}}>
              <span style={{display: "inline-block", width: 9, height: 9, borderRadius: 99, background: item.color, marginRight: 8}} />{item.label}
            </div>
          ))}
        </div>

        <svg width="1724" height="592" viewBox="0 0 1724 592" style={{position: "absolute", inset: 0}}>
          <path
            d="M118 300 C286 222 412 382 580 300 S870 218 1038 300 1314 382 1606 300"
            fill="none"
            stroke="rgba(255,255,255,0.28)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M118 300 C286 222 412 382 580 300 S870 218 1038 300 1314 382 1606 300"
            fill="none"
            stroke={theme.colors.teal}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="1900"
            strokeDashoffset={1900 * (1 - railDraw)}
            opacity="0.96"
          />
        </svg>

        <div style={{position: "absolute", left: 82, right: 82, top: 196, height: 264}}>
          {steps.map((step, index) => {
            const x = index * 166;
            const y = index % 2 === 0 ? 96 : 26;
            const appear = sequenceOpacity(localFrame - 14, index, 8);
            const isActive = activeProgress >= index;
            const isApproval = index === 4;
            const isJest = index === 5;
            const isLargeNode = isApproval || isJest;
            const focusScale = isApproval ? interpolate(gateFocus, [0, 1], [1, 1.2], clamp) : 1;

            return (
              <div
                key={step.label}
                style={{
                  position: "absolute",
                  left: x,
                  top: y,
                  width: isLargeNode ? 132 : 118,
                  height: isLargeNode ? 132 : 118,
                  borderRadius: 999,
                  background: isActive ? step.color : "rgba(255,255,255,0.92)",
                  border: `4px solid ${step.color}`,
                  boxShadow: isApproval ? "0 22px 70px rgba(229,164,23,0.34)" : "0 16px 46px rgba(0,0,0,0.18)",
                  display: "grid",
                  placeItems: "center",
                  opacity: appear,
                  transform: `scale(${interpolate(appear, [0, 1], [0.86, focusScale], clamp)})`,
                  transformOrigin: "center",
                }}
              >
                <div style={{textAlign: "center", color: isActive ? theme.colors.white : theme.colors.ink}}>
                  <EngineeringIcon name={step.icon} stroke={isActive ? theme.colors.white : step.color} size={isApproval ? 48 : isJest ? 38 : 42} />
                  <div style={{...theme.typography.label, fontSize: isJest ? 14 : 16, lineHeight: 1.02, maxWidth: isJest ? 96 : "none", color: isActive ? theme.colors.white : theme.colors.ink, marginTop: 7}}>{step.label}</div>
                  <div style={{...theme.typography.small, color: isActive ? "rgba(255,255,255,0.78)" : theme.colors.muted, marginTop: 3, fontSize: 12}}>{step.detail}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{position: "absolute", left: 742, top: 54, width: 296, padding: "18px 22px", borderRadius: 22, background: "rgba(229,164,23,0.2)", border: "1px solid rgba(229,164,23,0.5)", color: theme.colors.white, opacity: gateFocus}}>
          <div style={{...theme.typography.label, color: theme.colors.gold}}>{sceneContent.approvalGate.title}</div>
          <div style={{...theme.typography.small, color: isOracle ? "#D9DDDA" : "#DCE7F7", marginTop: 8}}>{sceneContent.approvalGate.detail}</div>
        </div>

        <div style={{position: "absolute", left: 50, right: 50, bottom: 38, height: 78, borderRadius: theme.radius.pill, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", gap: 16, opacity: evidenceOpacity}}>
          <div style={{...theme.typography.label, color: isOracle ? theme.colors.violet : "#8FD8FF", marginRight: 10}}>{sceneContent.evidenceHeading}</div>
          {sceneContent.evidenceItems.map((item, index) => (
            <div key={item} style={{padding: "12px 18px", borderRadius: theme.radius.pill, background: "rgba(255,255,255,0.9)", color: theme.colors.ink, ...theme.typography.small, fontWeight: 780, opacity: sequenceOpacity(frame - startFor(4, 17.2), index, 5)}}>
              {item}
            </div>
          ))}
        </div>
      </div>
    </ShowcaseFrame>
  );
};

export const SddWorkflowRail = (props: ShowcaseSceneProps) => (
  props.presentationMode === "live-demo-hybrid" && props.liveDemo
    ? <SddLiveWorkflow {...props} />
    : <SddWorkflowIllustrated {...props} />
);
