import {interpolate} from "remotion";
import {EngineeringIcon} from "../../../assets/icons/EngineeringIcons";
import {theme} from "../../../styles/theme";
import {clamp} from "../../../utils/animation";
import {cleanLabel, labelsForScene, primitiveColors, revealAt} from "./shared";
import type {VisualPrimitiveProps} from "./types";

export const ArtifactRegistry = ({scene, frame, fps}: VisualPrimitiveProps) => {
  const labels = labelsForScene(scene, 6);

  return (
    <div
      style={{
        position: "absolute",
        right: 124,
        top: 330,
        width: 900,
        borderRadius: theme.radius.lg,
        background: "rgba(255,255,255,0.9)",
        boxShadow: theme.shadow.soft,
        padding: 28,
      }}
    >
      <div style={{display: "flex", alignItems: "center", gap: 14, marginBottom: 20}}>
        <EngineeringIcon name="database" stroke={theme.colors.teal} size={46} />
        <div>
          <div style={{...theme.typography.label, color: theme.colors.ink}}>artifact registry</div>
          <div style={{...theme.typography.small, color: theme.colors.muted}}>durable evidence, not thread memory</div>
        </div>
      </div>
      <div style={{display: "grid", gap: 12}}>
        {labels.map((label, index) => {
          const reveal = revealAt(frame, fps, index, 0.3);
          const color = primitiveColors[index % primitiveColors.length];
          const progress = interpolate(frame, [fps * (1 + index * 0.22), fps * (2.1 + index * 0.22)], [0, 100], clamp);
          return (
            <div
              key={label}
              style={{
                display: "grid",
                gridTemplateColumns: "44px 1fr 170px",
                gap: 16,
                alignItems: "center",
                minHeight: 62,
                borderRadius: theme.radius.md,
                background: "rgba(248,250,252,0.92)",
                padding: "10px 14px",
                opacity: reveal,
                transform: `translateX(${interpolate(reveal, [0, 1], [26, 0], clamp)}px)`,
              }}
            >
              <EngineeringIcon name={index % 2 === 0 ? "document" : "check"} stroke={color} size={34} />
              <div style={{...theme.typography.small, color: theme.colors.ink, fontWeight: 740}}>
                {cleanLabel(label, 52)}
              </div>
              <div style={{height: 8, borderRadius: 99, background: theme.colors.surfaceMuted, overflow: "hidden"}}>
                <div style={{height: "100%", width: `${progress}%`, background: color, borderRadius: 99}} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
