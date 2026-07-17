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
      {text: "And it's here to make Spec-Driven Development easier for you to run.", pauseAfterMs: 500},
      {text: "You already know the idea behind it is solid —", pauseAfterMs: 650},
      {text: "start with clear intent,", pauseAfterMs: 280},
      {text: "generate the right artifacts,", pauseAfterMs: 280},
      {text: "review the work,", pauseAfterMs: 280},
      {text: "and keep the evidence tied to the feature.", pauseAfterMs: 750},
    ],
  },
  {
    id: "problem",
    durationSeconds: 19,
    visualPrimitive: "MorphingCardStack",
    media: ["metaphor-visual", "source-excerpt", "diagram", "workflow-animation"],
    performanceSegments: [
      {text: "But in practice, it's easy to lose your footing.", pauseAfterMs: 600},
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
      {text: "It's not another skill for you to memorize.", pauseAfterMs: 500},
      {text: "It's the guided path through the skills you already have.", pauseAfterMs: 750},
    ],
  },
  {
    id: "developer-experience",
    durationSeconds: 9.5,
    visualPrimitive: "TerminalSequence",
    media: ["ui-mockup", "terminal", "ui-mockup", "callout"],
    performanceSegments: [
      {text: "Start with a Jira ticket,", pauseAfterMs: 400},
      {text: "ask Codex to run the Orchestrator,", pauseAfterMs: 450},
      {text: "then move through the workflow with it, one step at a time.", pauseAfterMs: 700},
    ],
  },
  {
    id: "workflow",
    durationSeconds: 25,
    visualPrimitive: "AnimatedWorkflow",
    media: ["workflow-animation", "diagram", "ui-mockup", "workflow-animation"],
    performanceSegments: [
      {text: "You move through it all in order —", pauseAfterMs: 320},
      {text: "requirements intake, design, implementation planning,", pauseAfterMs: 320},
      {text: "Jest unit tests, then Playwright validation.", pauseAfterMs: 700},
      {text: "And the whole time, the Orchestrator keeps your run stateful —", pauseAfterMs: 550},
      {text: "it remembers what you've finished,", pauseAfterMs: 420},
      {text: "flags what still needs your review,", pauseAfterMs: 420},
      {text: "and keeps your evidence connected as the feature moves through the lifecycle.", pauseAfterMs: 750},
    ],
  },
  {
    id: "guardrails",
    durationSeconds: 26,
    visualPrimitive: "ValidationGate",
    media: ["metaphor-visual", "diagram", "workflow-animation", "callout"],
    performanceSegments: [
      {text: "If you're an engineer, that means less guesswork,", pauseAfterMs: 450},
      {text: "easier parallel work, and a lot less lost context.", pauseAfterMs: 700},
      {text: "Product managers get clearer traceability back to requirements.", pauseAfterMs: 550},
      {text: "Engineering managers get a visible, repeatable path to adoption.", pauseAfterMs: 600},
      {text: "And all of us get a shared way to keep improving Spec-Driven Development together.", pauseAfterMs: 800},
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
