import {runAiOrFallback} from "./ai-stage.mjs";
import {goldenExperienceProfile} from "../experience/goldenExperienceProfile.mjs";
import {compactText, hashValue, wordCount} from "../utils.mjs";

const trimWords = (text, maxWords) => {
  const words = compactText(text).split(/\s+/).filter(Boolean);
  return words.length <= maxWords ? compactText(text) : `${words.slice(0, maxWords).join(" ")}.`;
};

const normalizeToTarget = (segments, semanticDocument) => {
  const current = wordCount(segments.map((segment) => segment.text).join(" "));
  if (
    current >= goldenExperienceProfile.narration.minWords &&
    current <= goldenExperienceProfile.narration.maxWords
  ) {
    return segments;
  }

  const extra =
    `That matters because ${semanticDocument.title} is not valuable only as written guidance. It becomes valuable when the team can start it, inspect it, trust its gates, and resume it without reconstructing intent from memory.`;

  const last = segments[segments.length - 1];
  const expanded = [
    ...segments.slice(0, -1),
    {
      ...last,
      text: `${last.text} ${extra}`,
    },
  ];

  const expandedText = expanded.map((segment) => segment.text).join(" ");
  if (wordCount(expandedText) <= goldenExperienceProfile.narration.maxWords) {
    return expanded;
  }

  return expanded.map((segment, index) =>
    index === expanded.length - 1
      ? {
          ...segment,
          text: trimWords(segment.text, 42),
        }
      : segment,
  );
};

const conceptPhraseFor = (scene, semanticDocument) => {
  if (["hook", "problem", "solution"].includes(scene.arcRole)) {
    return semanticDocument.title;
  }

  const conceptNames = semanticDocument.concepts
    .filter((concept) => scene.sourceConceptIds.includes(concept.id))
    .map((concept) => concept.name)
    .slice(0, 2);
  return conceptNames.length > 0 ? conceptNames.join(" and ") : semanticDocument.title;
};

const narrationForScene = (scene, semanticDocument) => {
  const conceptPhrase = conceptPhraseFor(scene, semanticDocument);
  const system = semanticDocument.systems[0]?.name ?? semanticDocument.title;

  if (scene.id === "guardrails") {
    return `The orchestrator also guards you against the failures that make SDD hard to adopt — skipped approvals, lost context, implementation drift, missing validation, ambiguous handoffs. Your scope stays tied to reviewed requirements, and your evidence reconnects before the lifecycle update.`;
  }

  switch (scene.arcRole) {
    case "hook":
      return `Spec-Driven Development works best when your spec isn't a document off to the side. It's your control plane: it defines scope, validates the work, and keeps evidence connected.`;
    case "problem":
      return `Before orchestration, your work crosses prompts, artifacts, approvals, tests, and validation. Every handoff asks you to reconstruct what happened, which evidence was registered, and whether the next gate is clear. That's where context and confidence disappear.`;
    case "solution":
      return `The SDD orchestrator turns those loose steps into a stateful workflow you can trust. Start from a Jira key or feature input, and the coordinator creates a run for you — with status, blockers, pending approvals, artifacts, and events. It stops the moment you need to make a call.`;
    case "guided walkthrough":
      return `You can see the canonical path the whole way through: requirements intake, design, implementation planning, Jest unit tests, bounded implementation, then Playwright requirement validation and a lifecycle update. Every phase registers durable evidence, so your next gate checks run state instead of trusting thread context.`;
    case "benefits":
      return `If you're an engineer, that's lower cognitive load and stronger traceability, with one entry point instead of guesswork. Product managers see requirements connected to evidence, and engineering managers get a process that's easier to repeat and inspect.`;
    case "developer experience":
      return `In Codex, you just ask the coordinator to run SDD for your Jira issue — it registers artifacts, captures approvals, creates Jest unit tests before product code, and reports blockers honestly. CLI works the same runtime, but Codex is your guided path in.`;
    case "conclusion":
      return `Try it on your next feature. Start one ${system} run, then help us improve the workflow, prompts, gates, dashboard, validation, onboarding, or developer experience.`;
    default:
      return `${scene.title} makes ${conceptPhrase} concrete for you. You should see the mechanism, understand the boundary, and leave knowing why the workflow is easier to trust.`;
  }
};

export const generateNarration = async ({storyPlan, semanticDocument}, {aiClient} = {}) =>
  runAiOrFallback({
    stageName: "narration",
    artifactName: "narration",
    input: {storyPlan, semanticDocument, experienceProfile: goldenExperienceProfile},
    aiClient,
    fallback: async () => {
      let cursor = 0;
      const segments = storyPlan.scenes.map((scene) => {
        const startSeconds = cursor;
        cursor += scene.durationSeconds;

        return {
          sceneId: scene.id,
          startSeconds,
          endSeconds: cursor,
          text: trimWords(narrationForScene(scene, semanticDocument), 48),
        };
      });

      const adjustedSegments = normalizeToTarget(segments, semanticDocument);
      const fullText = adjustedSegments.map((segment) => compactText(segment.text)).join(" ");

      return {
        kind: "Narration",
        version: "1.0.0",
        sourceHash: hashValue({storyPlan, semanticDocument, experienceProfile: goldenExperienceProfile}),
        targetWordCount: [
          goldenExperienceProfile.narration.minWords,
          goldenExperienceProfile.narration.maxWords,
        ],
        wordCount: wordCount(fullText),
        text: fullText,
        segments: adjustedSegments,
      };
    },
  });
