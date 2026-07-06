import type {VisualPrimitiveName} from "../../../compiler/experience/goldenExperienceProfile";
import {AnimatedWorkflow} from "./AnimatedWorkflow";
import {ApprovalGate} from "./ApprovalGate";
import {ArtifactRegistry} from "./ArtifactRegistry";
import {BenefitCards} from "./BenefitCards";
import {CameraRail} from "./CameraRail";
import {ConnectedNodeGraph} from "./ConnectedNodeGraph";
import {DiagramReveal} from "./DiagramReveal";
import {FloatingDocumentCloud} from "./FloatingDocumentCloud";
import {MorphingCardStack} from "./MorphingCardStack";
import {ParallelLanes} from "./ParallelLanes";
import {PathDrawPrimitive} from "./PathDraw";
import {PipelineFlow} from "./PipelineFlow";
import {ProgressiveHighlight} from "./ProgressiveHighlight";
import {SceneTransition} from "./SceneTransition";
import {TerminalSequence} from "./TerminalSequence";
import {TraceabilityChain} from "./TraceabilityChain";
import {ValidationGate} from "./ValidationGate";
import {labelsForScene} from "./shared";
import type {VisualPrimitiveProps} from "./types";

const ProgressiveHighlightPrimitive = ({scene, frame, fps}: VisualPrimitiveProps) => (
  <ProgressiveHighlight labels={labelsForScene(scene, 5)} frame={frame} fps={fps} x={740} y={386} width={760} />
);

const CameraRailPrimitive = (props: VisualPrimitiveProps) => <ConnectedNodeGraph {...props} />;

const SceneTransitionPrimitive = (props: VisualPrimitiveProps) => <TraceabilityChain {...props} />;

export const visualPrimitiveComponents: Record<VisualPrimitiveName, (props: VisualPrimitiveProps) => JSX.Element> = {
  AnimatedWorkflow,
  PipelineFlow,
  TraceabilityChain,
  ApprovalGate,
  ArtifactRegistry,
  ParallelLanes,
  ValidationGate,
  TerminalSequence,
  DiagramReveal,
  BenefitCards,
  FloatingDocumentCloud,
  ConnectedNodeGraph,
  CameraRail: CameraRailPrimitive,
  PathDraw: PathDrawPrimitive,
  ProgressiveHighlight: ProgressiveHighlightPrimitive,
  MorphingCardStack,
  SceneTransition: SceneTransitionPrimitive,
};

export const renderVisualPrimitive = (props: VisualPrimitiveProps) => {
  const primitive = props.scene.visual.visualPrimitive ?? "ConnectedNodeGraph";
  const Component = visualPrimitiveComponents[primitive] ?? ConnectedNodeGraph;
  return <Component {...props} />;
};

export {CameraRail, SceneTransition};
export type {VisualLanguageScene, VisualPrimitiveProps} from "./types";
