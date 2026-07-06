import {interpolate} from "remotion";
import {EngineeringIcon} from "../../../../assets/icons/EngineeringIcons";
import {theme} from "../../../../styles/theme";
import {clamp, sequenceOpacity} from "../../../../utils/animation";
import {ShowcaseFrame, ShowcaseSceneProps, useSceneBeats} from "./shared";

const manualItems = [
  {label: "Prompt Memory", detail: "Which step next?", icon: "terminal" as const, tone: theme.colors.violet, x: 58, y: 88},
  {label: "Approval Boundary", detail: "Easy to miss", icon: "approval" as const, tone: theme.colors.gold, x: 312, y: 260},
  {label: "Evidence File", detail: "Where did it land?", icon: "document" as const, tone: theme.colors.accent, x: 56, y: 330},
  {label: "Validation Gate", detail: "Did it run?", icon: "gate" as const, tone: theme.colors.red, x: 386, y: 54},
];

const workflowItems = [
  {label: "Intent", detail: "Jira + Confluence", icon: "jira" as const, tone: theme.colors.accent},
  {label: "Design", detail: "Reviewed plan", icon: "document" as const, tone: theme.colors.violet},
  {label: "Approval Gate", detail: "Human review", icon: "approval" as const, tone: theme.colors.gold},
  {label: "TDD Unit Tests", detail: "Before build", icon: "gate" as const, tone: theme.colors.red},
  {label: "Validate", detail: "Playwright proof", icon: "browser" as const, tone: theme.colors.teal},
];

