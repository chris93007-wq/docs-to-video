import {Composition} from "remotion";
import {
  COMPILER_DURATION_FRAMES,
  COMPILER_FPS,
  COMPILER_HEIGHT,
  COMPILER_WIDTH,
  CompilerVideoComposition,
} from "./compiler/CompilerComposition";
import {
  SDD_LAUNCH_V008_DURATION_FRAMES,
  SDD_LAUNCH_V008_FPS,
  SDD_LAUNCH_V008_HEIGHT,
  SDD_LAUNCH_V008_WIDTH,
  SddLaunchV008Composition,
} from "./launch/SddLaunchV008Composition";
import {
  SDD_LAUNCH_V009_DURATION_FRAMES,
  SDD_LAUNCH_V009_FPS,
  SDD_LAUNCH_V009_HEIGHT,
  SDD_LAUNCH_V009_WIDTH,
  SddLaunchV009Composition,
} from "./launch/SddLaunchV009Composition";
import {
  SDD_LAUNCH_V082_DURATION_FRAMES,
  SDD_LAUNCH_V082_FPS,
  SDD_LAUNCH_V082_HEIGHT,
  SDD_LAUNCH_V082_WIDTH,
  SddLaunchV082Composition,
} from "./launch/SddLaunchV082Composition";
import {
  TDD_JEST_V001_DURATION_FRAMES,
  TDD_JEST_V001_FPS,
  TDD_JEST_V001_HEIGHT,
  TDD_JEST_V001_WIDTH,
  TddJestValidationV001Composition,
} from "./launch/TddJestValidationV001Composition";

export const RemotionRoot = () => (
  <>
    <Composition
      id="DocumentationCompilerVideo"
      component={CompilerVideoComposition}
      durationInFrames={COMPILER_DURATION_FRAMES}
      fps={COMPILER_FPS}
      width={COMPILER_WIDTH}
      height={COMPILER_HEIGHT}
    />
    <Composition
      id="SddOrchestratorLaunchV008"
      component={SddLaunchV008Composition}
      durationInFrames={SDD_LAUNCH_V008_DURATION_FRAMES}
      fps={SDD_LAUNCH_V008_FPS}
      width={SDD_LAUNCH_V008_WIDTH}
      height={SDD_LAUNCH_V008_HEIGHT}
    />
    <Composition
      id="SddOrchestratorLaunchV009"
      component={SddLaunchV009Composition}
      durationInFrames={SDD_LAUNCH_V009_DURATION_FRAMES}
      fps={SDD_LAUNCH_V009_FPS}
      width={SDD_LAUNCH_V009_WIDTH}
      height={SDD_LAUNCH_V009_HEIGHT}
    />
    <Composition
      id="SddOrchestratorLaunchV082"
      component={SddLaunchV082Composition}
      durationInFrames={SDD_LAUNCH_V082_DURATION_FRAMES}
      fps={SDD_LAUNCH_V082_FPS}
      width={SDD_LAUNCH_V082_WIDTH}
      height={SDD_LAUNCH_V082_HEIGHT}
    />
    <Composition
      id="TddJestValidationExplainerV001"
      component={TddJestValidationV001Composition}
      durationInFrames={TDD_JEST_V001_DURATION_FRAMES}
      fps={TDD_JEST_V001_FPS}
      width={TDD_JEST_V001_WIDTH}
      height={TDD_JEST_V001_HEIGHT}
    />
  </>
);
