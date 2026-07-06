import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";
import {Caption} from "../captions/captions";
import {subtitleBoxStyle, subtitleSafeArea} from "../styles/subtitles";
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
          bottom: subtitleSafeArea.bottom,
          left: "50%",
          transform: "translateX(-50%)",
          ...subtitleBoxStyle,
          maxWidth: `min(${subtitleSafeArea.maxWidth}px, calc(100% - ${subtitleSafeArea.horizontalInset * 2}px))`,
          opacity,
        }}
      >
        {caption.text}
      </div>
    </AbsoluteFill>
  );
};
