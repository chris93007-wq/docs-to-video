import { readFileSync } from "node:fs";

const content = JSON.parse(
  readFileSync(
    new URL("../content/tdd-jest-validation-v001.json", import.meta.url),
    "utf8",
  ),
);

const { project, scenes: sceneCopy } = content;

const sceneBlueprints = [
  {
    id: "introduction",
    durationSeconds: 5,
    visualPrimitive: "TddTitleIntroduction",
    media: ["kinetic-title", "validation-gate", "transition"],
    performanceSegments: [
      {
        text: "Meet the TDD Jest Validation Gate.",
        pauseAfterMs: 50,
      },
    ],
  },
  {
    id: "problem-hook",
    durationSeconds: 17,
    visualPrimitive: "EvidenceConvergence",
    media: ["kinetic-text", "node-graph", "terminal", "validation-gate"],
    performanceSegments: [
      {
        text: "Here's the code-first risk: Codex writes the change, then tests its own output.",
        pauseAfterMs: 180,
      },
      {
        text: "Those tests can pass while simply mirroring the implementation.",
        pauseAfterMs: 180,
      },
      {
        text: "TDD flips it: requirement-backed tests define the boundary and drive code. Unmapped implementation surfaces as drift or a potential gap.",
        pauseAfterMs: 0,
      },
    ],
  },
  {
    id: "sdd-fit",
    durationSeconds: 14,
    visualPrimitive: "SddLifecycleRail",
    media: ["workflow-animation", "diagram", "callout", "transition"],
    performanceSegments: [
      {
        text: "SDD phase four sits between reviewed planning and product code.",
        pauseAfterMs: 260,
      },
      {
        text: "Engineers and Codex stay inside the boundary.",
        pauseAfterMs: 240,
      },
      {
        text: "After implementation, Playwright tests browser journeys. It complements, not replaces, Jest.",
        pauseAfterMs: 0,
      },
    ],
  },
  {
    id: "capabilities",
    durationSeconds: 17,
    visualPrimitive: "ComposedValidationGate",
    media: ["artifact-flow", "code-closeup", "validation-gate", "callout"],
    performanceSegments: [
      {
        text: "The skill turns intent into auditable evidence.",
        pauseAfterMs: 240,
      },
      {
        text: "It maps requirement and acceptance IDs to Jest specs, ties specs to source paths, and records the baseline.",
        pauseAfterMs: 300,
      },
      {
        text: "It detects implementation drift and weakened tests, combining traceability, test integrity, and feature readiness in one gate.",
        pauseAfterMs: 0,
      },
    ],
  },
  {
    id: "getting-started",
    durationSeconds: 20,
    visualPrimitive: "InputApprovalGate",
    media: [
      "source-excerpt",
      "artifact-cards",
      "repo-pattern",
      "approval-gate",
    ],
    performanceSegments: [
      {
        text: "Begin with product-approved requirements committed to the repo.",
        pauseAfterMs: 260,
      },
      {
        text: "Ask the TDD phase to prepare the Unit Test Target Plan, mapping units to source paths, specs, and assertions.",
        pauseAfterMs: 300,
      },
      {
        text: "Review and approve the plan, then one representative failing spec.",
        pauseAfterMs: 280,
      },
      {
        text: "Generate the planned suite, capture the red-phase baseline, and run the gate before changing product code.",
        pauseAfterMs: 0,
      },
    ],
  },
  {
    id: "red-green-refactor",
    durationSeconds: 34,
    visualPrimitive: "TddCycle",
    media: ["demo-still", "demo-still", "demo-still", "validation-gate"],
    performanceSegments: [
      {
        text: "This is where engineers and Codex spend most of their time together.",
        pauseAfterMs: 240,
      },
      {
        text: "Choose one planned behavior. Red: write its requirement-backed test and confirm the expected failure.",
        pauseAfterMs: 280,
      },
      {
        text: "Green: make the smallest change that gets it—and earlier tests—passing.",
        pauseAfterMs: 280,
      },
      {
        text: "Green is a checkpoint, not proof that the feature is PR-ready.",
        pauseAfterMs: 240,
      },
      {
        text: "Run the feature locally and explore behavior, UX, and edge cases.",
        pauseAfterMs: 260,
      },
      {
        text: "For a unit-testable change already in approved scope, update Jest first, confirm red, then change the code.",
        pauseAfterMs: 280,
      },
      {
        text: "New behavior outside that boundary becomes a potential gap for review.",
        pauseAfterMs: 240,
      },
      {
        text: "Refactor while green; repeat until the slice is ready.",
        pauseAfterMs: 0,
      },
    ],
  },
  {
    id: "dashboard",
    durationSeconds: 18,
    visualPrimitive: "DashboardDecisionSurface",
    media: ["dashboard-crop", "dashboard-crop", "dashboard-crop", "callout"],
    performanceSegments: [
      {
        text: "The dashboard turns the audit into decisions.",
        pauseAfterMs: 240,
      },
      {
        text: "What blocks the gate? Which requirements have evidence? Which tests need mappings?",
        pauseAfterMs: 260,
      },
      {
        text: "Are the plan and baseline present? Were tests deleted or weakened?",
        pauseAfterMs: 260,
      },
      { text: "Which potential gaps need review?", pauseAfterMs: 240 },
      {
        text: "The numbers change; these questions remain useful.",
        pauseAfterMs: 0,
      },
    ],
  },
  {
    id: "usage-cta",
    durationSeconds: 18,
    visualPrimitive: "UsageTabsCta",
    media: ["terminal", "terminal", "terminal", "kinetic-text"],
    performanceSegments: [
      {
        text: "Use it in Codex, from the CLI, or through SDD Orchestrator, with human approval at key checkpoints.",
        pauseAfterMs: 280,
      },
      {
        text: "Try it on your next feature, evaluate the evidence, and stress-test the guardrails.",
        pauseAfterMs: 260,
      },
      {
        text: "Then contribute prompts, checks, tests, and dashboard metrics for the next engineer.",
        pauseAfterMs: 0,
      },
    ],
  },
];

