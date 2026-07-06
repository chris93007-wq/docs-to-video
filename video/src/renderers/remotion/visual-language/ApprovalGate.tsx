import {GateDiagram} from "../../../assets/diagrams/GateDiagram";
import {theme} from "../../../styles/theme";
import {fadeIn} from "../../../utils/animation";
import {ProgressiveHighlight} from "./ProgressiveHighlight";
import type {VisualPrimitiveProps} from "./types";

export const ApprovalGate = ({scene, frame, fps}: VisualPrimitiveProps) => (
  <>
    <div
      style={{
        position: "absolute",
        right: 120,
        top: 288,
        transform: "scale(0.92)",
        transformOrigin: "right top",
        opacity: fadeIn(frame, 14, 20),
      }}
    >
      <GateDiagram frame={frame} />
    </div>
    <ProgressiveHighlight
      labels={scene.animation?.focus ?? scene.visual.emphasis}
      frame={frame - fps * 1.2}
      fps={fps}
      x={104}
      y={604}
      width={520}
    />
    <div
      style={{
        position: "absolute",
        left: 104,
        top: 510,
        ...theme.typography.label,
        color: theme.colors.gold,
        opacity: fadeIn(frame, fps * 4, 18),
      }}
    >
      approval boundary
    </div>
  </>
);
