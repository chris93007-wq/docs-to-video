import {readFileSync} from "node:fs";

const content = JSON.parse(
  readFileSync(
    new URL("../content/sdd-orchestrator-launch-content.json", import.meta.url),
    "utf8",
  ),
);

const {project, scenes: visualScenes} = content;

const sceneBlueprints = [
  {
    id: "hook",
    durationSeconds: 18.5,
    visualPrimitive: "FloatingDocumentCloud",
    media: ["kinetic-text", "metaphor-visual", "diagram", "transition"],
    performanceSegments: [
      {text: "The SDD Orchestrator is live!", pauseAfterMs: 850},
      {text: "And it is here to make Spec-Driven Development easier to use.", pauseAfterMs: 500},
      {text: "The idea behind Spec-Driven Development is strong.", pauseAfterMs: 650},
      {text: "We start with clear intent.", pauseAfterMs: 280},
      {text: "Generate the right artifacts.", pauseAfterMs: 280},
      {text: "Review the work.", pauseAfterMs: 280},
      {text: "Keep evidence tied to the feature.", pauseAfterMs: 750},
    ],
  },
  {
    id: "problem",
    durationSeconds: 19,
    visualPrimitive: "MorphingCardStack",
    media: ["metaphor-visual", "source-excerpt", "diagram", "workflow-animation"],
    performanceSegments: [
      {text: "But in practice, it can be a bit confusing and hard to navigate.", pauseAfterMs: 600},
      ...visualScenes.problem.questions.map((question, index) => ({
        text: question.text,
        pauseAfterMs: [420, 420, 450, 480, 750][index],
      })),
    ],
  },
  {
    id: "solution",
    durationSeconds: 11,
    visualPrimitive: "ConnectedNodeGraph",
    media: ["source-excerpt", "diagram", "ui-mockup", "workflow-animation"],
    performanceSegments: [
      {text: "This is where the SDD Orchestrator comes in.", pauseAfterMs: 750},
      {text: "It is not another skill to memorize.", pauseAfterMs: 500},
      {text: "It is the guided path through the skills we already have.", pauseAfterMs: 750},
    ],
  },
  {
    id: "developer-experience",
    durationSeconds: 9.5,
    visualPrimitive: "TerminalSequence",
    media: ["ui-mockup", "terminal", "ui-mockup", "callout"],
    performanceSegments: [
      {text: "Start with a Jira ticket.", pauseAfterMs: 400},
      {text: "Ask Codex to run the Orchestrator.", pauseAfterMs: 450},
      {text: "Then move through the workflow, one step at a time.", pauseAfterMs: 700},
    ],
  },
  {
    id: "workflow",
    durationSeconds: 25,
    visualPrimitive: "AnimatedWorkflow",
    media: ["workflow-animation", "diagram", "ui-mockup", "workflow-animation"],
    performanceSegments: [
      {text: "Requirements intake.", pauseAfterMs: 320},
      {text: "Design.", pauseAfterMs: 280},
      {text: "Implementation planning.", pauseAfterMs: 320},
      {text: "TDD Jest Unit Tests", pauseAfterMs: 320},
      {text: "Implementation.", pauseAfterMs: 320},
      {text: "Playwright validation.", pauseAfterMs: 700},
      {text: "The Orchestrator keeps the run stateful.", pauseAfterMs: 550},
      {text: "It remembers what steps have been completed.", pauseAfterMs: 420},
      {text: "It shows what still needs review.", pauseAfterMs: 420},
      {text: "And it keeps the evidence connected as the feature moves forward in the SDD lifecycle.", pauseAfterMs: 750},
    ],
  },
  {
    id: "guardrails",
    durationSeconds: 26,
    visualPrimitive: "ValidationGate",
    media: ["metaphor-visual", "diagram", "workflow-animation", "callout"],
    performanceSegments: [
      {text: "For engineers, that means less guess work ", pauseAfterMs: 450},
      {text: "better lifecycle management to enable parallel development.", pauseAfterMs: 450},
      {text: "And less lost context.", pauseAfterMs: 700},
      {text: "For Product Managers, it means clearer traceability back to requirements.", pauseAfterMs: 550},
      {text: "For Engineering Managers, it means a more visible, repeatable path for adoption.", pauseAfterMs: 600},
      {text: "And for everyone, it gives us an entry point to keep improving Spec-Driven Development together.", pauseAfterMs: 800},
    ],
  },
  {
    id: "conclusion",
    durationSeconds: 8,
    visualPrimitive: "BenefitCards",
    media: ["icon-card", "ui-mockup", "kinetic-text", "callout"],
    performanceSegments: [
      {text: project.spokenPrimaryCta, pauseAfterMs: 850},
      {text: project.secondaryCta, pauseAfterMs: 0},
    ],
  },
];

const scenes = sceneBlueprints.map((blueprint) => {
  const visual = visualScenes[blueprint.id];
  return {
    ...blueprint,
    title: visual.title,
    purpose: visual.purpose,
    teachingPoint: visual.teachingPoint,
    cues: visual.cues,
    narration: blueprint.performanceSegments.map((segment) => segment.text).join(" "),
  };
});

export const launchPlan = {
  id: "sdd-orchestrator-launch-v008",
  version: "v008",
  title: project.title,
  runtimeSeconds: 117,
  fps: 30,
  width: 1920,
  height: 1080,
  audience: project.audience,
  primaryCta: project.primaryCta,
  secondaryCta: project.secondaryCta,
  positioning: project.positioning,
  sourceTruth: project.sourceTruth,
  narrationWordRange: {min: 230, max: 270},
  voiceDirection: "Warm, confident internal product narrator. Conversational, never newsreader or sales-demo delivery.",
  scenes,
};
