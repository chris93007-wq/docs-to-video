import {interpolate} from "remotion";
import {GateDiagram} from "../../../assets/diagrams/GateDiagram";
import {EngineeringIcon} from "../../../assets/icons/EngineeringIcons";
import {theme} from "../../../styles/theme";
import {clamp, fadeIn} from "../../../utils/animation";
import {labelsForScene, primitiveColors, revealAt} from "./shared";
import type {VisualPrimitiveProps} from "./types";

export const ValidationGate = ({scene, frame, fps}: VisualPrimitiveProps) => {
  const labels = labelsForScene(scene, 4);

  return (
    <>
      <div
        style={{
          position: "absolute",
          right: 118,
          top: 300,
          opacity: fadeIn(frame, 18, 20),
          transform: "scale(0.82)",
          transformOrigin: "right top",
        }}
      >
        <GateDiagram frame={frame - 12} />
      </div>
      <div style={{position: "absolute", left: 100, top: 430, display: "grid", gap: 18}}>
        {labels.map((label, index) => {
          const reveal = revealAt(frame, fps, index, 0.52);
          const color = primitiveColors[index % primitiveColors.length];
          return (
            <div
              key={label}
              style={{
                width: 470,
                minHeight: 84,
                borderRadius: theme.radius.md,
                background: "rgba(255,255,255,0.9)",
                border: `2px solid ${color}`,
                boxShadow: theme.shadow.line,
                padding: "18px 20px",
                display: "flex",
                gap: 16,
                alignItems: "center",
                opacity: reveal,
                transform: `translateX(${interpolate(reveal, [0, 1], [-30, 0], clamp)}px)`,
              }}
            >
              <EngineeringIcon name={index % 2 === 0 ? "check" : "shield"} stroke={color} size={38} />
              <div style={{...theme.typography.small, color: theme.colors.ink, fontWeight: 760}}>
                {label}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
