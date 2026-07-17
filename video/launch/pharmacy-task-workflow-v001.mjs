import {readFileSync} from "node:fs";

const content = JSON.parse(
  readFileSync(
    new URL("../content/pharmacy-task-workflow-v001.json", import.meta.url),
    "utf8",
  ),
);

const sceneBlueprints = [
  {
    id: "introduction",
    intendedDurationSeconds: 9,
    narration:
      "This is how Pharmacy UI moves from scattered asynchronous state to authoritative, signal-driven task workflows.",
  },
  {
    id: "legacy-problem",
    intendedDurationSeconds: 28,
    narration:
      "In the legacy architecture, the data needed by one task is spread across loading booleans, component state, effects, context, and independent providers. Each value can update at a different time. That lets the UI observe a half-loaded task: a form can appear ready while the original order or medication dispense identifiers are still missing. Failures can leave an endless skeleton, and an enabled Submit can silently do nothing. The root problem is shared: the lifecycle has no single authoritative owner.",
  },
  {
    id: "new-solution",
    intendedDurationSeconds: 30,
    narration:
      "The new solution gives each open task an instance-scoped workflow store. One atomic Async Load State represents not started, loading, ready, empty, or error. A separate computed readiness signal enables the action only when authoritative data, validation, required fields, and an idle submission state all agree. Submission then has its own lifecycle. Related values commit together, stale requests are ignored, and failures resolve to Retry. Narrow signal subscriptions also keep loading updates local, reducing unnecessary rerenders and layout shift.",
  },
  {
    id: "pickup-proof",
    intendedDurationSeconds: 22,
    narration:
      "Pull request nine sixty-six applies the pattern to Pick Up. A Pick Up Task Workflow Store owns stable per-patient groups. The active group loads atomically; later groups load lazily. The drawer renders only the ready response, verifies the patient, action, anchor prescription, and medication dispense identities, and keeps submission disabled until selections and handoff choices are valid. Closing or replacing the drawer invalidates late results.",
  },
  {
    id: "verify",
    intendedDurationSeconds: 24,
    narration:
      "For Verify, the per-tab Pharmacy Detail store owns action details as one load state. Ready is not the same as actionable. Can Verify turns true only when the authoritative Original Provider Order has arrived, validation is complete, required fields are valid, and submission is idle. An incomplete or failed response becomes a controlled error with Retry, rather than an indefinite skeleton or premature Submit.",
  },
  {
    id: "fill-dispense",
    intendedDurationSeconds: 28,
    narration:
      "Fill and Dispense use the same architecture with one extra data dependency. Action details must be ready before the medication dispense summary loads. Only after both resources are ready does Can Fill evaluate product and scan matching, substitution classification, required fields, and submission state. Missing action or medication dispense identifiers become a visible not-ready or error state, instead of a late click-time guard that silently returns. Submit appears enabled only when the whole workflow is safe.",
  },
  {
    id: "outcomes",
    intendedDurationSeconds: 16,
    narration:
      "The result is one reusable architecture with task-specific business rules: meaningful loading, recoverable errors, no dead clicks, no stale submissions, and fewer visual jumps. The user sees either usable data, clear progress, or a path to recover.",
  },
];

export const launchPlan = {
  id: "pharmacy-task-workflow-v001",
  version: "v001",
  title: content.project.title,
  fps: 30,
  width: 1920,
  height: 1080,
  pauseSeconds: 0.55,
  voice: content.format.voice,
  content,
  endSlate: {
    staticFile: "brand/oracle/video/Oracle Endslate 2026 Opaque HD.mp4",
    durationSeconds: 6,
    treatment: "Play the official opaque Oracle end slate unmodified and muted.",
  },
  scenes: sceneBlueprints.map((scene) => ({
    ...scene,
    ...content.scenes[scene.id],
  })),
};