const scenes = sceneBlueprints.map((blueprint) => {
  const copy = sceneCopy[blueprint.id];
  if (!copy) {
    throw new Error(
      `Missing editable content for TDD Jest scene ${blueprint.id}.`,
    );
  }

  return {
    ...blueprint,
    title: copy.title,
    purpose: copy.purpose,
    teachingPoint: copy.teachingPoint,
    cues: copy.cues,
    narration: blueprint.performanceSegments
      .map((segment) => segment.text)
      .join(" "),
  };
});

export const launchPlan = {
  id: "tdd-jest-validation-v001",
  version: "v001",
  showcase: "tdd-jest-validation",
  title: project.title,
  runtimeSeconds: 149,
  fps: 30,
  width: 1920,
  height: 1080,
  audience: project.audience,
  genre: project.genre,
  primaryCta: project.primaryCta,
  contributionCta: project.contributionCta,
  positioning: project.positioning,
  sourceTruth: project.sourceTruth,
  brandMode: "oracle-redwood-dark",
  narrationWordRange: { min: 340, max: 370 },
  voiceDirection:
    "Warm, conversational presenter speaking engineer to engineer. Natural phrasing, clear transitions, and grounded technical precision; never salesy or theatrical.",
  validationProfile: "tdd-jest-validation-engineer-explainer-v001",
  content,
  endSlate: {
    staticFile: "brand/oracle/video/Oracle Endslate 2026 Opaque HD.mp4",
    durationSeconds: 6,
    source:
      "Oracle Brand and Assets Portal / Oracle Endslates 2026 / HD 1920x1080",
    treatment: "Play the official opaque end slate unmodified and muted.",
  },
  scenes,
};
