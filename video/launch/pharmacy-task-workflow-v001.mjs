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
      "The goal is simple: by the time a pharmacist can click Submit, the task needs to actually be ready, not just look ready. In the legacy architecture, no single piece of code owns that decision. Readiness gets inferred instead, from loading booleans, component state, effects, and independent providers scattered through the component, each updating on its own timeline. That's how a form can appear ready before the original order or medication dispense identifiers have actually arrived, how a failed request can leave a skeleton spinning forever, and how an enabled Submit button can be clicked and just do nothing.",
  },
  {
    id: "new-solution",
    intendedDurationSeconds: 30,
    narration:
      "The fix gives each open task one clear owner for its own lifecycle. A single load state tracks whether that task's data hasn't started, is loading, is ready, is empty, or has failed. The action only turns on once the data has arrived, passed validation, and nothing else is mid-submit. Submitting is tracked as its own separate step, so related values land together, an old request can't overwrite a newer one, and a failure just means Retry, not a dead end. And because each part of the screen only listens for the one signal it actually needs, an update in one place doesn't force everything else to redraw.",
  },
  {
    id: "pickup-proof",
    intendedDurationSeconds: 22,
    narration:
      "Pick Up shows this pattern working in real production code, from pull request nine sixty-six. A dedicated store keeps each patient's data in its own group: the active patient loads right away, and the rest load quietly in the background. The drawer only ever shows a group once it's confirmed ready, double-checks that the patient, action, and prescription actually match before you can proceed, and keeps Submit off until every choice you've made is valid. Close the drawer or switch patients, and any response still in flight is simply thrown away.",
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
