import {runAiOrFallback} from "./ai-stage.mjs";
import {hashValue} from "../utils.mjs";

const visualByPurpose = {
  Problem: {
    metaphor: "A warning panel showing fragmented inputs converging into confusion",
    visualType: "callout",
    layout: "left narrative rail with right-side evidence fragments",
  },
  Pain: {
    metaphor: "Multiple lanes merging without signals",
    visualType: "lanes",
    layout: "parallel lanes with blocked merge points",
  },
  Solution: {
    metaphor: "A control room coordinating independent systems",
    visualType: "control-room",
    layout: "central controller with connected status panels",
  },
  Workflow: {
    metaphor: "A pipeline with checkpoint gates",
    visualType: "checkpoint-gate",
    layout: "horizontal rail with phase gates and evidence markers",
  },
  Benefits: {
    metaphor: "A connected chain turning scattered work into traceable outcomes",
    visualType: "chain",
    layout: "before-and-after comparison with connected links",
  },
  "Call to action": {
    metaphor: "A forward path from source material to compiled artifact",
    visualType: "timeline",
    layout: "compact timeline ending in a rendered video artifact",
  },
};

const defaultVisual = {
  metaphor: "A structured concept map",
  visualType: "network",
  layout: "centered network with focused callouts",
};

export const directVisuals = async ({storyPlan, semanticDocument}, {aiClient} = {}) =>
  runAiOrFallback({
    stageName: "visual",
    artifactName: "visual",
    input: {storyPlan, semanticDocument},
    aiClient,
    fallback: async () => ({
      kind: "VisualPlan",
      version: "1.0.0",
      sourceHash: hashValue({storyPlan, semanticDocument}),
      scenes: storyPlan.scenes.map((scene) => {
        const visual = visualByPurpose[scene.purpose] ?? defaultVisual;
        return {
          sceneId: scene.id,
          metaphor: visual.metaphor,
          visualType: visual.visualType,
          layout: visual.layout,
          emphasis: [
            scene.teachingPoint,
            ...scene.learningObjectives,
          ].filter(Boolean).slice(0, 3),
          avoid: ["React component instructions", "free-form slides", "dense document excerpts"],
        };
      }),
    }),
  });
