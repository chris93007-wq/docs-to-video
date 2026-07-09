import {interpolate, spring} from "remotion";
import {BrandMark} from "../../../../assets/svg/BrandMark";
import {EngineeringIcon, EngineeringIconName} from "../../../../assets/icons/EngineeringIcons";
import {clamp, sequenceOpacity} from "../../../../utils/animation";
import content from "../../../../../content/sdd-orchestrator-launch-content.json";
import {colorForTone, OracleIcon, oracleAssets, useOracleBrand, useShowcaseTheme} from "./brand";
import {ShowcaseFrame, ShowcaseSceneProps, TimingPill, useSceneBeats} from "./shared";

export const SddEvidenceChain = (props: ShowcaseSceneProps) => {
  const theme = useShowcaseTheme();
  const isOracle = useOracleBrand();
  const sceneContent = content.scenes.solution;
  const sourceCards = sceneContent.sourceCards.map((item, index) => ({
    ...item,
    icon: item.icon as EngineeringIconName,
    color: colorForTone(theme, item.tone),
    y: [388, 574, 760][index],
  }));
  const runState = sceneContent.runState.map((item) => ({
    ...item,
    color: colorForTone(theme, item.tone),
  }));
  const {frame, fadeAt} = useSceneBeats(props);
  const drawIn = interpolate(frame, [32, 202], [0, 1], clamp);
  const drawOut = interpolate(frame, [104, 316], [0, 1], clamp);
  const scale = interpolate(spring({frame, fps: props.fps, config: {damping: 20, stiffness: 96}}), [0, 1], [0.84, 1], clamp);

  return (
    <ShowcaseFrame eyebrow={sceneContent.eyebrow} title={props.scene.title} subtitle={sceneContent.subtitle}>
      <svg width="1500" height="650" viewBox="0 0 1500 650" style={{position: "absolute", left: 236, top: 322, opacity: fadeAt(0, 0.5)}}>
        <defs>
          <linearGradient id="solution-in" x1="0" x2="1">
            <stop offset="0" stopColor={theme.colors.violet} />
            <stop offset="1" stopColor={theme.colors.teal} />
          </linearGradient>
        </defs>
        <path d="M128 92 C340 92 330 244 528 292 M128 278 C340 278 330 298 528 300 M128 464 C340 464 330 346 528 308" fill="none" stroke="url(#solution-in)" strokeWidth="6" strokeLinecap="round" strokeDasharray="700" strokeDashoffset={700 * (1 - drawIn)} />
        <path d="M892 300 C1050 300 1078 112 1260 112 M892 300 C1050 300 1078 268 1260 268 M892 300 C1050 300 1078 424 1260 424 M892 300 C1050 300 1078 558 1260 558" fill="none" stroke={theme.colors.lineStrong} strokeWidth="6" strokeLinecap="round" strokeDasharray="760" strokeDashoffset={760 * (1 - drawOut)} />
      </svg>

      {sourceCards.map((item, index) => (
        <div key={item.label} style={{position: "absolute", left: 96, top: item.y, width: 320, minHeight: 132, borderRadius: theme.radius.lg, background: "rgba(255,255,255,0.94)", border: `2px solid ${item.color}`, boxShadow: theme.shadow.soft, padding: 22, display: "grid", gridTemplateColumns: "70px 1fr", gap: 14, alignItems: "center", opacity: sequenceOpacity(frame - 24, index, 15)}}>
          {isOracle && item.label === sceneContent.sourceCards[2].label ? <OracleIcon src={oracleAssets.icons.codex} size={60} /> : <EngineeringIcon name={item.icon} stroke={item.color} size={60} />}
          <div>
            <div style={{...theme.typography.h2, fontSize: 30}}>{item.label}</div>
            <div style={{...theme.typography.small, color: theme.colors.muted, marginTop: 7}}>{item.detail}</div>
          </div>
        </div>
      ))}

      <div style={{position: "absolute", left: 620, top: 346, width: 680, height: 570, borderRadius: 48, background: theme.gradients.dark, boxShadow: "0 38px 130px rgba(21,27,43,0.26)", color: theme.colors.white, display: "grid", placeItems: "center", opacity: fadeAt(1, 3.2), transform: `scale(${scale})`}}>
        <div style={{position: "absolute", inset: 0, background: isOracle ? "radial-gradient(circle at 50% 30%, rgba(222,176,104,0.2), transparent 42%), radial-gradient(circle at 50% 76%, rgba(92,146,109,0.2), transparent 36%)" : "radial-gradient(circle at 50% 30%, rgba(47,128,237,0.3), transparent 42%), radial-gradient(circle at 50% 76%, rgba(0,168,142,0.24), transparent 36%)"}} />
        <div style={{textAlign: "center", zIndex: 2}}>
          {isOracle ? <OracleIcon src={oracleAssets.icons.automation} size={220} /> : <BrandMark frame={frame + 40} size={240} />}
          <div style={{...theme.typography.h2, color: theme.colors.white, fontSize: 50, marginTop: 18}}>{sceneContent.commandCenter.title}</div>
          <div style={{...theme.typography.body, color: isOracle ? "#D9DDDA" : "#B7C7DD", marginTop: 12}}>{sceneContent.commandCenter.subtitle}</div>
          <div style={{display: "flex", justifyContent: "center", gap: 12, marginTop: 28}}>
            <TimingPill opacity={fadeAt(2, 7.2)} tone="teal">{sceneContent.commandCenter.pills[0]}</TimingPill>
            <TimingPill opacity={fadeAt(2, 7.2)} tone="blue">{sceneContent.commandCenter.pills[1]}</TimingPill>
          </div>
        </div>
      </div>

      <div style={{position: "absolute", right: 94, top: 382, width: 420, display: "grid", gap: 18}}>
        <div style={{...theme.typography.label, color: theme.colors.accent, textTransform: "uppercase", marginBottom: 4, opacity: fadeAt(2, 7.4)}}>{sceneContent.stateHeading}</div>
        {runState.map((item, index) => (
          <div key={item.label} style={{height: 102, borderRadius: theme.radius.lg, background: "rgba(255,255,255,0.94)", border: `2px solid ${item.color}`, boxShadow: theme.shadow.soft, display: "grid", gridTemplateColumns: "52px 1fr auto", alignItems: "center", gap: 14, padding: "0 22px", opacity: sequenceOpacity(frame - 142, index, 14)}}>
            <EngineeringIcon name={item.state === "Complete" ? "check" : item.state === "Waiting" ? "approval" : "timeline"} stroke={item.color} size={46} />
            <div style={{...theme.typography.label, color: theme.colors.ink}}>{item.label}</div>
            <div style={{padding: "8px 12px", borderRadius: theme.radius.pill, background: `${item.color}18`, color: item.color, ...theme.typography.small, fontWeight: 780}}>{item.state}</div>
          </div>
        ))}
      </div>
    </ShowcaseFrame>
  );
};
