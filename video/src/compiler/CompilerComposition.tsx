import {AbsoluteFill, Audio, Sequence, staticFile} from "remotion";
import manifest from "./generated/render-manifest.json";
import {CompilerScene} from "./components/CompilerScene";
import {CompilerShot} from "./components/CompilerShot";
import {CompilerCaptionLayer} from "./components/CompilerCaptionLayer";
import {SddShowcaseComposition} from "../renderers/remotion/showcases/sdd-orchestrator/SddShowcaseComposition";

export const COMPILER_FPS = manifest.fps;
export const COMPILER_WIDTH = manifest.width;
export const COMPILER_HEIGHT = manifest.height;
export const COMPILER_DURATION_FRAMES = Math.ceil(manifest.totalDurationSeconds * manifest.fps);

const typedManifest = manifest as any;

const renderShotSequences = () =>
  [...(typedManifest.shots ?? [])]
    .sort((a: any, b: any) => a.startSeconds - b.startSeconds)
    .map((shot: any) => (
      <Sequence
        key={shot.shotId}
        from={Math.round(shot.startSeconds * manifest.fps)}
        durationInFrames={Math.max(1, Math.round(shot.durationSeconds * manifest.fps))}
      >
        <CompilerShot shot={shot} />
      </Sequence>
    ));

const renderSceneSequences = () =>
  manifest.scenes.map((scene) => (
    <Sequence
      key={scene.id}
      from={Math.round(scene.startSeconds * manifest.fps)}
      durationInFrames={Math.round(scene.durationSeconds * manifest.fps)}
    >
      <CompilerScene scene={scene} fps={manifest.fps} />
    </Sequence>
  ));

export const CompilerVideoComposition = () => {
  const isSddShowcase = typedManifest.showcase === "sdd-orchestrator";
  const hasShotPlan = Array.isArray(typedManifest.shots) && typedManifest.shots.length > 0;

  return (
    <AbsoluteFill>
      <Audio src={staticFile("audio/compiler-narration.wav")} volume={0.9} />
      {isSddShowcase ? <SddShowcaseComposition manifest={typedManifest} /> : hasShotPlan ? renderShotSequences() : renderSceneSequences()}
      {isSddShowcase ? null : (
        <CompilerCaptionLayer
          fps={manifest.fps}
          segments={manifest.narration.segments}
        />
      )}
    </AbsoluteFill>
  );
};
