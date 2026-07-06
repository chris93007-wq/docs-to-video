import {interpolate} from "remotion";
import {EngineeringIcon} from "../../../../assets/icons/EngineeringIcons";
import {theme} from "../../../../styles/theme";
import {clamp, sequenceOpacity} from "../../../../utils/animation";
import {ShowcaseFrame, ShowcaseSceneProps, TimingPill, useSceneBeats} from "./shared";

const guardrails = [
  {label: "Scope Boundary", detail: "Source truth limits drift", icon: "shield" as const, color: theme.colors.violet},
  {label: "Approval Stop", detail: "Human review before fan-out", icon: "approval" as const, color: theme.colors.gold},
  {label: "TDD Unit Tests", detail: "Before product code", icon: "gate" as const, color: theme.colors.red},
  {label: "Playwright Gate", detail: "Browser-visible validation", icon: "browser" as const, color: theme.colors.accent},
  {label: "Evidence Chain", detail: "Handoff stays inspectable", icon: "database" as const, color: theme.colors.teal},
];

export const SddGuardrails = (props: ShowcaseSceneProps) => {
  const {frame, fadeAt, cue} = useSceneBeats(props);
  const draw = interpolate(frame, [72, 262], [0, 1], clamp);
  const blocked = interpolate(frame, [138, 190, 234], [0, 1, 0.2], clamp);

  return (
    <ShowcaseFrame eyebrow="Guardrails and Traceability" title="The Coordinator Catches the Misses That Make SDD Fragile">
      <div style={{position: "absolute", left: 100, top: 506, width: 530}}>
        <div style={{height: 400, borderRadius: theme.radius.lg, background: "rgba(255,255,255,0.9)", boxShadow: theme.shadow.soft, padding: 30, opacity: fadeAt(0, 1.1)}}>
          <div style={{...theme.typography.label, color: theme.colors.red, textTransform: "uppercase"}}>Blocked Drift</div>
          <div style={{position: "relative", height: 224, marginTop: 24}}>
            <div style={{position: "absolute", left: 24, top: 28, width: 136, height: 136, borderRadius: 999, background: theme.colors.redSoft, border: `3px solid ${theme.colors.red}`, display: "grid", placeItems: "center", opacity: 0.82}}>
              <EngineeringIcon name="code" stroke={theme.colors.red} size={60} />
            </div>
            <div style={{position: "absolute", right: 20, top: 10, width: 210, padding: 20, borderRadius: theme.radius.md, background: theme.colors.surfaceMuted}}>
              <div style={{...theme.typography.small, color: theme.colors.muted}}>Unreviewed Change</div>
              <div style={{...theme.typography.h2, fontSize: 30, marginTop: 10}}>Drift</div>
            </div>
            <div style={{position: "absolute", left: 190, top: 80, width: 6, height: 132, borderRadius: 99, background: theme.colors.red, opacity: blocked}} />
            <div style={{position: "absolute", left: 216, top: 170, ...theme.typography.label, color: theme.colors.red, opacity: blocked}}>Not Past Source Truth</div>
          </div>
          <TimingPill opacity={fadeAt(1, 4.6)} tone="red">{cue(1, "Implementation drift is visible")}</TimingPill>
        </div>
      </div>

      <svg width="1120" height="560" viewBox="0 0 1120 560" style={{position: "absolute", right: 66, top: 374, opacity: fadeAt(1, 3.0)}}>
        <path d="M76 290 C226 120 376 438 526 288 S820 136 1034 288" fill="none" stroke={theme.colors.lineStrong} strokeWidth="6" strokeLinecap="round" strokeDasharray="1600" strokeDashoffset={1600 * (1 - draw)} />
      </svg>

      <div style={{position: "absolute", right: 84, top: 330, width: 1060, height: 590}}>
        {guardrails.map((item, index) => {
          const x = 40 + index * 206;
          const y = index % 2 === 0 ? 88 : 258;
          const opacity = sequenceOpacity(frame - 88, index, 14);
          return (
            <div key={item.label} style={{position: "absolute", left: x, top: y, width: 184, minHeight: 188, borderRadius: theme.radius.lg, background: "rgba(255,255,255,0.92)", border: `2px solid ${item.color}`, boxShadow: theme.shadow.soft, padding: 22, opacity, transform: `translateY(${interpolate(opacity, [0, 1], [24, 0], clamp)}px)`}}>
              <EngineeringIcon name={item.icon} stroke={item.color} size={56} />
              <div style={{...theme.typography.label, color: theme.colors.ink, marginTop: 16}}>{item.label}</div>
              <div style={{...theme.typography.small, color: theme.colors.muted, marginTop: 9}}>{item.detail}</div>
            </div>
          );
        })}
      </div>
    </ShowcaseFrame>
  );
};
