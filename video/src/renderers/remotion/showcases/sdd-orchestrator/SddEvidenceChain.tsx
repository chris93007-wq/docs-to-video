import {interpolate, spring} from "remotion";
import {BrandMark} from "../../../../assets/svg/BrandMark";
import {EngineeringIcon} from "../../../../assets/icons/EngineeringIcons";
import {theme} from "../../../../styles/theme";
import {clamp, fadeIn, sequenceOpacity} from "../../../../utils/animation";
import {ShowcaseFrame, ShowcaseSceneProps, TimingPill, useSceneBeats} from "./shared";

const evidenceNodes = [
  {label: "Requirements", icon: "confluence" as const, color: theme.colors.violet},
  {label: "Design", icon: "document" as const, color: theme.colors.accent},
  {label: "Plan", icon: "timeline" as const, color: theme.colors.gold},
  {label: "Tests", icon: "gate" as const, color: theme.colors.red},
  {label: "Implementation", icon: "code" as const, color: theme.colors.teal},
  {label: "Validation", icon: "browser" as const, color: theme.colors.accent},
  {label: "Lifecycle", icon: "check" as const, color: theme.colors.teal},
];

export const SddEvidenceChain = (props: ShowcaseSceneProps) => {
  const {frame, fadeAt, cue} = useSceneBeats(props);
  const collapse = interpolate(frame, [46, 150], [0, 1], clamp);
  const draw = interpolate(frame, [90, 260], [0, 1], clamp);
  const scale = interpolate(spring({frame, fps: props.fps, config: {damping: 20, stiffness: 100}}), [0, 1], [0.86, 1], clamp);

  return (
    <ShowcaseFrame eyebrow="The Solution" title="One Guided Workflow. One Source of Truth">
      <div style={{position: "absolute", left: 96, top: 386, width: 500, opacity: fadeAt(1, 2.2)}}>
        {["Stateful Workflow", "Source of Truth", "Evidence Trail"].map((phrase, index) => (
          <div key={phrase} style={{marginBottom: 18, padding: "20px 24px", borderRadius: theme.radius.md, background: "rgba(255,255,255,0.88)", boxShadow: theme.shadow.line, opacity: sequenceOpacity(frame - 48, index, 12), transform: `translateX(${interpolate(collapse, [0, 1], [0, 30 + index * 18], clamp)}px)`}}>
            <div style={{...theme.typography.label, color: index === 0 ? theme.colors.teal : index === 1 ? theme.colors.violet : theme.colors.accent}}>
              {phrase}
            </div>
          </div>
        ))}
        <div style={{display: "flex", gap: 14, marginTop: 30}}>
          <TimingPill opacity={fadeAt(2, 8.0)} tone="teal">{cue(2, "Stateful Run")}</TimingPill>
          <TimingPill opacity={fadeAt(3, 12.0)} tone="blue">{cue(3, "Evidence Stays Connected")}</TimingPill>
        </div>
      </div>

      <div style={{position: "absolute", left: 734, top: 284, width: 528, height: 528, borderRadius: 999, background: "rgba(255,255,255,0.78)", boxShadow: "0 35px 120px rgba(47,128,237,0.16)", display: "grid", placeItems: "center", opacity: fadeAt(0, 0.8), transform: `scale(${scale})`}}>
        <div style={{position: "absolute", inset: 42, borderRadius: 999, border: `2px solid ${theme.colors.line}`}} />
        <BrandMark frame={frame + 40} size={260} />
        <div style={{position: "absolute", bottom: 78}}>
          <TimingPill opacity={fadeAt(1, 4.8)} tone="dark">Stateful Run</TimingPill>
        </div>
      </div>

      <svg width="1160" height="520" viewBox="0 0 1160 520" style={{position: "absolute", right: 54, bottom: 72, opacity: fadeIn(frame, 82, 22)}}>
        <path d="M88 260 C258 142 400 378 574 260 S860 142 1074 260" fill="none" stroke={theme.colors.lineStrong} strokeWidth="5" strokeLinecap="round" strokeDasharray="1600" strokeDashoffset={1600 * (1 - draw)} />
      </svg>

      <div style={{position: "absolute", right: 70, bottom: 146, width: 1100, height: 340}}>
        {evidenceNodes.map((node, index) => {
          const x = 32 + index * 166;
          const y = index % 2 === 0 ? 42 : 154;
          const appear = sequenceOpacity(frame - 108, index, 10);
          return (
            <div key={node.label} style={{position: "absolute", left: x, top: y, width: 134, height: 134, borderRadius: 999, display: "grid", placeItems: "center", background: appear > 0.95 ? node.color : theme.colors.surface, border: `3px solid ${node.color}`, boxShadow: theme.shadow.soft, opacity: appear}}>
              <EngineeringIcon name={node.icon} stroke={appear > 0.95 ? theme.colors.white : node.color} size={50} />
              <div style={{position: "absolute", top: 144, width: 180, textAlign: "center", ...theme.typography.small, color: theme.colors.ink, fontWeight: 760}}>{node.label}</div>
            </div>
          );
        })}
      </div>
    </ShowcaseFrame>
  );
};
