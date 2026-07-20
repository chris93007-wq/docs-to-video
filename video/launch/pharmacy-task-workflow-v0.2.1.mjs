import {readFileSync} from "node:fs";

const content = JSON.parse(
  readFileSync(
    new URL("../content/pharmacy-task-workflow-v0.2.1.json", import.meta.url),
    "utf8",
  ),
);

const sceneBlueprints = [
  {
    id: "big-picture",
    intendedDurationSeconds: 15,
    narration:
      "Users should never be able to act on a Pharmacy screen that is only half loaded. Today, the form can look ready while information it still needs is arriving. The goal of this change is simple: make the open screen predictable before the user clicks.",
  },
  {
    id: "concrete-example",
    intendedDurationSeconds: 22,
    narration:
      "Here is the concrete legacy pattern. Pick Up stored prescriptions, selected dispense identifiers, loading, and patient context as separate values. But the Submit rule only asked two questions: is loading false, and is at least one identifier selected? Those can be true before the latest complete task response has been verified, so the button can look ready too early.",
  },
  {
    id: "root-cause",
    intendedDurationSeconds: 18,
    narration:
      "This is not a problem with signals themselves. It is an ownership problem. Several values can tell the screen different stories at the same time. On failure, the screen can also remain a skeleton with no recovery path. There is no single place that can say whether the task is truly ready.",
  },
  {
    id: "one-owner",
    intendedDurationSeconds: 25,
    narration:
      "The new design gives the open task one owner and asks three plain questions. Is the required data loaded? Is this specific task safe to perform? And is a submission already running? Loading has clear outcomes: ready, empty, or error. Related values change together, late responses are ignored, and errors offer Retry. The implementation names are Async Load State, a task workflow store, and a readiness signal. The idea is simply one consistent answer.",
  },
  {
    id: "verify",
    intendedDurationSeconds: 20,
    narration:
      "For Verify, action details must arrive before the form can render. But the button stays disabled until the Original Provider Order is present, validation is complete, required fields are valid, and no submission is running. If the order cannot load, the user gets a clear error and Retry instead of an endless skeleton.",
  },
  {
    id: "fill-dispense",
    intendedDurationSeconds: 22,
    narration:
      "Fill and Dispense need one additional step. Action details load first, then the medication dispense summary. Only after both are ready do we check the product and barcode, substitution, required fields, and submission state. Missing action or dispense identifiers become a visible not-ready state, not a click that silently does nothing.",
  },
  {
    id: "outcome",
    intendedDurationSeconds: 18,
    narration:
      "The result is not more architecture for its own sake. It is a screen that is loading, ready, or recoverable, and a button that is enabled only when it can work. This explanation reflects Christine John's architecture direction and is grounded in pull request nine sixty-six and the Pharmacy UI branch diff. AI assisted with production.",
  },
];

export const launchPlan = {
  id: "pharmacy-task-workflow-v0.2.1",
  version: "v0.2.1",
  title: content.project.title,
  fps: 30,
  width: 1920,
  height: 1080,
  pauseSeconds: 0.5,
  tailPaddingSeconds: 0.4,
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
