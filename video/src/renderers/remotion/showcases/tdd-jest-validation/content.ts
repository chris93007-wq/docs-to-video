export const tddContent = {
  intro: {
    eyebrow: "ENGINEERING EXPLAINER",
    title: "TDD Jest Validation Gate",
    promise: "Requirement-backed Jest evidence before product code",
    placement: "The fourth canonical phase in Spec-Driven Development",
    flow: [
      {label: "Reviewed intent", detail: "requirements + plan"},
      {label: "Jest evidence", detail: "runnable proof"},
      {label: "Implementation", detail: "bounded change"},
    ],
  },
  hook: {
    eyebrow: "WHY CHANGE THE WORKFLOW?",
    title: "Which came first: the requirement, or the code?",
    subtitle: "A green Jest run can prove the implementation is internally consistent without proving it is the right implementation.",
    codeFirst: {
      label: "CODE FIRST",
      title: "Tests inherit the implementation",
      steps: [
        {title: "Codex implements", detail: "The code change defines the shape"},
        {title: "Tests follow", detail: "Post-hoc tests mirror what was built"},
        {title: "Jest is green", detail: "Requirement alignment is still unknown"},
      ],
      verdict: "Green does not prove requirement alignment",
    },
    tdd: {
      label: "TDD",
      title: "Requirements bound the implementation",
      steps: [
        {title: "Approved requirements", detail: "Behavior starts from reviewed intent"},
        {title: "Failing Jest test", detail: "Requirement-backed evidence comes first"},
        {title: "Bounded implementation", detail: "Code changes to satisfy that behavior"},
      ],
      verdict: "Intent → evidence → bounded code",
    },
    gap: {
      label: "DRIFT / POTENTIAL GAP",
      detail: "Code without mapped test evidence becomes visible for review.",
    },
  },
  fit: {
    eyebrow: "WHERE IT FITS",
    title: "The evidence gate inside SDD",
    subtitle: "TDD Jest validation turns a reviewed plan into implementation-ready proof.",
    phases: [
      {label: "Requirements", detail: "reviewed"},
      {label: "Design", detail: "reviewed"},
      {label: "Implementation Plan", detail: "reviewed"},
      {label: "Jest gate", detail: "red → green"},
      {label: "Implement", detail: "planned paths"},
      {label: "Playwright", detail: "browser evidence"},
    ],
  },
  capabilities: {
    eyebrow: "WHAT IT DOES",
    title: "One gate. A connected evidence chain.",
    subtitle: "It checks whether the work still matches the intent—not merely whether Jest exits zero.",
    inputs: ["Reviewed requirements", "Unit Test Target Plan"],
    outputs: ["Approved sample spec", "Complete Jest specs", "Baseline evidence"],
    signals: [
      {label: "Traceability", detail: "Requirement → test → source"},
      {label: "Drift detection", detail: "Plan and implementation stay aligned"},
      {label: "Test integrity", detail: "Weakening and deletion stay visible"},
      {label: "Fixed scope", detail: "Only planned paths move"},
      {label: "Readiness", detail: "Blockers before implementation"},
    ],
  },
  gettingStarted: {
    eyebrow: "GETTING STARTED",
    title: "Start with approved intent in the repo",
    subtitle: "The TDD phase turns product-approved requirements into a reviewed test contract before product code changes.",
    journey: [
      {step: "01", title: "Commit requirements", detail: "Product-approved behavior lives in the repository", tone: "gold", icon: "document"},
      {step: "02", title: "Prepare the target plan", detail: "The TDD phase maps requirements to code and Jest specs", tone: "red", icon: "timeline"},
      {step: "03", title: "Review the plan", detail: "Engineer approves mappings, paths, behaviors, and scope", tone: "gold", icon: "approval"},
      {step: "04", title: "Approve one failing spec", detail: "Validate a representative requirement-backed test", tone: "red", icon: "code"},
      {step: "05", title: "Generate the planned suite", detail: "Create the complete reviewed set of Jest specs", tone: "green", icon: "check"},
      {step: "06", title: "Capture red-phase evidence", detail: "Record the baseline and run the pre-implementation gate", tone: "green", icon: "gate"},
    ],
    checkpoint: "Product code starts only after the plan, sample, suite, and red-phase evidence are reviewed.",
  },
  cycle: {
    methodology: {
      eyebrow: "CANONICAL TDD METHOD",
      title: "One behavior at a time",
      subtitle: "Red → Green → Refactor → Repeat",
      repeat: "Repeat with the next behavior",
      sourceLabel: "Methodology: Kent Beck · Martin Fowler",
    },
    phases: [
      {
        id: "red",
        label: "RED",
        kicker: "Write a runnable test",
        detail: "The test fails for the expected reason.",
        behaviors: [
          "Choose one observable behavior",
          "Write a runnable test",
          "Confirm the expected failure",
        ],
      },
      {
        id: "green",
        label: "GREEN",
        kicker: "Write just enough production code",
        detail: "The focused test—and the rest of the suite—passes.",
        behaviors: [
          "Make the smallest code change",
          "Run the focused test",
          "Confirm all tests stay green",
        ],
      },
      {
        id: "refactor",
        label: "REFACTOR",
        kicker: "Improve the structure",
        detail: "Behavior stays unchanged and the tests remain green.",
        behaviors: [
          "Clarify design and remove duplication",
          "Keep observable behavior unchanged",
          "Run the tests again",
        ],
      },
    ],
    validator: {
      eyebrow: "THE ENGINEER + CODEX ITERATION LOOP",
      statement: "Green is a checkpoint—not PR-ready.",
      note: "Refactor under the existing green suite, then repeat until the complete slice is ready.",
      discovery: [
        {label: "Run the local build", detail: "Engineer explores the real feature and UX", icon: "play", tone: "gold"},
        {label: "Observe the behavior", detail: "Defects, edge cases, and UX issues surface", icon: "worker", tone: "red"},
        {label: "Classify before changing", detail: "Choose the right evidence path", icon: "branch", tone: "green"},
      ],
      branches: [
        {
          id: "sample",
          label: "APPROVED SCOPE + UNIT-TESTABLE",
          detail: "Add or update Jest first → confirm red → change code",
          guardrails: ["Jest first", "Confirm red", "Then implement"],
          mediaKey: "redPrompt",
          tone: "green",
        },
        {
          id: "change",
          label: "OUTSIDE APPROVED SCOPE",
          detail: "Surface a potential gap → review before expanding scope",
          guardrails: ["Potential gap", "Review intent", "Approve scope"],
          mediaKey: "greenDiff",
          tone: "red",
        },
        {
          id: "gate",
          label: "BROWSER WORKFLOW",
          detail: "Keep the unit boundary clear → validate later with Playwright",
          guardrails: ["Jest boundary", "Local UX", "Playwright later"],
          mediaKey: "refactorEvidence",
          tone: "gold",
        },
      ],
      evidenceLabel: "ENGINEER + CODEX ITERATION EVIDENCE — NOT PHASE DEFINITIONS",
    },
  },
  dashboard: {
    eyebrow: "THE DASHBOARD",
    title: "Ask the evidence, not the test count",
    subtitle: "A decision surface for engineers and reviewers.",
    questions: [
      "What blocks the gate?",
      "Which requirements have evidence?",
      "Which tests still need mappings?",
      "Are the plan and baseline present?",
      "Were tests weakened or deleted?",
      "Which potential gaps need review?",
    ],
  },
  usage: {
    eyebrow: "USE IT THREE WAYS",
    title: "Meet engineers where they work",
    examples: [
      {
        label: "CODEX",
        title: "Standalone skill",
        lines: [
          "$tdd-jest-validation",
          "Start from the approved requirements in the repo.",
          "Prepare the Unit Test Target Plan within reviewed scope.",
          "Pause for plan and sample approval.",
        ],
      },
      {
        label: "CLI",
        title: "Direct gate run",
        lines: [
          "node skills/tdd-jest-validation/scripts/",
          "run-jest-validation-gate.mjs",
          "--feature <feature-id>",
          "--baseline-file .tmp/tdd-jest/<feature-id>/",
          "red-phase-baseline.json",
        ],
      },
      {
        label: "SDD",
        title: "Orchestrated phase",
        lines: [
          "Continue the SDD workflow.",
          "Run the TDD Jest validation phase",
          "from the approved target plan.",
          "Pause for representative sample approval.",
        ],
      },
    ],
    cta: "Use it. Stress-test it. Improve it.",
    ctaDetail: "Evaluate the evidence—and contribute better prompts, checks, tests, and dashboard metrics.",
  },
} as const;

export type TddContent = typeof tddContent;
