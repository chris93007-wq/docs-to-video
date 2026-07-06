import {interpolate} from "remotion";
import {EngineeringIcon, EngineeringIconName} from "../../../assets/icons/EngineeringIcons";
import {theme} from "../../../styles/theme";
import {clamp, fadeIn} from "../../../utils/animation";
import {cleanLabel, labelsForScene, primitiveColors, revealAt} from "./shared";
import type {VisualPrimitiveProps} from "./types";

const benefitIcons: EngineeringIconName[] = ["shield", "play", "timeline", "branch", "check"];

export const BenefitCards = ({scene, frame, fps}: VisualPrimitiveProps) => {
  const labels = labelsForScene(scene, 5);

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 96,
          right: 96,
          top: 392,
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 20,
        }}
      >
        {labels.map((label, index) => {
          const reveal = revealAt(frame, fps, index, 0.36);
          const color = primitiveColors[index % primitiveColors.length];
          return (
            <div
              key={label}
              style={{
                minHeight: 304,
                borderRadius: theme.radius.lg,
                background: "rgba(255,255,255,0.9)",
                padding: 26,
                boxShadow: theme.shadow.line,
                opacity: reveal,
                transform: `translateY(${interpolate(reveal, [0, 1], [22, 0], clamp)}px)`,
              }}
            >
              <EngineeringIcon name={benefitIcons[index % benefitIcons.length]} stroke={color} size={64} />
              <div style={{...theme.typography.h2, fontSize: 28, marginTop: 24}}>
                {cleanLabel(label, 24)}
              </div>
              <div style={{...theme.typography.small, color: theme.colors.muted, marginTop: 14}}>
                measurable operating leverage
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          left: 166,
          right: 166,
          bottom: 150,
          height: 146,
          borderRadius: theme.radius.lg,
          background: "rgba(255,255,255,0.74)",
          boxShadow: theme.shadow.soft,
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          alignItems: "center",
          gap: 30,
          padding: "0 46px",
          opacity: fadeIn(frame, fps * 4.4, 20),
        }}
      >
        {[
          ["Cognitive load", 0.28, theme.colors.teal],
          ["Evidence continuity", 0.92, theme.colors.accent],
          ["Parallel safety", 0.82, theme.colors.gold],
        ].map(([label, progress, color]) => {
          const width = interpolate(frame, [fps * 4.8, fps * 6], [0, Number(progress) * 100], clamp);
          return (
            <div key={String(label)}>
              <div style={{...theme.typography.small, color: theme.colors.muted, marginBottom: 10}}>
                {label}
              </div>
              <div style={{height: 8, borderRadius: 99, background: theme.colors.surfaceMuted, overflow: "hidden"}}>
                <div style={{height: "100%", width: `${width}%`, background: String(color), borderRadius: 99}} />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
