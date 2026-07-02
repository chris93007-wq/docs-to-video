import {runAiOrFallback} from "./ai-stage.mjs";
import {compactText, hashValue, wordCount} from "../utils.mjs";

const trimWords = (text, maxWords) => {
  const words = compactText(text).split(/\s+/).filter(Boolean);
  return words.length <= maxWords ? compactText(text) : `${words.slice(0, maxWords).join(" ")}.`;
};

const expandToTarget = (segments, semanticDocument) => {
  const current = wordCount(segments.map((segment) => segment.text).join(" "));
  if (current >= 220) {
    return segments;
  }

  const extra =
    `The important move is to treat ${semanticDocument.title} as something the audience can reason about, not as a pile of notes. Each scene should lower the cost of understanding: first by naming the problem, then by making the operating model visible, and finally by showing why the new path is easier to repeat.`;

  const last = segments[segments.length - 1];
  return [
    ...segments.slice(0, -1),
    {
      ...last,
      text: `${last.text} ${extra}`,
    },
  ];
};

export const generateNarration = async ({storyPlan, semanticDocument}, {aiClient} = {}) =>
  runAiOrFallback({
    stageName: "narration",
    artifactName: "narration",
    input: {storyPlan, semanticDocument},
    aiClient,
    fallback: async () => {
      let cursor = 0;
      const segments = storyPlan.scenes.map((scene, index) => {
        const startSeconds = cursor;
        cursor += scene.durationSeconds;
        const conceptNames = semanticDocument.concepts
          .filter((concept) => scene.sourceConceptIds.includes(concept.id))
          .map((concept) => concept.name)
          .slice(0, 2);
        const conceptPhrase = conceptNames.length > 0 ? conceptNames.join(" and ") : semanticDocument.title;

        const text = [
          index === 0
            ? `Start with the real tension: ${scene.teachingPoint}`
            : `${scene.title} is where the idea becomes easier to teach.`,
          `The point is not to repeat the document, but to help the viewer understand ${conceptPhrase}.`,
          scene.learningObjectives[0]
            ? scene.learningObjectives[0].replace(/\.$/, ".")
            : "By the end of this moment, the audience should know what matters and why.",
        ].join(" ");

        return {
          sceneId: scene.id,
          startSeconds,
          endSeconds: cursor,
          text: trimWords(text, 55),
        };
      });

      const adjustedSegments = expandToTarget(segments, semanticDocument);
      const fullText = trimWords(adjustedSegments.map((segment) => segment.text).join(" "), 300);

      return {
        kind: "Narration",
        version: "1.0.0",
        sourceHash: hashValue({storyPlan, semanticDocument}),
        targetWordCount: [220, 300],
        wordCount: wordCount(fullText),
        text: fullText,
        segments: adjustedSegments,
      };
    },
  });
