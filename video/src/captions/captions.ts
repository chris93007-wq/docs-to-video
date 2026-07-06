export type Caption = {
  startFrame: number;
  endFrame: number;
  text: string;
};

export const captions: Caption[] = [
  {startFrame: 0, endFrame: 120, text: "Spec-Driven Development works best when the spec becomes the control plane."},
  {startFrame: 120, endFrame: 264, text: "It defines scope, validates work, and keeps evidence connected."},
  {startFrame: 264, endFrame: 438, text: "The spec is not a side document. It is the operating surface."},
  {startFrame: 438, endFrame: 576, text: "Running that model by hand creates friction."},
  {startFrame: 576, endFrame: 744, text: "Engineers must remember skills, approvals, TDD unit tests, and final gates."},
  {startFrame: 744, endFrame: 912, text: "Good intent gets held together by memory and thread context."},
  {startFrame: 912, endFrame: 978, text: "That is where adoption gets fragile."},
  {startFrame: 978, endFrame: 1110, text: "The SDD orchestrator turns loose steps into one stateful workflow."},
  {startFrame: 1110, endFrame: 1284, text: "Start from a Jira key or feature input, and the coordinator creates a run."},
  {startFrame: 1284, endFrame: 1452, text: "The run tracks status, blockers, pending approvals, artifacts, and events."},
  {startFrame: 1452, endFrame: 1518, text: "It stops when a human decision is required."},
  {startFrame: 1518, endFrame: 1722, text: "The canonical path stays visible: intake, design, planning, and TDD unit tests."},
  {startFrame: 1722, endFrame: 1920, text: "Then bounded implementation, Playwright requirement validation, and lifecycle update."},
  {startFrame: 1920, endFrame: 2124, text: "Each phase registers evidence before the next gate trusts it."},
  {startFrame: 2124, endFrame: 2328, text: "Fan-out only happens for reviewed, bounded, non-overlapping slices."},
  {startFrame: 2328, endFrame: 2430, text: "Fan-in remains serial, with focused checks after each result."},
  {startFrame: 2430, endFrame: 2598, text: "In Codex, the coordinator registers artifacts, captures approvals, and reports blockers."},
  {startFrame: 2598, endFrame: 2766, text: "It creates TDD unit tests before product code and keeps changes inside plan."},
  {startFrame: 2766, endFrame: 2934, text: "In the CLI, the same runtime supports create, auto-run, status, resume, and gates."},
  {startFrame: 2934, endFrame: 3066, text: "For engineers, the payoff is lower cognitive load."},
  {startFrame: 3066, endFrame: 3234, text: "New adopters get one entry point. Teams get resumable execution and safer parallel work."},
  {startFrame: 3234, endFrame: 3336, text: "Traceability connects Jira and Confluence to tests and final validation."},
  {startFrame: 3336, endFrame: 3438, text: "The orchestrator does not replace SDD discipline."},
  {startFrame: 3438, endFrame: 3540, text: "It makes the discipline runnable, calm, and auditable."},
];
