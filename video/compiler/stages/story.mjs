import {runAiOrFallback} from "./ai-stage.mjs";
import {goldenExperienceProfile} from "../experience/goldenExperienceProfile.mjs";
import {hashValue} from "../utils.mjs";

const conceptNames = (semantic) => semantic.concepts.map((concept) => concept.name);

const scene = ({
  id,
  arcRole,
  title,
  purpose,
  teachingPoint,
  learningObjectives,
  sourceConceptIds,
  importance,
  durationSeconds,
}) => ({
  id,
  arcRole,
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
    input: {semanticDocument, experienceProfile: goldenExperienceProfile},
    aiClient,
    fallback: async () => {
      const concepts = semanticDocument.concepts;
      const names = conceptNames(semanticDocument);
      const primaryConceptIds = concepts.slice(0, 7).map((concept) => concept.id);
      const firstConcept = semanticDocument.title || names[0] || "the system";
      const workflow = semanticDocument.workflows[0];

      const scenes = [
        scene({
          id: "hook",
          arcRole: "hook",
          title: "Specs as the Control Plane",
          purpose: "Open with the core operating idea.",
          teachingPoint: "The spec should control scope, validation, and evidence.",
          learningObjectives: [`Show ${firstConcept} as a practical way to make SDD runnable, not another document.`],
          sourceConceptIds: primaryConceptIds.slice(0, 2),
          importance: 0.94,
          durationSeconds: 12,
        }),
        scene({
          id: "problem",
          arcRole: "problem",
          title: "The manual workflow is fragile",
          purpose: "Show the adoption friction.",
          teachingPoint:
            "Without a coordinator, workflow sequence, approvals, and evidence depend on memory.",
          learningObjectives: ["Make the viewer feel why good intent falls apart under delivery pressure."],
          sourceConceptIds: primaryConceptIds.slice(0, 2),
          importance: 0.9,
          durationSeconds: 16,
        }),
        scene({
          id: "solution",
          arcRole: "solution",
          title: "One stateful run",
          purpose: "Introduce the orchestrator as the usability layer.",
          teachingPoint: "The coordinator owns run state, phase order, approvals, and durable evidence.",
          learningObjectives: ["Show status, blockers, approvals, artifacts, and events as one durable run state."],
          sourceConceptIds: primaryConceptIds.slice(0, 4),
          importance: 0.9,
          durationSeconds: 16,
        }),
        scene({
          id: "developer-experience",
          arcRole: "developer experience",
          title: "Codex coordinates the run",
          purpose: "Make the primary usage mode concrete.",
          teachingPoint: "Engineers start from a Codex prompt, and the coordinator preserves run state across approvals, artifacts, validation, and resume points.",
          learningObjectives: ["Show the prompt-driven workflow before mentioning CLI as secondary support."],
          sourceConceptIds: primaryConceptIds.slice(0, 6),
          importance: 0.84,
          durationSeconds: 16,
        }),
        scene({
          id: "workflow",
          arcRole: "guided walkthrough",
          title: "Canonical phases, visible evidence",
          purpose: "Walk the viewer through the lifecycle.",
          teachingPoint:
            workflow?.description ??
            "Requirements intake, design, implementation planning, TDD unit tests, implementation, Playwright validation, and lifecycle update stay connected.",
          learningObjectives: ["Show the phase order, approval boundaries, evidence registration, and validation gates as one path."],
          sourceConceptIds: [
            ...(workflow ? [workflow.id] : []),
            ...primaryConceptIds.slice(2, 5),
          ],
          importance: 0.86,
          durationSeconds: 24,
        }),
        scene({
          id: "guardrails",
          arcRole: "benefits",
          title: "Guardrails keep evidence connected",
          purpose: "Show traceability, approval, drift, and validation guardrails.",
          teachingPoint:
            "The orchestrator reduces skipped approvals, lost context, implementation drift, missing validation, and ambiguous handoffs.",
          learningObjectives: ["Show scope boundaries, approval checkpoints, drift detection, validation gates, and evidence reconnection."],
          sourceConceptIds: primaryConceptIds.slice(0, 5),
          importance: 0.8,
          durationSeconds: 14,
        }),
        scene({
          id: "conclusion",
          arcRole: "conclusion",
          title: "Try it on the next feature",
          purpose: "Close with adoption and contribution.",
          teachingPoint: `Try ${firstConcept} on the next feature, then improve the workflow, prompts, gates, dashboard, validation, onboarding, and developer experience.`,
          learningObjectives: ["Leave with a clear CTA to try the workflow and contribute improvements."],
          sourceConceptIds: primaryConceptIds.slice(0, 2),
          importance: 0.7,
          durationSeconds: 7,
        }),
      ];

      return {
        kind: "StoryPlan",
        version: "1.0.0",
        sourceHash: hashValue({semanticDocument, experienceProfile: goldenExperienceProfile}),
        narrativeArc: [
          "hook",
          "problem",
          "solution",
          "developer experience",
          "guided walkthrough",
          "guardrails",
          "conclusion",
        ],
        totalDurationSeconds: scenes.reduce((total, item) => total + item.durationSeconds, 0),
        scenes,
      };
    },
  });
