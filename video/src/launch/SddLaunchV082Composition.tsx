import {AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile} from "remotion";
import {SddShowcaseComposition} from "../renderers/remotion/showcases/sdd-orchestrator/SddShowcaseComposition";
import manifest from "./sdd-orchestrator-launch-v0.8.2.json";

export const SDD_LAUNCH_V082_FPS = manifest.fps;
export const SDD_LAUNCH_V082_WIDTH = manifest.width;
export const SDD_LAUNCH_V082_HEIGHT = manifest.height;
export const SDD_LAUNCH_V082_DURATION_FRAMES = Math.round(
  manifest.totalDurationSeconds * manifest.fps,
);

const endSlate = manifest.endSlate;
const narrativeDurationSeconds = manifest.totalDurationSeconds - endSlate.durationSeconds;

export const SddLaunchV082Composition = () => (
  <AbsoluteFill style={{background: "#F1EFED"}}>
    {manifest.narrationAudio.segments.map((segment) => (
      <Sequence
        key={segment.sceneId}
        from={Math.round(segment.startSeconds * manifest.fps)}
        durationInFrames={Math.max(1, Math.ceil(segment.audioDurationSeconds * manifest.fps))}
      >
        <Audio src={staticFile(segment.staticFile)} volume={0.94} />
      </Sequence>
    ))}
    <SddShowcaseComposition manifest={manifest as any} />
    <Sequence
      from={Math.round(narrativeDurationSeconds * manifest.fps)}
      durationInFrames={Math.round(endSlate.durationSeconds * manifest.fps)}
    >
      <AbsoluteFill style={{background: "#1E1E1C"}}>
        <OffthreadVideo src={staticFile(endSlate.staticFile)} muted />
      </AbsoluteFill>
    </Sequence>
  </AbsoluteFill>
);
