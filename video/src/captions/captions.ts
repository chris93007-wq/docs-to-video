export type Caption = {
  startFrame: number;
  endFrame: number;
  text: string;
};

export const captions: Caption[] = [
  {startFrame: 0, endFrame: 108, text: "Spec-Driven Development works best when the spec becomes the control plane."},
  {startFrame: 108, endFrame: 234, text: "It defines scope, validates work, and keeps evidence connected."},
  {startFrame: 234, endFrame: 390, text: "The spec is not a side document. It is the operating surface."},
  {startFrame: 390, endFrame: 510, text: "Running that model by hand is expensive."},
  {startFrame: 510, endFrame: 660, text: "Engineers must remember skills, artifacts, approvals, red-phase Jest, and final gates."},
  {startFrame: 660, endFrame: 810, text: "Good intent gets held together by memory and thread context."},
  {startFrame: 810, endFrame: 870, text: "That is where adoption gets fragile."},
  {startFrame: 870, endFrame: 990, text: "The SDD orchestrator turns loose steps into one stateful workflow."},
  {startFrame: 990, endFrame: 1140, text: "Start from a Jira key or feature input, and the coordinator creates a run."},
  {startFrame: 1140, endFrame: 1290, text: "The run tracks status, blockers, pending approvals, artifacts, and events."},
  {startFrame: 1290, endFrame: 1350, text: "It stops when a human decision is required."},
  {startFrame: 1350, endFrame: 1530, text: "The canonical path stays visible: intake, design, planning, red-phase Jest."},
  {startFrame: 1530, endFrame: 1710, text: "Then bounded implementation, Playwright requirement validation, and lifecycle update."},
  {startFrame: 1710, endFrame: 1890, text: "Each phase registers evidence before the next gate trusts it."},
  {startFrame: 1890, endFrame: 2070, text: "Fan-out only happens for reviewed, bounded, non-overlapping slices."},
  {startFrame: 2070, endFrame: 2160, text: "Fan-in remains serial, with focused checks after each result."},
  {startFrame: 2160, endFrame: 2310, text: "In Codex, the coordinator registers artifacts, captures approvals, and reports blockers."},
  {startFrame: 2310, endFrame: 2460, text: "It generates red-phase Jest before product code and keeps changes inside plan."},
  {startFrame: 2460, endFrame: 2610, text: "In the CLI, the same runtime supports create, auto-run, status, resume, and gates."},
  {startFrame: 2610, endFrame: 2730, text: "For engineers, the payoff is lower cognitive load."},
  {startFrame: 2730, endFrame: 2880, text: "New adopters get one entry point. Teams get resumable execution and safer parallel work."},
  {startFrame: 2880, endFrame: 2970, text: "Traceability connects Jira and Confluence to tests and final validation."},
  {startFrame: 2970, endFrame: 3060, text: "The orchestrator does not replace SDD discipline."},
  {startFrame: 3060, endFrame: 3150, text: "It makes the discipline runnable, fast, and auditable."},
];
