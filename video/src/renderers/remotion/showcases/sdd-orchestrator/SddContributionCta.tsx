import {interpolate, spring} from "remotion";
import {BrandMark} from "../../../../assets/svg/BrandMark";
import {EngineeringIcon} from "../../../../assets/icons/EngineeringIcons";
import {theme} from "../../../../styles/theme";
import {clamp, sequenceOpacity} from "../../../../utils/animation";
import {ShowcaseFrame, ShowcaseSceneProps, TimingPill, useSceneBeats} from "./shared";
import {SddAdoptionRoles} from "./SddAdoptionRoles";

const contributionSurfaces = [
  "Prompts",
  "Gates",
  "Dashboards",
  "Validation",
  "Onboarding",
  "Developer Experience",
];

export const SddContributionCta = (props: ShowcaseSceneProps) => {
  const {frame, fadeAt} = useSceneBeats(props);
  const markScale = interpolate(
    spring({frame, fps: props.fps, config: {damping: 18, stiffness: 112}}),
    [0, 1],
    [0.86, 1],
    clamp,
  );

  return (
    <ShowcaseFrame align="center" eyebrow="Adopt and Improve It" title="Try SDD Orchestrator on Your Next Feature" subtitle="Contribute to make the workflow easier for every team to run.">
      <div style={{position: "absolute", left: 150, right: 150, top: 354, opacity: fadeAt(0, 0.4)}}>
        <SddAdoptionRoles frame={frame} startFrame={20} />
      </div>

      <div style={{position: "absolute", left: 168, right: 168, top: 624, minHeight: 160, borderRadius: theme.radius.lg, background: theme.gradients.dark, boxShadow: "0 34px 120px rgba(21,27,43,0.24)", color: theme.colors.white, display: "grid", gridTemplateColumns: "210px 1fr", alignItems: "center", padding: "28px 42px", opacity: fadeAt(1, 2.4)}}>
        <div style={{display: "grid", placeItems: "center", transform: `scale(${markScale})`}}>
          <BrandMark frame={frame + 80} size={140} />
        </div>
        <div>
          <div style={{...theme.typography.h2, fontSize: 46, color: theme.colors.white}}>Contribute Improvements to the Workflow</div>
          <div style={{display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24}}>
            {contributionSurfaces.map((surface, index) => (
              <TimingPill key={surface} opacity={sequenceOpacity(frame - 58, index, 5)} tone={index % 3 === 0 ? "blue" : index % 3 === 1 ? "teal" : "violet"}>
                {surface}
              </TimingPill>
            ))}
          </div>
        </div>
      </div>

      <div style={{position: "absolute", left: 0, right: 0, bottom: 118, display: "grid", placeItems: "center", opacity: fadeAt(2, 4.2)}}>
        <div style={{display: "flex", alignItems: "center", gap: 18, padding: "18px 28px", borderRadius: theme.radius.pill, background: "rgba(255,255,255,0.94)", boxShadow: theme.shadow.soft}}>
          <EngineeringIcon name="play" stroke={theme.colors.teal} size={54} />
          <div style={{...theme.typography.h2, fontSize: 36}}>One Guided Workflow. End-to-End Evidence.</div>
        </div>
      </div>
    </ShowcaseFrame>
  );
};
