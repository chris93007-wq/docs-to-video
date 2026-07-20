import {AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile} from "remotion";
import {
  PharmacyTaskWorkflowLightShowcase,
  type PharmacyWorkflowLightManifest,
} from "../renderers/remotion/showcases/pharmacy-task-workflow-light";
import generatedManifest from "./pharmacy-task-workflow-v0.2.1.json";

const manifest = generatedManifest as PharmacyWorkflowLightManifest;

export const PHARMACY_WORKFLOW_V021_FPS = manifest.fps;
export const PHARMACY_WORKFLOW_V021_WIDTH = manifest.width;
export const PHARMACY_WORKFLOW_V021_HEIGHT = manifest.height;
export const PHARMACY_WORKFLOW_V021_DURATION_FRAMES = Math.round(
  manifest.totalDurationSeconds * manifest.fps,
);

export const PharmacyTaskWorkflowV021Composition = () => (
  <AbsoluteFill style={{background: "#F1EFED"}}>
    {manifest.narrationAudio.segments.map((segment) => (
      <Sequence
        key={segment.sceneId}
        name={`narration-${segment.sceneId}`}
        from={Math.round(segment.startSeconds * manifest.fps)}
        durationInFrames={Math.max(1, Math.ceil(segment.audioDurationSeconds * manifest.fps))}
      >
        <Audio src={staticFile(segment.staticFile)} volume={0.94} />
      </Sequence>
    ))}

    <PharmacyTaskWorkflowLightShowcase manifest={manifest} />

    <Sequence
      name="oracle-end-slate"
      from={Math.round(manifest.narrativeDurationSeconds * manifest.fps)}
      durationInFrames={Math.round(manifest.endSlate.durationSeconds * manifest.fps)}
    >
      <AbsoluteFill style={{background: "#1E1E1C"}}>
        <OffthreadVideo src={staticFile(manifest.endSlate.staticFile)} muted />
      </AbsoluteFill>
    </Sequence>
  </AbsoluteFill>
);
