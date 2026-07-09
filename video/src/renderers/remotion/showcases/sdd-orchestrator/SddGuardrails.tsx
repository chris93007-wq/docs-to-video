import {interpolate} from "remotion";
import {EngineeringIcon, EngineeringIconName} from "../../../../assets/icons/EngineeringIcons";
import {clamp} from "../../../../utils/animation";
import content from "../../../../../content/sdd-orchestrator-launch-content.json";
import {colorForTone, OracleIcon, oracleAssets, useOracleBrand, useShowcaseTheme} from "./brand";
import {ShowcaseFrame, ShowcaseSceneProps, useSceneBeats} from "./shared";

type PerformanceBeat = {
  startSeconds: number;
  speechEndSeconds: number;
};

type RoleLane = {
  role: string;
  value: string;
  icon: EngineeringIconName;
  color: string;
  friction: string[];
  guardrails: string[];
  performanceBeat: number;
};

export const SddGuardrails = (props: ShowcaseSceneProps) => {
  const theme = useShowcaseTheme();
  const isOracle = useOracleBrand();
  const sceneContent = content.scenes.guardrails;
  const roleLanes: RoleLane[] = sceneContent.lanes.map((lane, index) => ({
    ...lane,
    icon: lane.icon as EngineeringIconName,
    color: colorForTone(theme, !isOracle && index === 2 ? "accent" : lane.tone),
  }));
  const {frame} = useSceneBeats(props);
  const seconds = frame / props.fps;
  const performanceSegments = ((props.scene.narration as unknown as {performanceSegments?: PerformanceBeat[]})?.performanceSegments ?? []);
  const communityStart = performanceSegments[5]?.startSeconds ?? 18.5;

  return (
    <ShowcaseFrame
      eyebrow={sceneContent.eyebrow}
      title={props.scene.title}
      subtitle={sceneContent.subtitle}
    >
      <div style={{position: "absolute", left: 96, right: 96, top: 388, bottom: 48, borderRadius: 34, background: theme.gradients.dark, boxShadow: "0 38px 130px rgba(21,27,43,0.24)", overflow: "hidden"}}>
        <div style={{position: "absolute", inset: 0, background: isOracle ? "radial-gradient(circle at 10% 20%, rgba(222,176,104,0.16), transparent 34%), radial-gradient(circle at 90% 78%, rgba(92,146,109,0.16), transparent 36%)" : "radial-gradient(circle at 10% 20%, rgba(47,128,237,0.2), transparent 34%), radial-gradient(circle at 90% 78%, rgba(0,168,142,0.18), transparent 36%)"}} />
        <div style={{position: "absolute", left: 36, top: 24, ...theme.typography.small, color: isOracle ? theme.colors.violet : "#8FD8FF", textTransform: "uppercase", letterSpacing: 1.1}}>{sceneContent.columns[0]}</div>
        <div style={{position: "absolute", left: 386, top: 24, ...theme.typography.small, color: isOracle ? "#F0A99E" : "#F3A6B3", textTransform: "uppercase", letterSpacing: 1.1}}>{sceneContent.columns[1]}</div>
        <div style={{position: "absolute", left: 914, top: 24, ...theme.typography.small, color: isOracle ? "#A7C5B0" : "#8BE0D0", textTransform: "uppercase", letterSpacing: 1.1}}>{sceneContent.columns[2]}</div>

        {roleLanes.map((lane, index) => {
          const start = performanceSegments[lane.performanceBeat]?.startSeconds ?? index * 4.6;
          const nextStart = index < roleLanes.length - 1
            ? performanceSegments[roleLanes[index + 1].performanceBeat]?.startSeconds ?? start + 4.6
            : communityStart;
          const opacity = interpolate(seconds, [start - 0.18, start + 0.28], [0, 1], clamp);
          const guardrailProgress = interpolate(seconds, [start + 0.45, start + 1.2], [0, 1], clamp);
          const active = seconds >= start && seconds < nextStart;
          const top = 64 + index * 164;
          return (
            <div key={lane.role} style={{position: "absolute", left: 28, right: 28, top, height: 144, opacity, transform: `translateY(${interpolate(opacity, [0, 1], [20, 0], clamp)}px)`}}>
              <div style={{position: "absolute", left: 0, top: 0, width: 318, height: 144, boxSizing: "border-box", borderRadius: 22, background: "rgba(255,255,255,0.96)", border: `3px solid ${lane.color}`, boxShadow: active ? `0 18px 52px ${lane.color}38` : "0 14px 38px rgba(0,0,0,0.15)", padding: "20px 22px", display: "grid", gridTemplateColumns: "64px 1fr", alignItems: "center", gap: 16}}>
                {isOracle ? <OracleIcon src={[oracleAssets.icons.engineer, oracleAssets.icons.product, oracleAssets.icons.leadership][index]} size={58} /> : <EngineeringIcon name={lane.icon} stroke={lane.color} size={58} />}
                <div>
                  <div style={{...theme.typography.h2, fontSize: 28, lineHeight: 1.05}}>{lane.role}</div>
                  <div style={{...theme.typography.small, color: lane.color, marginTop: 8, fontWeight: 760}}>{lane.value}</div>
                </div>
              </div>

              <div style={{position: "absolute", left: 350, top: 0, width: 386, height: 144, boxSizing: "border-box", borderRadius: 22, background: "rgba(214,69,93,0.11)", border: "1px solid rgba(214,69,93,0.34)", padding: 18, display: "flex", flexWrap: "wrap", alignContent: "center", gap: 10}}>
                {lane.friction.map((item) => (
                  <div key={item} style={{padding: "10px 14px", borderRadius: theme.radius.pill, background: "rgba(255,255,255,0.9)", color: theme.colors.ink, ...theme.typography.small, fontWeight: 730}}>
                    <span style={{display: "inline-block", width: 9, height: 9, borderRadius: 99, background: theme.colors.red, marginRight: 9}} />{item}
                  </div>
                ))}
              </div>

              <svg width="148" height="144" viewBox="0 0 148 144" style={{position: "absolute", left: 748, top: 0}}>
                <path d="M12 72 H126" fill="none" stroke={lane.color} strokeWidth="7" strokeLinecap="round" strokeDasharray="114" strokeDashoffset={114 * (1 - guardrailProgress)} />
                <path d="m108 52 22 20-22 20" fill="none" stroke={lane.color} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" opacity={guardrailProgress} />
              </svg>

              <div style={{position: "absolute", left: 908, right: 0, top: 0, height: 144, boxSizing: "border-box", borderRadius: 22, background: "rgba(255,255,255,0.96)", border: `2px solid ${lane.color}`, padding: "18px 22px", display: "flex", alignItems: "center", gap: 12, opacity: guardrailProgress, transform: `translateX(${interpolate(guardrailProgress, [0, 1], [28, 0], clamp)}px)`}}>
                <EngineeringIcon name="shield" stroke={lane.color} size={54} />
                <div style={{display: "flex", flexWrap: "wrap", gap: 10}}>
                  {lane.guardrails.map((item) => (
                    <div key={item} style={{padding: "10px 14px", borderRadius: theme.radius.pill, background: `${lane.color}16`, color: theme.colors.ink, ...theme.typography.small, fontWeight: 780}}>{item}</div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        <div style={{position: "absolute", left: 310, right: 310, bottom: 18, height: 82, borderRadius: theme.radius.pill, background: isOracle ? theme.colors.teal : "linear-gradient(90deg, rgba(47,128,237,0.95), rgba(111,76,214,0.95), rgba(0,168,142,0.95))", color: theme.colors.white, display: "flex", alignItems: "center", justifyContent: "center", gap: 16, boxShadow: isOracle ? "0 22px 60px rgba(49,45,42,0.24)" : "0 22px 60px rgba(47,128,237,0.28)", opacity: interpolate(seconds, [communityStart - 0.18, communityStart + 0.32], [0, 1], clamp), transform: `translateY(${interpolate(seconds, [communityStart - 0.18, communityStart + 0.32], [24, 0], clamp)}px)`}}>
          <EngineeringIcon name="branch" stroke={theme.colors.white} size={48} />
          <div style={{...theme.typography.h2, fontSize: 30, color: theme.colors.white}}>{sceneContent.communityLine}</div>
        </div>
      </div>
    </ShowcaseFrame>
  );
};
