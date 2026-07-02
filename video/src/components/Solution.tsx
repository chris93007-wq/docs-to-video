import {interpolate, useCurrentFrame} from "remotion";
import {StatefulRunDiagram} from "../assets/diagrams/StatefulRunDiagram";
import {EngineeringIcon, EngineeringIconName} from "../assets/icons/EngineeringIcons";
import {SceneDefinition} from "../data/timeline";
import {theme} from "../styles/theme";
import {clamp, fadeIn, sequenceOpacity} from "../utils/animation";
import {Pill, SceneFrame} from "./SceneFrame";

type Props = {
  scene: SceneDefinition;
  durationFrames: number;
};

const runFacts: Array<{label: string; icon: EngineeringIconName; tone: "blue" | "teal" | "gold" | "violet"}> = [
  {label: "Creates a run", icon: "play", tone: "blue"},
  {label: "Records what happened", icon: "database", tone: "teal"},
  {label: "Stops for approvals", icon: "approval", tone: "gold"},
  {label: "Resumes at boundaries", icon: "timeline", tone: "violet"},
];

const toneColor = {
  blue: theme.colors.accent,
  teal: theme.colors.teal,
  gold: theme.colors.gold,
  violet: theme.colors.violet,
};

export const SolutionScene = ({scene, durationFrames}: Props) => {
  const frame = useCurrentFrame();

  return (
    <SceneFrame
      scene={scene}
      durationFrames={durationFrames}
      eyebrow="The usability layer"
      title="The orchestrator makes SDD stateful."
      subtitle="Codex or the CLI can advance deterministic phases, while the coordinator owns boundaries, blockers, artifacts, and events."
    >
      <div
        style={{
          position: "absolute",
          right: 72,
          top: 306,
          opacity: fadeIn(frame, 18, 20),
          transform: `translateY(${interpolate(frame, [18, 44], [28, 0], clamp)}px)`,
        }}
      >
        <StatefulRunDiagram frame={frame} />
      </div>

      <div
        style={{
          position: "absolute",
          left: 100,
          bottom: 216,
          display: "grid",
          gridTemplateColumns: "repeat(2, 330px)",
          gap: 22,
        }}
      >
        {runFacts.map((fact, index) => {
          const opacity = sequenceOpacity(frame - 70, index, 13);
          return (
            <div
              key={fact.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "18px 20px",
                borderRadius: theme.radius.md,
                background: "rgba(255,255,255,0.78)",
                boxShadow: theme.shadow.line,
                opacity,
              }}
            >
              <EngineeringIcon name={fact.icon} stroke={toneColor[fact.tone]} size={42} />
              <div style={{...theme.typography.small, color: theme.colors.ink, fontWeight: 760}}>
                {fact.label}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{position: "absolute", left: 100, top: 446, opacity: fadeIn(frame, 118, 18)}}>
        <Pill tone="teal">One run replaces scattered memory</Pill>
      </div>
    </SceneFrame>
  );
};
