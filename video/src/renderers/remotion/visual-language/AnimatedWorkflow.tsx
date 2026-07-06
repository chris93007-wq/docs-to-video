import {interpolate} from "remotion";
import {GateDiagram} from "../../../assets/diagrams/GateDiagram";
import {WorkflowRail} from "../../../assets/diagrams/WorkflowRail";
import {theme} from "../../../styles/theme";
import {clamp, fadeIn} from "../../../utils/animation";
import {ProgressiveHighlight} from "./ProgressiveHighlight";
import type {VisualPrimitiveProps} from "./types";

export const AnimatedWorkflow = ({scene, frame, fps}: VisualPrimitiveProps) => {
  const railShift = interpolate(frame, [fps * 7.2, fps * 8.4], [0, -54], clamp);
  const gateOpacity = fadeIn(frame, fps * 7.6, 24);

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 120 + railShift,
          top: 322,
          opacity: fadeIn(frame, 12, 20),
          transform: "scale(0.82)",
          transformOrigin: "left top",
        }}
      >
        <WorkflowRail frame={frame} />
      </div>
      <div
        style={{
          position: "absolute",
          right: 46,
          top: 328,
          opacity: gateOpacity,
          transform: `translateX(${interpolate(gateOpacity, [0, 1], [92, 0], clamp)}px) scale(0.75)`,
          transformOrigin: "right top",
        }}
      >
        <GateDiagram frame={frame - fps * 7.6} />
      </div>
      <ProgressiveHighlight
        labels={scene.animation?.focus ?? scene.visual.emphasis}
        frame={frame - fps * 3.8}
        fps={fps}
        x={96}
        y={810}
        width={1240}
      />
      <div
        style={{
          position: "absolute",
          right: 104,
          bottom: 128,
          ...theme.typography.small,
          color: theme.colors.muted,
          opacity: fadeIn(frame, fps * 8.4, 18),
        }}
      >
        evidence before trust
      </div>
    </>
  );
};
