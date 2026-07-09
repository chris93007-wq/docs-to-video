import {AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile} from "remotion";
import {
  TddJestValidationShowcase,
  type TddJestManifest,
} from "../renderers/remotion/showcases/tdd-jest-validation";
import generatedManifest from "./tdd-jest-validation-v001.json";

const manifest = generatedManifest as TddJestManifest;

export const TDD_JEST_V001_FPS = manifest.fps;
export const TDD_JEST_V001_WIDTH = manifest.width;
export const TDD_JEST_V001_HEIGHT = manifest.height;
export const TDD_JEST_V001_DURATION_FRAMES = Math.round(
  manifest.totalDurationSeconds * manifest.fps,
);

const narrativeDurationSeconds =
  manifest.totalDurationSeconds - manifest.endSlate.durationSeconds;

export const TddJestValidationV001Composition = () => (
  <AbsoluteFill style={{background: "#101210"}}>
    {manifest.narrationAudio.segments.map((segment) => (
      <Sequence
        key={segment.sceneId}
        name={`narration-${segment.sceneId}`}
        from={Math.round(segment.startSeconds * manifest.fps)}
        durationInFrames={Math.max(
          1,
          Math.ceil(segment.audioDurationSeconds * manifest.fps),
        )}
      >
        <Audio src={staticFile(segment.staticFile)} volume={0.94} />
      </Sequence>
    ))}

    <TddJestValidationShowcase manifest={manifest} />

    <Sequence
      name="oracle-end-slate"
      from={Math.round(narrativeDurationSeconds * manifest.fps)}
      durationInFrames={Math.round(manifest.endSlate.durationSeconds * manifest.fps)}
    >
      <AbsoluteFill style={{background: "#1E1E1C"}}>
        <OffthreadVideo src={staticFile(manifest.endSlate.staticFile)} muted />
      </AbsoluteFill>
    </Sequence>
  </AbsoluteFill>
);
