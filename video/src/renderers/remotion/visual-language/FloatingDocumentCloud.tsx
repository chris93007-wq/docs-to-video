import {interpolate} from "remotion";
import {BrandMark} from "../../../assets/svg/BrandMark";
import {theme} from "../../../styles/theme";
import {clamp, fadeIn} from "../../../utils/animation";
import {PathDraw} from "./PathDraw";
import {cleanLabel, labelsForScene, primitiveColors, revealAt} from "./shared";
import type {VisualPrimitiveProps} from "./types";

export const FloatingDocumentCloud = ({scene, frame, fps}: VisualPrimitiveProps) => {
  const labels = labelsForScene(scene, 5);

  return (
    <>
      <svg width="1060" height="600" viewBox="0 0 1060 600" style={{position: "absolute", right: 92, top: 292}}>
        {labels.map((_, index) => {
          const x = 120 + (index % 3) * 260;
          const y = 98 + Math.floor(index / 3) * 214 + (index % 2) * 24;
          return (
            <PathDraw
              key={`cloud-path-${index}`}
              d={`M${x + 92} ${y + 50} C${x + 230} ${y - 20}, 520 170, 676 292`}
              frame={frame}
              startFrame={18 + index * 8}
              endFrame={fps * 3.8}
              length={620}
              color={primitiveColors[index % primitiveColors.length]}
              width={3}
              opacity={0.42}
            />
          );
        })}
      </svg>
      {labels.map((label, index) => {
        const reveal = revealAt(frame, fps, index, 0.34);
        const left = 730 + (index % 3) * 214;
        const top = 334 + Math.floor(index / 3) * 168 + (index % 2) * 24;
        const drift = interpolate(frame % 120, [0, 60, 120], [-4, 7, -4], clamp);
        return (
          <div
            key={label}
            style={{
              position: "absolute",
              left,
              top: top + drift,
              width: 178,
              height: 112,
              borderRadius: theme.radius.md,
              background: "rgba(255,255,255,0.92)",
              border: `2px solid ${primitiveColors[index % primitiveColors.length]}`,
              boxShadow: theme.shadow.soft,
              opacity: reveal,
              transform: `rotate(${index % 2 === 0 ? -2 : 2}deg) scale(${interpolate(reveal, [0, 1], [0.88, 1], clamp)})`,
              padding: 18,
              ...theme.typography.small,
              fontWeight: 760,
              color: theme.colors.ink,
            }}
          >
            {cleanLabel(label, 32)}
          </div>
        );
      })}
      <div
        style={{
          position: "absolute",
          right: 236,
          top: 500,
          opacity: fadeIn(frame, fps * 2.4, 24),
          transform: `scale(${interpolate(frame, [fps * 2.4, fps * 3.2], [0.86, 1], clamp)})`,
        }}
      >
        <BrandMark frame={frame} size={250} />
      </div>
    </>
  );
};
