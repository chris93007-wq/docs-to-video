import {interpolate} from "remotion";
import {EngineeringIcon, EngineeringIconName} from "../../../../assets/icons/EngineeringIcons";
import {theme} from "../../../../styles/theme";
import {clamp, sequenceOpacity} from "../../../../utils/animation";
import {ShowcaseFrame, ShowcaseSceneProps, useSceneBeats} from "./shared";

type RailStep = {
  label: string;
  detail: string;
  icon: EngineeringIconName;
  color: string;
};

const steps: RailStep[] = [
  {label: "Intent", detail: "Jira + Confluence", icon: "jira", color: theme.colors.accent},
  {label: "Requirements", detail: "Source Truth", icon: "confluence", color: theme.colors.violet},
  {label: "Design", detail: "Reviewed Plan", icon: "document", color: theme.colors.teal},
  {label: "Approval", detail: "Human Gate", icon: "approval", color: theme.colors.gold},
  {label: "TDD Unit Tests", detail: "Before Build", icon: "gate", color: theme.colors.red},
  {label: "Build", detail: "Bounded Slices", icon: "code", color: theme.colors.teal},
  {label: "Validate", detail: "Playwright Proof", icon: "browser", color: theme.colors.accent},
  {label: "Lifecycle", detail: "Evidence Summary", icon: "check", color: theme.colors.teal},
];

const evidence = ["Requirements", "Tests", "Validation", "Lifecycle"];

export const SddWorkflowRail = (props: ShowcaseSceneProps) => {
  const {frame, fadeAt, startFor} = useSceneBeats(props);
  const railStart = startFor(0, 0.8);
  const localFrame = Math.max(0, frame - railStart);
  const railDraw = interpolate(localFrame, [12, 154], [0, 1], clamp);
  const activeProgress = interpolate(localFrame, [20, 214], [0, steps.length - 1], clamp);
  const gateFocus = fadeAt(2, 9.4, 20);
  const evidenceOpacity = fadeAt(4, 17.2, 22);

  return (
    <ShowcaseFrame
      eyebrow="Guided Workflow"
      title="Intent to Evidence"
      subtitle="Requirements, approvals, tests, implementation, validation, and lifecycle updates stay connected."
    >
      <div style={{position: "absolute", left: 98, right: 98, top: 336, height: 592, borderRadius: 34, background: theme.gradients.dark, boxShadow: "0 38px 130px rgba(21,27,43,0.24)", overflow: "hidden", opacity: fadeAt(0, 0.8)}}>
        <div style={{position: "absolute", inset: 0, background: "radial-gradient(circle at 18% 18%, rgba(47,128,237,0.28), transparent 34%), radial-gradient(circle at 72% 72%, rgba(0,168,142,0.2), transparent 38%)"}} />
        <div style={{position: "absolute", left: 46, top: 38}}>
          <div style={{...theme.typography.label, color: "#8FD8FF", textTransform: "uppercase"}}>Stateful Run</div>
          <div style={{...theme.typography.h2, fontSize: 40, color: theme.colors.white, marginTop: 10}}>Coordinator-Owned Sequence</div>
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
            const x = index * 210;
            const y = index % 2 === 0 ? 98 : 24;
            const appear = sequenceOpacity(localFrame - 14, index, 8);
            const isActive = activeProgress >= index;
            const isApproval = step.label === "Approval";
            const focusScale = isApproval ? interpolate(gateFocus, [0, 1], [1, 1.2], clamp) : 1;

            return (
              <div
                key={step.label}
                style={{
                  position: "absolute",
                  left: x,
                  top: y,
                  width: isApproval ? 156 : 136,
                  height: isApproval ? 156 : 136,
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
                  <EngineeringIcon name={step.icon} stroke={isActive ? theme.colors.white : step.color} size={isApproval ? 58 : 50} />
                  <div style={{...theme.typography.label, color: isActive ? theme.colors.white : theme.colors.ink, marginTop: 9}}>{step.label}</div>
                  <div style={{...theme.typography.small, color: isActive ? "rgba(255,255,255,0.78)" : theme.colors.muted, marginTop: 4, fontSize: 15}}>{step.detail}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{position: "absolute", left: 742, top: 54, width: 296, padding: "18px 22px", borderRadius: 22, background: "rgba(229,164,23,0.2)", border: "1px solid rgba(229,164,23,0.5)", color: theme.colors.white, opacity: gateFocus}}>
          <div style={{...theme.typography.label, color: theme.colors.gold}}>Approval Gate</div>
          <div style={{...theme.typography.small, color: "#DCE7F7", marginTop: 8}}>Human Decision Required Before Fan-Out</div>
        </div>

        <div style={{position: "absolute", left: 50, right: 50, bottom: 38, height: 78, borderRadius: theme.radius.pill, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", gap: 16, opacity: evidenceOpacity}}>
          <div style={{...theme.typography.label, color: "#8FD8FF", marginRight: 10}}>Evidence Attached</div>
          {evidence.map((item, index) => (
            <div key={item} style={{padding: "12px 18px", borderRadius: theme.radius.pill, background: "rgba(255,255,255,0.9)", color: theme.colors.ink, ...theme.typography.small, fontWeight: 780, opacity: sequenceOpacity(frame - startFor(4, 17.2), index, 5)}}>
              {item}
            </div>
          ))}
        </div>
      </div>
    </ShowcaseFrame>
  );
};
