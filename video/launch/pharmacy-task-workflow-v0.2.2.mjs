import {readFileSync} from "node:fs";

const content = JSON.parse(
  readFileSync(
    new URL("../content/pharmacy-task-workflow-v0.2.2.json", import.meta.url),
    "utf8",
  ),
);

const sceneBlueprints = [
  {
    id: "big-picture",
    intendedDurationSeconds: 15,
    narration:
      "A Pharmacy screen should never let someone act on it while it's only half loaded. Today, the form can look ready even though the data it actually needs hasn't fully arrived yet. The goal here is simple: make the screen predictable before the user ever clicks.",
  },
  {
    id: "concrete-example",
    intendedDurationSeconds: 22,
    narration:
      "Take Pick Up as it exists today. Prescriptions, the dispense identifiers you've selected, whether things are still loading, even the patient you're working with — all of that lives in its own separate value. And Submit really only asks two things: has loading wrapped up, and have you picked at least one identifier? Both of those can be true before the real task response ever comes back verified, which is exactly how the button ends up looking ready before it actually is.",
  },
  {
    id: "root-cause",
    intendedDurationSeconds: 18,
    narration:
      "This isn't really a signals problem, it's an ownership problem. Several values can each tell the screen a different story at the same time. And when something fails, the screen can just sit there as a skeleton with no way to recover. There's no single place that gets to say whether the task is actually ready.",
  },
  {
    id: "one-owner",
    intendedDurationSeconds: 25,
    narration:
      "The fix is to give the open task a single owner, and that owner boils everything down to three questions. Has the data actually loaded? Is this particular task safe to act on right now? And is something already mid-submit? Loading only ever lands in one of three places: ready, empty, or error, never stuck in between. Related values move together, a late response can't sneak in and overwrite a newer one, and a failure just means Retry. One owner, one answer.",
  },
  {
    id: "verify",
    intendedDurationSeconds: 20,
    narration:
      "Verify can't even render its form until the action details show up. And Submit stays off the table until everything lines up: the Original Provider Order has actually arrived, validation's clean, the required fields hold up, and nothing's mid-submit. If that order fails to load, the pharmacist just gets a clear error and a Retry button, instead of staring at a skeleton that never resolves.",
  },
  {
    id: "fill-dispense",
    intendedDurationSeconds: 22,
    narration:
      "Fill and Dispense work the same way, with one extra step: action details load first, then the medication dispense summary. Only once both of those are in hand does the screen check whether the product and barcode actually match, whether the substitution's been classified, and whether everything else is in order. Miss an action or dispense identifier, and the pharmacist sees a clear not-ready state, not a click that quietly goes nowhere.",
  },
  {
    id: "outcome",
    intendedDurationSeconds: 18,
    narration:
      "None of this is architecture for its own sake. It's a screen that's either loading, ready, or recoverable, and a Submit button that only turns on when it will actually work. This walkthrough follows Christine John's architecture direction, grounded in pull request nine sixty-six and the Pharmacy UI branch diff, with AI assisting on the production.",
  },
];

export const launchPlan = {
  id: "pharmacy-task-workflow-v0.2.2",
  version: "v0.2.2",
  title: content.project.title,
  fps: 30,
  width: 1920,
  height: 1080,
  pauseSeconds: 0.5,
  tailPaddingSeconds: 0.1,
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
