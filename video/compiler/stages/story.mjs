import {runAiOrFallback} from "./ai-stage.mjs";
import {firstSentence, hashValue, sentenceCase} from "../utils.mjs";

const conceptNames = (semantic) => semantic.concepts.map((concept) => concept.name);

const evidenceFor = (semantic, index) => {
  const message = semantic.keyMessages[index] ?? semantic.keyMessages[0] ?? semantic.title;
  return firstSentence(message);
};

const scene = ({
  id,
  title,
  purpose,
  teachingPoint,
  learningObjectives,
  sourceConceptIds,
  importance,
  durationSeconds,
}) => ({
  id,
  title,
  purpose,
  teachingPoint,
  learningObjectives,
  sourceConceptIds,
  importance,
  durationSeconds,
});

export const planStory = async (semanticDocument, {aiClient} = {}) =>
  runAiOrFallback({
    stageName: "story",
    artifactName: "story",
    input: semanticDocument,
    aiClient,
    fallback: async () => {
      const concepts = semanticDocument.concepts;
      const names = conceptNames(semanticDocument);
      const primaryConceptIds = concepts.slice(0, 5).map((concept) => concept.id);
      const workflow = semanticDocument.workflows[0];
      const systems = semanticDocument.systems.map((system) => system.name).join(", ");
      const firstConcept = names[0] ?? semanticDocument.title;
      const secondConcept = names[1] ?? "the current workflow";

      const scenes = [
        scene({
          id: "problem",
          title: `Why ${sentenceCase(firstConcept)} Matters`,
          purpose: "Problem",
          teachingPoint: evidenceFor(semanticDocument, 0),
          learningObjectives: [`Recognize the pressure around ${firstConcept}.`],
          sourceConceptIds: primaryConceptIds.slice(0, 2),
          importance: 0.9,
          durationSeconds: 15,
        }),
        scene({
          id: "pain",
          title: "The Hidden Cost",
          purpose: "Pain",
          teachingPoint:
            semanticDocument.lowValueContent[0] ??
            semanticDocument.repetitiveContent[0] ??
            `Without structure, ${secondConcept} becomes hard to explain and repeat.`,
          learningObjectives: ["Understand what breaks down before the solution appears."],
          sourceConceptIds: primaryConceptIds.slice(1, 3),
          importance: 0.82,
          durationSeconds: 14,
        }),
        scene({
          id: "solution",
          title: "The Core Idea",
          purpose: "Solution",
          teachingPoint: evidenceFor(semanticDocument, 1),
          learningObjectives: [`Explain how ${firstConcept} changes the work.`],
          sourceConceptIds: primaryConceptIds.slice(0, 4),
          importance: 0.9,
          durationSeconds: 18,
        }),
        scene({
          id: "workflow",
          title: workflow?.name ?? "How It Works",
          purpose: "Workflow",
          teachingPoint:
            workflow?.description ??
            semanticDocument.lifecycle.slice(0, 4).join(" -> ") ??
            evidenceFor(semanticDocument, 2),
          learningObjectives: ["Follow the operating path from start to finish."],
          sourceConceptIds: [
            ...(workflow ? [workflow.id] : []),
            ...primaryConceptIds.slice(2, 5),
          ],
          importance: 0.86,
          durationSeconds: 24,
        }),
        scene({
          id: "benefits",
          title: "What Changes",
          purpose: "Benefits",
          teachingPoint:
            semanticDocument.keyMessages[2] ??
            `The audience gains a clearer mental model of ${systems || firstConcept}.`,
          learningObjectives: ["Connect the workflow to practical benefits."],
          sourceConceptIds: primaryConceptIds.slice(0, 5),
          importance: 0.78,
          durationSeconds: 14,
        }),
        scene({
          id: "call-to-action",
          title: "What To Do Next",
          purpose: "Call to action",
          teachingPoint:
            semanticDocument.keyMessages[3] ??
            `Use ${firstConcept} as the anchor for the next implementation decision.`,
          learningObjectives: ["Leave with a concrete next step."],
          sourceConceptIds: primaryConceptIds.slice(0, 2),
          importance: 0.7,
          durationSeconds: 10,
        }),
      ];

      return {
        kind: "StoryPlan",
        version: "1.0.0",
        sourceHash: hashValue(semanticDocument),
        narrativeArc: ["Problem", "Pain", "Solution", "Workflow", "Benefits", "Call to action"],
        totalDurationSeconds: scenes.reduce((total, item) => total + item.durationSeconds, 0),
        scenes,
      };
    },
  });
