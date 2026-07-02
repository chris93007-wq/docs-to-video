import {AbsoluteFill, Audio, Sequence, staticFile} from "remotion";
import manifest from "./generated/render-manifest.json";
import {CompilerScene} from "./components/CompilerScene";
import {CompilerCaptionLayer} from "./components/CompilerCaptionLayer";

export const COMPILER_FPS = manifest.fps;
export const COMPILER_WIDTH = manifest.width;
export const COMPILER_HEIGHT = manifest.height;
export const COMPILER_DURATION_FRAMES = Math.ceil(manifest.totalDurationSeconds * manifest.fps);

export const CompilerVideoComposition = () => (
  <AbsoluteFill>
    <Audio src={staticFile("audio/compiler-narration.wav")} volume={0.9} />
    {manifest.scenes.map((scene) => (
      <Sequence
        key={scene.id}
        from={Math.round(scene.startSeconds * manifest.fps)}
        durationInFrames={Math.round(scene.durationSeconds * manifest.fps)}
      >
        <CompilerScene scene={scene} fps={manifest.fps} />
      </Sequence>
    ))}
    <CompilerCaptionLayer
      fps={manifest.fps}
      segments={manifest.narration.segments}
    />
  </AbsoluteFill>
);
