import {interpolate, useCurrentFrame} from "remotion";
import {EngineeringIcon, EngineeringIconName} from "../assets/icons/EngineeringIcons";
import {SceneDefinition} from "../data/timeline";
import {theme} from "../styles/theme";
import {clamp, fadeIn, sequenceOpacity} from "../utils/animation";
import {Pill, SceneFrame} from "./SceneFrame";

type Props = {
  scene: SceneDefinition;
  durationFrames: number;
};

type ProblemItem = {
  label: string;
  detail: string;
  icon: EngineeringIconName;
  tone: string;
};

const items: ProblemItem[] = [
  {label: "Which skill?", detail: "requirements, design, plan", icon: "worker", tone: theme.colors.accent},
  {label: "Which artifact?", detail: "durable or local-only evidence", icon: "document", tone: theme.colors.violet},
  {label: "Stop here?", detail: "approval and clarification boundaries", icon: "approval", tone: theme.colors.gold},
  {label: "Gate ready?", detail: "red Jest, drift, Playwright", icon: "gate", tone: theme.colors.red},
];

export const ProblemScene = ({scene, durationFrames}: Props) => {
  const frame = useCurrentFrame();
  const knot = interpolate(frame, [30, 130], [0, 1], clamp);

  return (
    <SceneFrame
      scene={scene}
      durationFrames={durationFrames}
      eyebrow="The adoption problem"
      title="Manual SDD asks engineers to remember the workflow."
      subtitle="The value is real, but the day-to-day path is too easy to skip, blur, or reconstruct from memory."
    >
      <svg
        width="980"
        height="640"
        viewBox="0 0 980 640"
        style={{position: "absolute", right: 70, top: 300}}
      >
        <path
          d="M118 330 C290 80 420 540 575 260 S742 109 866 330"
          fill="none"
          stroke={theme.colors.lineStrong}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray="1200"
          strokeDashoffset={1200 * (1 - knot)}
        />
        <path
          d="M106 222 C324 552 468 84 618 390 S798 494 870 202"
          fill="none"
          stroke={theme.colors.lineStrong}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="1200"
          strokeDashoffset={1200 * (1 - knot)}
          opacity="0.7"
        />
      </svg>

      <div
        style={{
          position: "absolute",
          right: 112,
          top: 296,
          width: 900,
          height: 590,
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 28,
        }}
      >
        {items.map((item, index) => {
          const opacity = sequenceOpacity(frame - 36, index, 15);
          const lift = interpolate(opacity, [0, 1], [26, 0], clamp);
          return (
            <div
              key={item.label}
              style={{
                opacity,
                transform: `translateY(${lift}px)`,
                background: "rgba(255,255,255,0.86)",
                border: `2px solid ${item.tone}`,
                borderRadius: theme.radius.lg,
                padding: 30,
                boxShadow: theme.shadow.soft,
              }}
            >
              <EngineeringIcon name={item.icon} stroke={item.tone} size={66} />
              <div style={{...theme.typography.h2, fontSize: 34, marginTop: 24}}>
                {item.label}
              </div>
              <div style={{...theme.typography.small, color: theme.colors.muted, marginTop: 12}}>
                {item.detail}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{position: "absolute", left: 100, bottom: 114, opacity: fadeIn(frame, 160, 24)}}>
        <Pill tone="red">Friction turns process into tribal knowledge</Pill>
      </div>
    </SceneFrame>
  );
};
