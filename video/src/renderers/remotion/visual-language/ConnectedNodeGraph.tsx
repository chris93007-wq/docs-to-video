import {interpolate} from "remotion";
import {StatefulRunDiagram} from "../../../assets/diagrams/StatefulRunDiagram";
import {theme} from "../../../styles/theme";
import {clamp, fadeIn} from "../../../utils/animation";
import {MiniNode, labelsForScene, primitiveColors, revealAt} from "./shared";
import type {VisualPrimitiveProps} from "./types";

export const ConnectedNodeGraph = ({scene, frame, fps}: VisualPrimitiveProps) => {
  const labels = labelsForScene(scene, 4);

  return (
    <>
      <div
        style={{
          position: "absolute",
          right: 190,
          top: 330,
          opacity: fadeIn(frame, 12, 20),
          transform: `translateY(${interpolate(frame, [12, 44], [26, 0], clamp)}px) scale(1.04)`,
          transformOrigin: "center top",
        }}
      >
        <StatefulRunDiagram frame={frame} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 96,
          bottom: 180,
          display: "grid",
          gridTemplateColumns: "repeat(2, 330px)",
          gap: 18,
        }}
      >
        {labels.map((label, index) => {
          const reveal = revealAt(frame - fps * 2.4, fps, index, 0.4);
          return (
            <MiniNode
              key={label}
              label={label}
              icon={index % 2 === 0 ? "database" : "approval"}
              color={primitiveColors[index % primitiveColors.length]}
              style={{
                opacity: reveal,
                transform: `translateY(${interpolate(reveal, [0, 1], [18, 0], clamp)}px)`,
              }}
            />
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          left: 100,
          top: 438,
          ...theme.typography.label,
          color: theme.colors.teal,
          opacity: fadeIn(frame, fps * 4.2, 18),
        }}
      >
        durable run state
      </div>
    </>
  );
};
