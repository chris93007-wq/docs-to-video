import {interpolate, spring} from "remotion";
import {BrandMark} from "../../../../assets/svg/BrandMark";
import {EngineeringIconName} from "../../../../assets/icons/EngineeringIcons";
import {theme} from "../../../../styles/theme";
import {clamp, fadeIn, rise} from "../../../../utils/animation";
import {FloatingChip, ShowcaseFrame, ShowcaseSceneProps, TimingPill, useSceneBeats} from "./shared";

const tangleItems: Array<{
  label: string;
  detail: string;
  icon: EngineeringIconName;
  color: string;
  x: number;
  y: number;
}> = [
  {label: "Jira", detail: "Feature Intent", icon: "jira", color: theme.colors.accent, x: 1070, y: 186},
  {label: "Confluence", detail: "Source Truth", icon: "confluence", color: theme.colors.violet, x: 1454, y: 252},
  {label: "Codex", detail: "Coordinator Prompt", icon: "code", color: theme.colors.teal, x: 1110, y: 690},
  {label: "Approvals", detail: "Human Boundaries", icon: "approval", color: theme.colors.gold, x: 1530, y: 642},
  {label: "Jest", detail: "Red Phase", icon: "gate", color: theme.colors.red, x: 1288, y: 460},
  {label: "Playwright", detail: "Visible Validation", icon: "browser", color: theme.colors.accent, x: 840, y: 512},
];

export const SddHookTangle = (props: ShowcaseSceneProps) => {
  const {frame, fadeAt, cue} = useSceneBeats(props);
  const draw = interpolate(frame, [18, 118], [0, 1], clamp);
  const untangle = interpolate(frame, [210, 304], [0, 1], clamp);
  const markScale = interpolate(
    spring({frame, fps: props.fps, config: {damping: 18, stiffness: 112}}),
    [0, 1],
    [0.82, 1],
    clamp,
  );

  return (
    <ShowcaseFrame eyebrow="SDD Orchestrator" title={props.scene.title}>
      <div style={{position: "absolute", left: 96, top: 390, width: 780}}>
        <div style={{display: "flex", gap: 14, marginBottom: 30}}>
          <TimingPill opacity={fadeAt(1, 4.2)} tone="blue">{cue(1, "Jira and Confluence intent")}</TimingPill>
          <TimingPill opacity={fadeAt(2, 8.0)} tone="gold">{cue(2, "One Guided Workflow")}</TimingPill>
        </div>
        <div style={{...theme.typography.hero, fontSize: 76, lineHeight: 0.98, opacity: fadeAt(0, 0.6), transform: `translateY(${rise(frame, 14, 36, 24)}px)`}}>
          Too Many Moving Parts
        </div>
        <div style={{...theme.typography.body, width: 690, marginTop: 30, color: theme.colors.muted, opacity: fadeAt(1, 3.4)}}>
          Requirements, design, approvals, tests, implementation, validation, and evidence all need to stay connected.
        </div>
      </div>

      <svg width="1030" height="750" viewBox="0 0 1030 750" style={{position: "absolute", right: 62, top: 164, opacity: fadeIn(frame, 10, 20)}}>
        <defs>
          <linearGradient id="sdd-hook-line" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor={theme.colors.accent} />
            <stop offset="55%" stopColor={theme.colors.violet} />
            <stop offset="100%" stopColor={theme.colors.teal} />
          </linearGradient>
        </defs>
        <path d="M160 120 C390 38 575 650 820 138" fill="none" stroke="url(#sdd-hook-line)" strokeWidth="6" strokeLinecap="round" strokeDasharray="1500" strokeDashoffset={1500 * (1 - draw)} opacity={0.8 - untangle * 0.36} />
        <path d="M126 585 C316 210 606 210 896 585" fill="none" stroke={theme.colors.lineStrong} strokeWidth="5" strokeLinecap="round" strokeDasharray="1500" strokeDashoffset={1500 * (1 - draw)} opacity={0.74 - untangle * 0.3} />
        <path d="M206 360 C360 682 542 52 800 368" fill="none" stroke={theme.colors.gold} strokeWidth="4" strokeLinecap="round" strokeDasharray="1500" strokeDashoffset={1500 * (1 - draw)} opacity={0.68 - untangle * 0.24} />
        <path d="M258 214 C520 470 548 238 754 520" fill="none" stroke={theme.colors.red} strokeWidth="4" strokeLinecap="round" strokeDasharray="1500" strokeDashoffset={1500 * (1 - draw)} opacity={0.62 - untangle * 0.2} />
      </svg>

      <div style={{position: "absolute", right: 374, top: 360, display: "grid", placeItems: "center", opacity: fadeAt(0, 0.2), transform: `scale(${markScale + untangle * 0.08})`}}>
        <div style={{position: "absolute", width: 470, height: 470, borderRadius: 999, background: "rgba(255,255,255,0.74)", boxShadow: "0 30px 110px rgba(47,128,237,0.18)"}} />
        <BrandMark frame={frame} size={284} />
      </div>

      {tangleItems.map((item, index) => (
        <FloatingChip
          key={item.label}
          icon={item.icon}
          label={item.label}
          detail={item.detail}
          color={item.color}
          x={item.x + interpolate(untangle, [0, 1], [0, index % 2 === 0 ? -34 : 36], clamp)}
          y={item.y + interpolate(untangle, [0, 1], [0, index % 2 === 0 ? 24 : -28], clamp)}
          opacity={fadeAt(index % Math.max(1, props.shots.length), 1.4 + index * 0.55)}
        />
      ))}
    </ShowcaseFrame>
  );
};
