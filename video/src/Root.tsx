import {Composition} from "remotion";
import {
  COMPILER_DURATION_FRAMES,
  COMPILER_FPS,
  COMPILER_HEIGHT,
  COMPILER_WIDTH,
  CompilerVideoComposition,
} from "./compiler/CompilerComposition";
import {SddOrchestratorComposition} from "./Composition";
import {FPS, VIDEO_DURATION_FRAMES, VIDEO_HEIGHT, VIDEO_WIDTH} from "./data/timeline";

export const RemotionRoot = () => (
  <>
    <Composition
      id="SddOrchestratorExplainer"
      component={SddOrchestratorComposition}
      durationInFrames={VIDEO_DURATION_FRAMES}
      fps={FPS}
      width={VIDEO_WIDTH}
      height={VIDEO_HEIGHT}
    />
    <Composition
      id="DocumentationCompilerVideo"
      component={CompilerVideoComposition}
      durationInFrames={COMPILER_DURATION_FRAMES}
      fps={COMPILER_FPS}
      width={COMPILER_WIDTH}
      height={COMPILER_HEIGHT}
    />
  </>
);
