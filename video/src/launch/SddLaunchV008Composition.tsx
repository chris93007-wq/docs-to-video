import {AbsoluteFill, Audio, Sequence, staticFile} from "remotion";
import {SddShowcaseComposition} from "../renderers/remotion/showcases/sdd-orchestrator/SddShowcaseComposition";
import manifest from "./sdd-orchestrator-launch-v008.json";

export const SDD_LAUNCH_V008_FPS = manifest.fps;
export const SDD_LAUNCH_V008_WIDTH = manifest.width;
export const SDD_LAUNCH_V008_HEIGHT = manifest.height;
export const SDD_LAUNCH_V008_DURATION_FRAMES = Math.round(
  manifest.totalDurationSeconds * manifest.fps,
);

export const SddLaunchV008Composition = () => (
  <AbsoluteFill style={{background: "#F4F7FB"}}>
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
  </AbsoluteFill>
);

