import assert from "node:assert/strict";
import {test} from "node:test";
import {assertValidArtifact, validateWithSchema, artifactSchemas} from "../compiler/schemas.mjs";

test("schema validation accepts valid intermediate artifacts", () => {
  const visual = {
    kind: "VisualPlan",
    version: "1.0.0",
    sourceHash: "hash",
    scenes: [
      {
        sceneId: "workflow",
        metaphor: "Pipeline",
        visualPrimitive: "AnimatedWorkflow",
        visualType: "pipeline",
        layout: "horizontal",
        motionStyle: "railPathDrawAndGateReveal",
        density: "high",
        textDensity: "low",
        camera: "track-left-to-right",
        emphasis: ["phase gates"],
        avoid: ["React code"],
      },
    ],
  };

  assert.equal(assertValidArtifact("visual", visual), visual);
});

test("schema validation rejects malformed stage output early", () => {
  const errors = validateWithSchema(artifactSchemas.visual, {
    kind: "VisualPlan",
    version: "1.0.0",
    sourceHash: "hash",
    scenes: [{sceneId: "workflow", visualType: "unknown"}],
  });

  assert.ok(errors.some((error) => error.includes("visualType")));
  assert.ok(errors.some((error) => error.includes("metaphor")));
});

test("schema validation accepts shot, media mix, and EDL artifacts", () => {
  const shots = {
    kind: "ShotPlan",
    version: "1.0.0",
    sourceHash: "hash",
    documentSlug: "release-gate",
    targetRuntimeSeconds: 105,
    targetShotCount: 25,
    shots: [
      {
        shotId: "workflow-shot-01",
        sceneId: "workflow",
        order: 0,
        startSeconds: 0,
        durationSeconds: 3,
        shotRole: "workflow-wide",
        purpose: "Show the workflow.",
        visualIntent: "A workflow rail draws across the frame.",
        sourceConceptIds: ["workflow"],
        framing: "wide",
        camera: "track",
        continuity: {visualMotif: "rail"},
        onScreenText: ["Workflow"],
        staticHoldSeconds: 0.4,
      },
    ],
  };

  const mediaMix = {
    kind: "MediaMixPlan",
    version: "1.0.0",
    sourceHash: "hash",
    documentSlug: "release-gate",
    targetMix: {"workflow-animation": 1},
    assignments: [
      {
        shotId: "workflow-shot-01",
        sceneId: "workflow",
        mediaType: "workflow-animation",
        assetNeeds: ["workflow rail"],
        rationale: "Show the process.",
      },
    ],
    warnings: [],
  };

  const edl = {
    kind: "EditDecisionList",
    version: "1.0.0",
    sourceHash: "hash",
    fps: 30,
    totalFrames: 90,
    decisions: [
      {
        cutId: "cut-001",
        shotId: "workflow-shot-01",
        sceneId: "workflow",
        fromFrame: 0,
        durationFrames: 90,
        transition: "cut",
        pacingRole: "explain",
        captionBehavior: "none",
        soundCue: "path-draw",
      },
    ],
  };

  assert.equal(assertValidArtifact("shots", shots), shots);
  assert.equal(assertValidArtifact("mediaMix", mediaMix), mediaMix);
  assert.equal(assertValidArtifact("edit", edl), edl);
});
