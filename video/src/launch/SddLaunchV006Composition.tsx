import {AbsoluteFill, Audio, Sequence, staticFile} from "remotion";
import {SddShowcaseComposition} from "../renderers/remotion/showcases/sdd-orchestrator/SddShowcaseComposition";
import manifest from "./sdd-orchestrator-launch-v006.json";

export const SDD_LAUNCH_V006_FPS = manifest.fps;
export const SDD_LAUNCH_V006_WIDTH = manifest.width;
export const SDD_LAUNCH_V006_HEIGHT = manifest.height;
export const SDD_LAUNCH_V006_DURATION_FRAMES = Math.round(
  manifest.totalDurationSeconds * manifest.fps,
);

export const SddLaunchV006Composition = () => (
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

