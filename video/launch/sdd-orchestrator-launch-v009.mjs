import {launchPlan as v008Plan} from "./sdd-orchestrator-launch-v008.mjs";

export const launchPlan = {
  ...v008Plan,
  id: "sdd-orchestrator-launch-v009",
  version: "v009",
  brandMode: "oracle-redwood",
  reuseNarrationFromId: "sdd-orchestrator-launch-v008",
  runtimeSeconds: v008Plan.runtimeSeconds + 6,
  endSlate: {
    staticFile: "brand/oracle/video/Oracle Endslate 2026 Opaque HD.mp4",
    durationSeconds: 6,
    source: "Oracle Brand and Assets Portal / Oracle Endslates 2026 / HD 1920x1080",
    treatment: "Play the official opaque end slate unmodified and muted.",
  },
  scenes: v008Plan.scenes.map((scene) => ({...scene})),
};

