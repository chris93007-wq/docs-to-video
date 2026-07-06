import {interpolate} from "remotion";
import {EngineeringIcon} from "../../../assets/icons/EngineeringIcons";
import {theme} from "../../../styles/theme";
import {clamp} from "../../../utils/animation";
import {cleanLabel, iconForIndex, labelsForScene, primitiveColors, revealAt} from "./shared";
import type {VisualPrimitiveProps} from "./types";

export const MorphingCardStack = ({scene, frame, fps}: VisualPrimitiveProps) => {
  const labels = labelsForScene(scene, 5);

  return (
    <div style={{position: "absolute", right: 150, top: 326, width: 820, height: 560}}>
      {labels.map((label, index) => {
        const reveal = revealAt(frame, fps, index, 0.38);
        const spread = interpolate(frame, [fps * 2.6, fps * 5.2], [0, 1], clamp);
        const color = primitiveColors[index % primitiveColors.length];
        return (
          <div
            key={label}
            style={{
              position: "absolute",
              left: interpolate(spread, [0, 1], [240 + index * 14, (index % 2) * 360 + 60], clamp),
              top: interpolate(spread, [0, 1], [160 + index * 12, Math.floor(index / 2) * 160 + 20], clamp),
              width: 310,
              height: 126,
              borderRadius: theme.radius.lg,
              background: "rgba(255,255,255,0.92)",
              border: `2px solid ${color}`,
              boxShadow: theme.shadow.soft,
              padding: 22,
              opacity: reveal,
              transform: `rotate(${interpolate(spread, [0, 1], [index * -3, 0], clamp)}deg) scale(${interpolate(reveal, [0, 1], [0.9, 1], clamp)})`,
              display: "flex",
              gap: 16,
              alignItems: "center",
            }}
          >
            <EngineeringIcon name={iconForIndex(index)} stroke={color} size={44} />
            <div style={{...theme.typography.small, color: theme.colors.ink, fontWeight: 760}}>
              {cleanLabel(label, 42)}
            </div>
          </div>
        );
      })}
    </div>
  );
};
