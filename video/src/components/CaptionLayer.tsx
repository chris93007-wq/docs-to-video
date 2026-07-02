import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";
import {Caption} from "../captions/captions";
import {theme} from "../styles/theme";
import {clamp} from "../utils/animation";

type CaptionLayerProps = {
  captions: Caption[];
};

export const CaptionLayer = ({captions}: CaptionLayerProps) => {
  const frame = useCurrentFrame();
  const caption = captions.find((item) => frame >= item.startFrame && frame < item.endFrame);

  if (!caption) {
    return null;
  }

  const opacity = Math.min(
    interpolate(frame, [caption.startFrame, caption.startFrame + 10], [0, 1], clamp),
    interpolate(frame, [caption.endFrame - 10, caption.endFrame], [1, 0], clamp),
  );

  return (
    <AbsoluteFill style={{pointerEvents: "none", zIndex: 20}}>
      <div
        style={{
          position: "absolute",
          bottom: 54,
          left: "50%",
          transform: "translateX(-50%)",
          maxWidth: 1180,
          padding: "18px 28px",
          borderRadius: theme.radius.md,
          background: "rgba(17, 24, 39, 0.82)",
          color: theme.colors.white,
          fontFamily: theme.typography.family,
          fontSize: 30,
          lineHeight: 1.22,
          fontWeight: 620,
          textAlign: "center",
          boxShadow: "0 18px 60px rgba(17, 24, 39, 0.22)",
          opacity,
        }}
      >
        {caption.text}
      </div>
    </AbsoluteFill>
  );
};
