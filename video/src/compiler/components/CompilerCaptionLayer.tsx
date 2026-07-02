import {AbsoluteFill, useCurrentFrame} from "remotion";
import {theme} from "../../styles/theme";

type CaptionSegment = {
  sceneId: string;
  startSeconds: number;
  endSeconds: number;
  text: string;
};

export const CompilerCaptionLayer = ({
  fps,
  segments,
}: {
  fps: number;
  segments: CaptionSegment[];
}) => {
  const frame = useCurrentFrame();
  const seconds = frame / fps;
  const active = segments.find(
    (segment) => seconds >= segment.startSeconds && seconds <= segment.endSeconds,
  );

  if (!active) {
    return null;
  }

  return (
    <AbsoluteFill style={{justifyContent: "flex-end", alignItems: "center", paddingBottom: 54}}>
      <div
        style={{
          maxWidth: 1280,
          padding: "18px 28px",
          borderRadius: 8,
          background: "rgba(21, 27, 43, 0.78)",
          color: theme.colors.white,
          ...theme.typography.body,
          fontSize: 32,
          lineHeight: 1.28,
          textAlign: "center",
          boxShadow: "0 18px 52px rgba(21, 27, 43, 0.22)",
        }}
      >
        {active.text}
      </div>
    </AbsoluteFill>
  );
};
