import {AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile} from "remotion";
import {
  PharmacyTaskWorkflowShowcase,
  type PharmacyWorkflowManifest,
} from "../renderers/remotion/showcases/pharmacy-task-workflow";
import generatedManifest from "./pharmacy-task-workflow-v001.json";

const manifest = generatedManifest as PharmacyWorkflowManifest;

export const PHARMACY_WORKFLOW_V001_FPS = manifest.fps;
export const PHARMACY_WORKFLOW_V001_WIDTH = manifest.width;
export const PHARMACY_WORKFLOW_V001_HEIGHT = manifest.height;
export const PHARMACY_WORKFLOW_V001_DURATION_FRAMES = Math.round(
  manifest.totalDurationSeconds * manifest.fps,
);

export const PharmacyTaskWorkflowV001Composition = () => (
  <AbsoluteFill style={{background: "#0E100F"}}>
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

    <PharmacyTaskWorkflowShowcase manifest={manifest} />

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
