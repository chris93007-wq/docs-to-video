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
        visualType: "pipeline",
        layout: "horizontal",
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