export const SddApprovalGate = (props: ShowcaseSceneProps) => {
  const {frame, fadeAt} = useSceneBeats(props);
  const tangleDraw = interpolate(frame, [32, 142], [0, 1], clamp);
  const railDraw = interpolate(frame, [168, 292], [0, 1], clamp);

  return (
    <ShowcaseFrame eyebrow="Before and After" title="From Manual Handoffs to One Coordinated Run">
      <div style={{position: "absolute", left: 96, top: 382, width: 720, opacity: fadeAt(0, 0.8)}}>
        <div style={{display: "flex", alignItems: "center", gap: 16, marginBottom: 18}}>
          <div style={{...theme.typography.label, color: theme.colors.red, textTransform: "uppercase"}}>Before Orchestrator</div>
          <div style={{height: 2, flex: 1, background: theme.colors.redSoft}} />
        </div>
        <div style={{position: "relative", height: 514, borderRadius: theme.radius.lg, background: "rgba(255,255,255,0.86)", border: `2px solid ${theme.colors.line}`, boxShadow: theme.shadow.soft, overflow: "hidden"}}>
          <svg width="720" height="514" viewBox="0 0 720 514" style={{position: "absolute", inset: 0}}>
            <path d="M70 355 C230 84 380 514 646 146" fill="none" stroke={theme.colors.lineStrong} strokeWidth="6" strokeLinecap="round" strokeDasharray="950" strokeDashoffset={950 * (1 - tangleDraw)} opacity="0.78" />
            <path d="M86 138 C242 392 420 118 616 392" fill="none" stroke={theme.colors.red} strokeWidth="4" strokeLinecap="round" strokeDasharray="950" strokeDashoffset={950 * (1 - tangleDraw)} opacity="0.62" />
            <path d="M134 438 C264 226 422 286 584 76" fill="none" stroke={theme.colors.gold} strokeWidth="4" strokeLinecap="round" strokeDasharray="880" strokeDashoffset={880 * (1 - tangleDraw)} opacity="0.58" />
          </svg>

          {manualItems.map((item, index) => {
            const opacity = sequenceOpacity(frame - 26, index, 10);
            const drift = Math.sin((frame + index * 31) / 24) * (index % 2 === 0 ? 10 : -10);
            return (
              <div key={item.label} style={{position: "absolute", left: item.x, top: item.y + drift, width: 226, padding: 20, borderRadius: theme.radius.lg, background: "rgba(255,255,255,0.92)", border: `2px solid ${item.tone}`, boxShadow: theme.shadow.soft, opacity}}>
                <EngineeringIcon name={item.icon} stroke={item.tone} size={48} />
                <div style={{...theme.typography.label, color: theme.colors.ink, marginTop: 12}}>{item.label}</div>
                <div style={{...theme.typography.small, color: theme.colors.muted, marginTop: 8}}>{item.detail}</div>
              </div>
            );
          })}
          <div style={{position: "absolute", right: 30, bottom: 28, padding: "12px 18px", borderRadius: theme.radius.pill, background: theme.colors.redSoft, color: theme.colors.red, ...theme.typography.small, fontWeight: 780, opacity: fadeAt(2, 7.2)}}>
            Context depends on memory
          </div>
        </div>
      </div>

      <div style={{position: "absolute", left: 846, top: 446, width: 174, height: 72, opacity: fadeAt(2, 7.0)}}>
        <svg width="174" height="72" viewBox="0 0 174 72">
          <path d="M10 36h134" stroke={theme.colors.teal} strokeWidth="8" strokeLinecap="round" />
          <path d="M128 14 158 36 128 58" fill="none" stroke={theme.colors.teal} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div style={{position: "absolute", right: 94, top: 382, width: 800, opacity: fadeAt(2, 6.8)}}>
        <div style={{display: "flex", alignItems: "center", gap: 16, marginBottom: 18}}>
          <div style={{...theme.typography.label, color: theme.colors.teal, textTransform: "uppercase"}}>With SDD Orchestrator</div>
          <div style={{height: 2, flex: 1, background: theme.colors.tealSoft}} />
        </div>
        <div style={{position: "relative", height: 514, borderRadius: theme.radius.lg, background: theme.gradients.dark, boxShadow: "0 30px 100px rgba(21,27,43,0.22)", overflow: "hidden", color: theme.colors.white}}>
          <div style={{position: "absolute", left: 38, top: 34}}>
            <div style={{...theme.typography.h2, fontSize: 38, color: theme.colors.white}}>One Guided Workflow</div>
            <div style={{...theme.typography.small, color: "#B7C7DD", marginTop: 8}}>State, approvals, evidence, and gates stay in order.</div>
          </div>
          <svg width="760" height="228" viewBox="0 0 760 228" style={{position: "absolute", left: 18, top: 176}}>
            <path d="M66 112 C170 48 264 176 370 112 S570 48 696 112" fill="none" stroke="rgba(255,255,255,0.48)" strokeWidth="6" strokeLinecap="round" strokeDasharray="900" strokeDashoffset={900 * (1 - railDraw)} />
          </svg>
          <div style={{position: "absolute", left: 42, right: 42, top: 156, height: 260}}>
            {workflowItems.map((item, index) => {
              const opacity = sequenceOpacity(frame - 188, index, 8);
              const x = 8 + index * 138;
              const y = index % 2 === 0 ? 38 : 128;
              return (
                <div key={item.label} style={{position: "absolute", left: x, top: y, width: 132, height: 132, borderRadius: 24, background: "rgba(255,255,255,0.94)", color: theme.colors.ink, border: `2px solid ${item.tone}`, boxShadow: "0 18px 48px rgba(0,0,0,0.16)", display: "grid", placeItems: "center", opacity}}>
                  <div style={{textAlign: "center", padding: "0 10px"}}>
                    <EngineeringIcon name={item.icon} stroke={item.tone} size={44} />
                    <div style={{...theme.typography.label, color: theme.colors.ink, marginTop: 8}}>{item.label}</div>
                    <div style={{...theme.typography.small, color: theme.colors.muted, marginTop: 4, fontSize: 15}}>{item.detail}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{position: "absolute", left: 38, right: 38, bottom: 32, height: 62, borderRadius: theme.radius.pill, background: "rgba(0,168,142,0.16)", border: "1px solid rgba(0,168,142,0.42)", display: "flex", alignItems: "center", justifyContent: "center", color: theme.colors.white, ...theme.typography.label, opacity: fadeAt(3, 11.8)}}>
            Approval Gate Is Explicit, Not Remembered
          </div>
        </div>
      </div>
    </ShowcaseFrame>
  );
};
