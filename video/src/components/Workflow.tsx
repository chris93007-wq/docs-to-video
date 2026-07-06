import {interpolate, useCurrentFrame} from "remotion";
import {GateDiagram} from "../assets/diagrams/GateDiagram";
import {WorkflowRail} from "../assets/diagrams/WorkflowRail";
import {SceneDefinition} from "../data/timeline";
import {theme} from "../styles/theme";
import {clamp, fadeIn} from "../utils/animation";
import {Pill, SceneFrame} from "./SceneFrame";

type Props = {
  scene: SceneDefinition;
  durationFrames: number;
};

export const WorkflowScene = ({scene, durationFrames}: Props) => {
  const frame = useCurrentFrame();
  const railOpacity = fadeIn(frame, 14, 22);
  const gateOpacity = fadeIn(frame, 230, 26);
  const railShift = interpolate(frame, [216, 250], [0, -100], clamp);

  return (
    <SceneFrame
      scene={scene}
      durationFrames={durationFrames}
      eyebrow="Canonical execution"
      title="Every phase leaves evidence behind."
      subtitle="The next gate reads the run state instead of trusting a story told in the active thread."
    >
      <div
        style={{
          position: "absolute",
          left: 96 + railShift,
          top: 350,
          opacity: railOpacity,
          transform: "scale(0.82)",
          transformOrigin: "left top",
        }}
      >
        <WorkflowRail frame={frame} />
      </div>

      <div
        style={{
          position: "absolute",
          right: 52,
          top: 344,
          opacity: gateOpacity,
          transform: `translateX(${interpolate(gateOpacity, [0, 1], [80, 0], clamp)}px) scale(0.76)`,
          transformOrigin: "right top",
        }}
      >
        <GateDiagram frame={frame - 230} />
      </div>

      <div
        style={{
          position: "absolute",
          left: 96,
          bottom: 168,
          display: "flex",
          gap: 16,
          opacity: fadeIn(frame, 120, 18),
        }}
      >
        <Pill tone="gold">Approvals before implementation</Pill>
        <Pill tone="red">TDD unit tests before product code</Pill>
        <Pill tone="teal">Playwright evidence after implementation</Pill>
      </div>
    </SceneFrame>
  );
};
