import {AbsoluteFill, Audio, Sequence, staticFile} from "remotion";
import {captions} from "./captions/captions";
import {BenefitsScene} from "./components/Benefits";
import {CaptionLayer} from "./components/CaptionLayer";
import {DemoScene} from "./components/Demo";
import {IntroScene} from "./components/Intro";
import {OutroScene} from "./components/Outro";
import {ProblemScene} from "./components/Problem";
import {SolutionScene} from "./components/Solution";
import {WorkflowScene} from "./components/Workflow";
import {SceneDefinition, scenes} from "./data/timeline";
import {narrationAudioFile} from "./narration/narration";

const renderScene = (scene: SceneDefinition) => {
  const props = {scene, durationFrames: scene.durationFrames};

  switch (scene.key) {
    case "intro":
      return <IntroScene {...props} />;
    case "problem":
      return <ProblemScene {...props} />;
    case "solution":
      return <SolutionScene {...props} />;
    case "workflow":
      return <WorkflowScene {...props} />;
    case "demo":
      return <DemoScene {...props} />;
    case "benefits":
      return <BenefitsScene {...props} />;
    case "outro":
      return <OutroScene {...props} />;
    default:
      return null;
  }
};

export const SddOrchestratorComposition = () => (
  <AbsoluteFill>
    <Audio src={staticFile(narrationAudioFile)} volume={0.9} />
    {scenes.map((scene) => (
      <Sequence
        key={scene.key}
        from={scene.startFrame}
        durationInFrames={scene.durationFrames}
      >
        {renderScene(scene)}
      </Sequence>
    ))}
    <CaptionLayer captions={captions} />
  </AbsoluteFill>
);
