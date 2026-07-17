import {launchPlan as v008Plan} from "./sdd-orchestrator-launch-v008.mjs";

const assetRoot = "demo/sdd-live-v0.8.2";

export const launchPlan = {
  ...v008Plan,
  id: "sdd-orchestrator-launch-v0.8.2",
  version: "v0.8.2",
  brandMode: "oracle-redwood",
  presentationMode: "live-demo-hybrid",
  reuseNarrationFromId: "sdd-orchestrator-launch-v008",
  runtimeSeconds: v008Plan.runtimeSeconds + 6,
  endSlate: {
    staticFile: "brand/oracle/video/Oracle Endslate 2026 Opaque HD.mp4",
    durationSeconds: 6,
    source: "Oracle Brand and Assets Portal / Oracle Endslates 2026 / HD 1920x1080",
    treatment: "Play the official opaque end slate unmodified and muted.",
  },
  sourceTruth: [
    ...v008Plan.sourceTruth,
    "Internal live SDD run for RX-13603, recorded 2026-06-17 through 2026-06-18.",
  ],
  liveDemo: {
    featureKey: "RX-13603",
    provenanceFile: `${assetRoot}/ASSET-SOURCES.md`,
    assets: [
      {
        id: "codex-start",
        kind: "video",
        staticFile: `${assetRoot}/codex-start.mp4`,
        sourceFile: "Screen Recording 2026-06-17 at 7.07.14 PM.mov",
        sourceStartSeconds: 0,
        sourceDurationSeconds: 9.25,
      },
      {
        id: "requirements",
        kind: "image",
        staticFile: `${assetRoot}/requirements.jpg`,
        sourceFile: "Screen Recording 2026-06-17 at 7.15.20 PM.mov",
        sourceStartSeconds: 15,
      },
      {
        id: "approval",
        kind: "image",
        staticFile: `${assetRoot}/approval.jpg`,
        sourceFile: "Screen Recording 2026-06-17 at 7.58.18 PM.mov",
        sourceStartSeconds: 8,
      },
      {
        id: "jest-unit-tests",
        kind: "image",
        staticFile: `${assetRoot}/jest-unit-tests.jpg`,
        sourceFile: "Screen Recording 2026-06-17 at 11.30.08 PM.mov",
        sourceStartSeconds: 18,
      },
      {
        id: "implementation",
        kind: "image",
        staticFile: `${assetRoot}/implementation.jpg`,
        sourceFile: "Screen Recording 2026-06-17 at 11.37.18 PM.mov",
        sourceStartSeconds: 50,
      },
      {
        id: "validation",
        kind: "image",
        staticFile: `${assetRoot}/validation.jpg`,
        sourceFile: "Screen Recording 2026-06-17 at 11.47.40 PM.mov",
        sourceStartSeconds: 22,
      },
      {
        id: "lifecycle-evidence",
        kind: "image",
        staticFile: `${assetRoot}/lifecycle-evidence.jpg`,
        sourceFile: "Screen Recording 2026-06-18 at 12.27.22 AM.mov",
        sourceStartSeconds: 10,
      },
    ],
    developerExperience: {
      assetId: "codex-start",
      revealSeconds: 1.2,
    },
    workflowProofs: [
      {assetId: "requirements", startSeconds: 0.35, endSeconds: 2.95, objectPosition: "center 34%"},
      {assetId: "approval", startSeconds: 2.65, endSeconds: 4.55, objectPosition: "center 58%"},
      {assetId: "jest-unit-tests", startSeconds: 4.3, endSeconds: 6.7, objectPosition: "center 52%"},
      {assetId: "implementation", startSeconds: 6.45, endSeconds: 8.25, objectPosition: "center 50%"},
      {assetId: "validation", startSeconds: 7.95, endSeconds: 10.35, objectPosition: "center 38%"},
      {assetId: "lifecycle-evidence", startSeconds: 10.05, endSeconds: 23.7, objectPosition: "center 54%"},
    ],
  },
  scenes: v008Plan.scenes.map((scene) => {
    if (scene.id === "developer-experience") {
      return {...scene, media: ["source-excerpt", "ui-mockup", "source-excerpt", "callout"]};
    }
    if (scene.id === "workflow") {
      return {...scene, media: ["workflow-animation", "source-excerpt", "source-excerpt", "source-excerpt"]};
    }
    return {...scene};
  }),
};
