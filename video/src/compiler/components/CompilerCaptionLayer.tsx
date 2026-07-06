import {AbsoluteFill, useCurrentFrame} from "remotion";
import {subtitleBoxStyle, subtitleSafeArea} from "../../styles/subtitles";

type CaptionSegment = {
  sceneId: string;
  startSeconds: number;
  endSeconds: number;
  text: string;
};

const splitCaptionText = (text: string) => {
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((item) => item.trim()).filter(Boolean) ?? [text];
  const chunks: string[] = [];
  const cleanChunk = (chunk: string) => chunk.replace(/^[,;:\s]+/, "").replace(/\s+([,.;:!?])/g, "$1").trim();

  for (const sentence of sentences) {
    const words = sentence.split(/\s+/).filter(Boolean);
    if (words.length <= 18) {
      chunks.push(cleanChunk(sentence));
      continue;
    }
    for (let index = 0; index < words.length; index += 16) {
      chunks.push(cleanChunk(words.slice(index, index + 16).join(" ")));
    }
  }

  return chunks.filter(Boolean);
};

const captionWindows = (segments: CaptionSegment[]) =>
  segments.flatMap((segment) => {
    const chunks = splitCaptionText(segment.text);
    const totalWords = chunks.reduce((total, chunk) => total + chunk.split(/\s+/).filter(Boolean).length, 0);
    const totalDuration = segment.endSeconds - segment.startSeconds;
    let cursor = segment.startSeconds;

    return chunks.map((chunk, index) => {
      const words = chunk.split(/\s+/).filter(Boolean).length;
      const isLast = index === chunks.length - 1;
      const duration = isLast
        ? segment.endSeconds - cursor
        : Math.max(1.8, totalDuration * (words / Math.max(1, totalWords)));
      const startSeconds = cursor;
      const endSeconds = isLast ? segment.endSeconds : Math.min(segment.endSeconds, cursor + duration);
      cursor = endSeconds;
      return {
        sceneId: segment.sceneId,
        startSeconds,
        endSeconds,
        text: chunk,
      };
    });
  });

export const CompilerCaptionLayer = ({
  fps,
  segments,
}: {
  fps: number;
  segments: CaptionSegment[];
}) => {
  const frame = useCurrentFrame();
  const seconds = frame / fps;
  const windows = captionWindows(segments);
  const active = windows.find(
    (segment) => seconds >= segment.startSeconds && seconds <= segment.endSeconds,
  );

  if (!active) {
    return null;
  }

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        zIndex: 20,
        justifyContent: "flex-end",
        alignItems: "center",
        padding: `0 ${subtitleSafeArea.horizontalInset}px ${subtitleSafeArea.bottom}px`,
      }}
    >
      <div
        style={{
          ...subtitleBoxStyle,
          maxWidth: `min(${subtitleSafeArea.maxWidth}px, 100%)`,
        }}
      >
        {active.text}
      </div>
    </AbsoluteFill>
  );
};
