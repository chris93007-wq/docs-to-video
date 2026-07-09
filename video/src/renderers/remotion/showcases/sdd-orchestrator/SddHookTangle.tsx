import {interpolate, spring, useCurrentFrame} from "remotion";
import {BrandMark} from "../../../../assets/svg/BrandMark";
import {EngineeringIconName} from "../../../../assets/icons/EngineeringIcons";
import {clamp, fadeIn} from "../../../../utils/animation";
import content from "../../../../../content/sdd-orchestrator-launch-content.json";
import {colorForTone, oracleAssets, useOracleBrand, useShowcaseTheme} from "./brand";
import {FloatingChip, ShowcaseFrame, ShowcaseSceneProps, TimingPill} from "./shared";

type PerformanceBeat = {
  startSeconds: number;
  speechEndSeconds: number;
};

type Principle = {
  label: string;
  detail: string;
  icon: EngineeringIconName;
  color: string;
  x: number;
  y: number;
  driftX: number;
  driftY: number;
  beat: number;
};

export const SddHookTangle = (props: ShowcaseSceneProps) => {
  const theme = useShowcaseTheme();
  const isOracle = useOracleBrand();
  const sceneContent = content.scenes.hook;
  const principleLayout = [
    {x: 900, y: 286, driftX: 88, driftY: 92, beat: 3},
    {x: 1510, y: 300, driftX: -118, driftY: 126, beat: 4},
    {x: 882, y: 744, driftX: 154, driftY: -102, beat: 5},
    {x: 1518, y: 730, driftX: -162, driftY: -82, beat: 6},
  ];
  const principles: Principle[] = sceneContent.principles.map((item, index) => ({
    ...item,
    ...principleLayout[index],
    icon: item.icon as EngineeringIconName,
    color: colorForTone(theme, item.tone),
  }));
  const frame = useCurrentFrame();
  const seconds = frame / props.fps;
  const performanceSegments = ((props.scene.narration as unknown as {performanceSegments?: PerformanceBeat[]})?.performanceSegments ?? []);
  const finalPrinciple = performanceSegments[6];
  const tangleStart = finalPrinciple?.speechEndSeconds ?? props.scene.durationSeconds - 1.7;
  const tangle = interpolate(
    seconds,
    [tangleStart - 0.12, props.scene.durationSeconds - 0.14],
    [0, 1],
    clamp,
  );
  const positiveOpacity = interpolate(tangle, [0, 0.45], [1, 0], clamp);
  const frictionOpacity = interpolate(tangle, [0.5, 0.94], [0, 1], clamp);
  const markScale = interpolate(
    spring({frame, fps: props.fps, config: {damping: 18, stiffness: 112}}),
    [0, 1],
    [0.82, 1],
    clamp,
  );

  return (
    <ShowcaseFrame eyebrow={sceneContent.eyebrow} title={props.scene.title} subtitle={sceneContent.subtitle}>
      <div style={{position: "absolute", left: 96, top: 414, width: 720}}>
        <div style={{position: "absolute", inset: 0, opacity: positiveOpacity}}>
          <div style={{display: "flex", gap: 14, marginBottom: 30}}>
            <TimingPill opacity={fadeIn(frame, 24, 16)} tone="blue">{sceneContent.positive.pills[0]}</TimingPill>
            <TimingPill opacity={fadeIn(frame, 48, 16)} tone="teal">{sceneContent.positive.pills[1]}</TimingPill>
          </div>
          <div style={{...theme.typography.hero, fontSize: 76, lineHeight: 0.98}}>
            {sceneContent.positive.headline.map((line) => <div key={line}>{line}</div>)}
          </div>
          <div style={{...theme.typography.body, width: 660, marginTop: 30, color: theme.colors.muted}}>
            {sceneContent.positive.body}
          </div>
        </div>

        <div style={{position: "absolute", inset: 0, opacity: frictionOpacity, transform: `translateY(${interpolate(tangle, [0, 1], [24, 0], clamp)}px)`}}>
          <div style={{display: "flex", gap: 14, marginBottom: 30}}>
            <TimingPill opacity={frictionOpacity} tone="gold">{sceneContent.friction.pill}</TimingPill>
          </div>
          <div style={{...theme.typography.hero, fontSize: 76, lineHeight: 0.98}}>
            {sceneContent.friction.headline.map((line) => <div key={line}>{line}</div>)}
          </div>
          <div style={{...theme.typography.body, width: 660, marginTop: 30, color: theme.colors.muted}}>
            {sceneContent.friction.body}
          </div>
        </div>
      </div>

      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position: "absolute", inset: 0}}>
        <defs>
          <linearGradient id="sdd-hook-clean" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor={theme.colors.accent} />
            <stop offset="50%" stopColor={theme.colors.violet} />
            <stop offset="100%" stopColor={theme.colors.teal} />
          </linearGradient>
        </defs>
        <g opacity={0.58 * (1 - tangle)}>
          <path d="M1150 408 C1240 438 1264 486 1320 540" fill="none" stroke="url(#sdd-hook-clean)" strokeWidth="6" strokeLinecap="round" />
          <path d="M1510 420 C1430 448 1404 492 1364 540" fill="none" stroke="url(#sdd-hook-clean)" strokeWidth="6" strokeLinecap="round" />
          <path d="M1136 786 C1228 736 1266 666 1320 610" fill="none" stroke="url(#sdd-hook-clean)" strokeWidth="6" strokeLinecap="round" />
          <path d="M1518 774 C1430 734 1400 670 1364 610" fill="none" stroke="url(#sdd-hook-clean)" strokeWidth="6" strokeLinecap="round" />
        </g>
        <g opacity={tangle}>
          <path d="M1034 398 C1250 234 1392 860 1606 442" fill="none" stroke={theme.colors.accent} strokeWidth="6" strokeLinecap="round" strokeDasharray="13 15" />
          <path d="M1000 782 C1184 474 1438 476 1608 776" fill="none" stroke={theme.colors.violet} strokeWidth="6" strokeLinecap="round" />
          <path d="M1090 514 C1322 840 1402 300 1552 650" fill="none" stroke={theme.colors.gold} strokeWidth="5" strokeLinecap="round" />
          <path d="M1150 316 C1320 586 1410 570 1520 358" fill="none" stroke={theme.colors.red} strokeWidth="5" strokeLinecap="round" strokeDasharray="10 14" />
        </g>
      </svg>

      <div style={{position: "absolute", left: 1204, top: 408, width: 340, height: 340, display: "grid", placeItems: "center", transform: `scale(${markScale + tangle * 0.08})`}}>
        <div style={{position: "absolute", width: 340, height: 340, borderRadius: 999, background: "rgba(255,255,255,0.82)", boxShadow: isOracle ? `0 30px 110px rgba(49,45,42,${0.12 + tangle * 0.08})` : `0 30px 110px rgba(47,128,237,${0.18 + tangle * 0.14})`}} />
        {isOracle ? <img src={oracleAssets.o} style={{width: 220, height: 220, objectFit: "contain"}} /> : <BrandMark frame={frame} size={220} />}
      </div>

      {principles.map((item) => {
        const start = performanceSegments[item.beat]?.startSeconds ?? 9.8 + (item.beat - 3) * 1.4;
        const opacity = interpolate(seconds, [start - 0.16, start + 0.22], [0, 1], clamp);
        return (
          <FloatingChip
            key={item.label}
            icon={item.icon}
            label={item.label}
            detail={item.detail}
            color={item.color}
            x={item.x + item.driftX * tangle}
            y={item.y + item.driftY * tangle}
            opacity={opacity}
          />
        );
      })}
    </ShowcaseFrame>
  );
};
