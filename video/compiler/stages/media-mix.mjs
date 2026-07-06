import {runAiOrFallback} from "./ai-stage.mjs";
import {hashValue} from "../utils.mjs";

const mediaTypeForRole = {
  "emotional-hook": "kinetic-text",
  "kinetic-title": "kinetic-text",
  "source-document-closeup": "source-excerpt",
  "workflow-wide": "workflow-animation",
  "diagram-build": "diagram",
  "product-ui-proof": "ui-mockup",
  "terminal-demo": "terminal",
  "callout-insert": "icon-card",
  comparison: "ui-mockup",
  "transition-bridge": "transition",
  "summary-payoff": "transition",
  "metaphor-visual": "metaphor-visual",
};

const assetNeedsForMedia = {
  "source-excerpt": ["source excerpt closeup", "highlight overlay"],
  "ui-mockup": ["browser frame", "status panel", "cursor/callout"],
  terminal: ["terminal frame", "typed command", "output reveal"],
  "workflow-animation": ["workflow nodes", "path draw", "evidence trail"],
  diagram: ["diagram nodes", "connector paths", "highlight groups"],
  "metaphor-visual": ["metaphor visual", "motion accent"],
  "kinetic-text": ["kinetic text", "text transition"],
  "icon-card": ["icon card", "callout highlight"],
  transition: ["transition bridge", "background motif"],
};

const rationaleForMedia = {
  "source-excerpt": "Ground the edit in source-document evidence instead of abstract slides.",
  "ui-mockup": "Show a product or workflow proof moment as a first-class shot.",
  terminal: "Separate command-line proof from workflow explanation.",
  "workflow-animation": "Show the lifecycle or process at a wide, readable level.",
  diagram: "Build the mechanism progressively.",
  "metaphor-visual": "Make an abstract concept concrete with a visual metaphor.",
  "kinetic-text": "Use brief text emphasis without turning the scene into a slide.",
  "icon-card": "Clarify one point with a fast insert.",
  transition: "Bridge ideas with an editorial transition shot.",
};

const mediaTypes = [
  "source-excerpt",
  "ui-mockup",
  "terminal",
  "workflow-animation",
  "diagram",
  "metaphor-visual",
  "kinetic-text",
  "icon-card",
  "transition",
];

const countBy = (items, keyFor) =>
  items.reduce((counts, item) => {
    const key = keyFor(item);
    counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {});

const targetMixForAssignments = (assignments) => {
  const counts = countBy(assignments, (assignment) => assignment.mediaType);
  return Object.fromEntries(
    mediaTypes.map((mediaType) => [
      mediaType,
      Number(((counts[mediaType] ?? 0) / Math.max(1, assignments.length)).toFixed(3)),
    ]),
  );
};

export const planMediaMix = async ({semanticDocument, shotPlan, storyPlan, visualPlan}, {aiClient} = {}) =>
  runAiOrFallback({
    stageName: "media",
    artifactName: "mediaMix",
    input: {semanticDocument, shotPlan, storyPlan, visualPlan},
    aiClient,
    fallback: async () => {
      const assignments = shotPlan.shots.map((shot) => {
        const mediaType = mediaTypeForRole[shot.shotRole] ?? "diagram";
        return {
          shotId: shot.shotId,
          sceneId: shot.sceneId,
          mediaType,
          assetNeeds: assetNeedsForMedia[mediaType] ?? ["shot visual"],
          rationale: rationaleForMedia[mediaType] ?? "Keep media varied across the edit.",
        };
      });

      const counts = countBy(assignments, (assignment) => assignment.mediaType);
      const warnings = Object.entries(counts)
        .filter(([, count]) => count / Math.max(1, assignments.length) > 0.4)
        .map(([mediaType, count]) => `${mediaType} appears in ${count}/${assignments.length} shots.`);

      return {
        kind: "MediaMixPlan",
        version: "1.0.0",
        sourceHash: hashValue({semanticDocument, shotPlan, storyPlan, visualPlan}),
        documentSlug: shotPlan.documentSlug,
        targetMix: targetMixForAssignments(assignments),
        assignments,
        warnings,
      };
    },
  });
