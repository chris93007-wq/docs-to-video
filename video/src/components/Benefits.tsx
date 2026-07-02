import {interpolate, useCurrentFrame} from "remotion";
import {EngineeringIcon, EngineeringIconName} from "../assets/icons/EngineeringIcons";
import {SceneDefinition} from "../data/timeline";
import {theme} from "../styles/theme";
import {clamp, fadeIn, sequenceOpacity} from "../utils/animation";
import {Readout, SceneFrame} from "./SceneFrame";

type Props = {
  scene: SceneDefinition;
  durationFrames: number;
};

const benefits: Array<{label: string; detail: string; icon: EngineeringIconName; color: string}> = [
  {label: "Lower cognitive load", detail: "One boundary for phases and gates", icon: "shield", color: theme.colors.accent},
  {label: "Easier onboarding", detail: "One prompt or one CLI command", icon: "play", color: theme.colors.teal},
  {label: "Resumable execution", detail: "Inspect, resume, restart at boundaries", icon: "timeline", color: theme.colors.violet},
  {label: "Safer fan-out", detail: "Reviewed, bounded, non-overlapping slices", icon: "branch", color: theme.colors.gold},
  {label: "Stronger traceability", detail: "Jira and Confluence through validation", icon: "check", color: theme.colors.teal},
];

export const BenefitsScene = ({scene, durationFrames}: Props) => {
  const frame = useCurrentFrame();

  return (
    <SceneFrame
      scene={scene}
      durationFrames={durationFrames}
      eyebrow="Engineering payoff"
      title="Less memory. More traceability."
      subtitle="The run ties product intent to requirements, design, tests, implementation, browser evidence, and final status."
    >
      <div
        style={{
          position: "absolute",
          left: 96,
          right: 96,
          top: 408,
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 20,
        }}
      >
        {benefits.map((benefit, index) => {
          const opacity = sequenceOpacity(frame - 22, index, 10);
          return (
            <div
              key={benefit.label}
              style={{
                minHeight: 318,
                borderRadius: theme.radius.lg,
                background: "rgba(255,255,255,0.9)",
                padding: 28,
                boxShadow: theme.shadow.line,
                opacity,
                transform: `translateY(${interpolate(opacity, [0, 1], [20, 0], clamp)}px)`,
              }}
            >
              <EngineeringIcon name={benefit.icon} stroke={benefit.color} size={68} />
              <div style={{...theme.typography.h2, fontSize: 31, marginTop: 24}}>
                {benefit.label}
              </div>
              <div style={{...theme.typography.small, color: theme.colors.muted, marginTop: 14}}>
                {benefit.detail}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          left: 166,
          right: 166,
          bottom: 172,
          height: 150,
          borderRadius: theme.radius.lg,
          background: "rgba(255,255,255,0.74)",
          boxShadow: theme.shadow.soft,
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          alignItems: "center",
          justifyItems: "center",
          opacity: fadeIn(frame, 108, 20),
        }}
      >
        <Readout label="Adoption friction" value="lower" progress={0.28} color={theme.colors.teal} />
        <Readout label="Evidence continuity" value="stronger" progress={0.92} color={theme.colors.accent} />
        <Readout label="Parallel work safety" value="bounded" progress={0.82} color={theme.colors.gold} />
      </div>
    </SceneFrame>
  );
};
