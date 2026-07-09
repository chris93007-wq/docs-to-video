import {interpolate, spring} from "remotion";
import {BrandMark} from "../../../../assets/svg/BrandMark";
import {EngineeringIcon} from "../../../../assets/icons/EngineeringIcons";
import {clamp, sequenceOpacity} from "../../../../utils/animation";
import content from "../../../../../content/sdd-orchestrator-launch-content.json";
import {OracleIcon, oracleAssets, useOracleBrand, useShowcaseTheme} from "./brand";
import {ShowcaseFrame, ShowcaseSceneProps, TimingPill, useSceneBeats} from "./shared";

type PerformanceBeat = {
  startSeconds: number;
  speechEndSeconds: number;
};

export const SddContributionCta = (props: ShowcaseSceneProps) => {
  const theme = useShowcaseTheme();
  const isOracle = useOracleBrand();
  const sceneContent = content.scenes.conclusion;
  const {frame} = useSceneBeats(props);
  const seconds = frame / props.fps;
  const performanceSegments = ((props.scene.narration as unknown as {performanceSegments?: PerformanceBeat[]})?.performanceSegments ?? []);
  const contributionStart = Math.max(2.8, (performanceSegments[1]?.startSeconds ?? 3.8) - 0.45);
  const communityStart = performanceSegments[1]?.startSeconds ?? 3.8;
  const contributionProgress = interpolate(seconds, [contributionStart, contributionStart + 0.55], [0, 1], clamp);
  const communityProgress = interpolate(seconds, [communityStart + 0.18, communityStart + 0.72], [0, 1], clamp);
  const markScale = interpolate(
    spring({frame, fps: props.fps, config: {damping: 18, stiffness: 112}}),
    [0, 1],
    [0.86, 1],
    clamp,
  );

  return (
    <ShowcaseFrame align="center" eyebrow={sceneContent.eyebrow} title={props.scene.title} subtitle={sceneContent.subtitle}>
      <div style={{position: "absolute", left: 208, right: 208, top: 348, height: 188, borderRadius: 34, background: theme.gradients.dark, boxShadow: "0 34px 120px rgba(21,27,43,0.24)", color: theme.colors.white, display: "grid", gridTemplateColumns: "190px 1fr 180px", alignItems: "center", padding: "0 42px", transform: `scale(${interpolate(contributionProgress, [0, 1], [1, 0.96], clamp)})`, transformOrigin: "center top"}}>
        <div style={{display: "grid", placeItems: "center", transform: `scale(${markScale})`}}>
          {isOracle ? <OracleIcon src={oracleAssets.icons.codex} size={128} /> : <BrandMark frame={frame + 80} size={128} />}
        </div>
        <div>
          <div style={{...theme.typography.small, color: isOracle ? theme.colors.violet : "#8FD8FF", textTransform: "uppercase", letterSpacing: 1.1}}>{sceneContent.promptEyebrow}</div>
          <div style={{fontFamily: theme.typography.mono, fontSize: 28, lineHeight: 1.35, color: theme.colors.white, marginTop: 12}}>
            <span style={{color: theme.colors.teal}}>&gt;</span> {sceneContent.prompt}
          </div>
          <div style={{...theme.typography.body, color: isOracle ? "#D9DDDA" : "#B7C7DD", marginTop: 8}}>{sceneContent.promptDetail}</div>
        </div>
        <div style={{display: "grid", placeItems: "center"}}>
          <div style={{width: 106, height: 106, borderRadius: 999, background: theme.colors.teal, display: "grid", placeItems: "center", boxShadow: isOracle ? "0 18px 54px rgba(49,45,42,0.28)" : "0 18px 54px rgba(0,168,142,0.34)"}}>
            <EngineeringIcon name="play" stroke={theme.colors.white} size={66} />
          </div>
        </div>
      </div>

      <div style={{position: "absolute", left: 184, right: 184, top: 568, minHeight: 190, borderRadius: 30, background: "rgba(255,255,255,0.94)", border: `2px solid ${theme.colors.line}`, boxShadow: theme.shadow.soft, padding: "24px 34px", opacity: contributionProgress, transform: `translateY(${interpolate(contributionProgress, [0, 1], [30, 0], clamp)}px)`}}>
        <div style={{display: "flex", alignItems: "center", justifyContent: "center", gap: 14}}>
          {isOracle ? <OracleIcon src={oracleAssets.icons.traceability} size={48} /> : <EngineeringIcon name="branch" stroke={theme.colors.violet} size={48} />}
          <div style={{...theme.typography.h2, fontSize: 36}}>{sceneContent.contributionHeading}</div>
        </div>
        <div style={{display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap", marginTop: 22}}>
          {sceneContent.contributionSurfaces.map((surface, index) => (
            <TimingPill key={surface} opacity={sequenceOpacity(frame - Math.round(contributionStart * props.fps), index, 4)} tone={index % 3 === 0 ? "blue" : index % 3 === 1 ? "teal" : "violet"}>
              {surface}
            </TimingPill>
          ))}
        </div>
      </div>

      <div style={{position: "absolute", left: 254, right: 254, bottom: 86, height: 112, borderRadius: theme.radius.pill, background: isOracle ? theme.colors.teal : "linear-gradient(90deg, rgba(47,128,237,0.98), rgba(111,76,214,0.98), rgba(0,168,142,0.98))", color: theme.colors.white, display: "flex", alignItems: "center", justifyContent: "center", gap: 18, boxShadow: isOracle ? "0 24px 70px rgba(49,45,42,0.24)" : "0 24px 70px rgba(47,128,237,0.28)", opacity: communityProgress, transform: `translateY(${interpolate(communityProgress, [0, 1], [24, 0], clamp)}px)`}}>
        <EngineeringIcon name="branch" stroke={theme.colors.white} size={52} />
        <div style={{...theme.typography.h2, fontSize: 36, color: theme.colors.white}}>{sceneContent.communityLine}</div>
      </div>
    </ShowcaseFrame>
  );
};
