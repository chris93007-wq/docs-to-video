import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import path from "node:path";
import {test} from "node:test";
import {hashFile, projectRoot} from "../compiler/utils.mjs";
import {launchPlan as v021Plan} from "../launch/pharmacy-task-workflow-v0.2.1.mjs";
import {launchPlan as v022Plan} from "../launch/pharmacy-task-workflow-v0.2.2.mjs";
import {
  narrationSignatureForManifest,
  narrationSignatureForPlan,
  validateEvidenceAssets,
} from "../scripts/build-pharmacy-task-workflow-version.mjs";

const readJson = (relativePath) =>
  JSON.parse(readFileSync(path.join(projectRoot, relativePath), "utf8"));

const v021Manifest = readJson("src/launch/pharmacy-task-workflow-v0.2.1.json");
const v022Manifest = readJson("src/launch/pharmacy-task-workflow-v0.2.2.json");

test("pharmacy workflow releases use semantic version identifiers", () => {
  assert.equal(v021Plan.id, "pharmacy-task-workflow-v0.2.1");
  assert.equal(v021Plan.version, "v0.2.1");
  assert.equal(v022Plan.id, "pharmacy-task-workflow-v0.2.2");
  assert.equal(v022Plan.version, "v0.2.2");

  const packageJson = readFileSync(path.join(projectRoot, "package.json"), "utf8");
  const root = readFileSync(path.join(projectRoot, "src/Root.tsx"), "utf8");
  assert.match(packageJson, /render:pharmacy-workflow-v0\.2\.1/);
  assert.match(packageJson, /render:pharmacy-workflow-v0\.2\.2/);
  assert.match(root, /PharmacyTaskWorkflowExplainerV021/);
  assert.match(root, /PharmacyTaskWorkflowExplainerV022/);
  assert.doesNotMatch(packageJson, new RegExp(`pharmacy-workflow-${"v00"}2`));
  assert.doesNotMatch(root, new RegExp(`PharmacyTaskWorkflowExplainer${"V00"}2`));
});

test("v0.2.2 preserves the complete v0.2.1 narration contract and audio", () => {
  const v021Signature = narrationSignatureForPlan(v021Plan);
  const v022Signature = narrationSignatureForPlan(v022Plan);
  assert.equal(v022Signature, v021Signature);
  assert.equal(v021Manifest.narrationSignature, v021Signature);
  assert.equal(v022Manifest.narrationSignature, v021Signature);
  assert.equal(
    narrationSignatureForManifest(v022Manifest, v022Plan.tailPaddingSeconds),
    v021Signature,
  );
  assert.deepEqual(v022Manifest.narrationAudio, v021Manifest.narrationAudio);
  assert.deepEqual(
    v022Manifest.scenes.map(({id, startSeconds, durationSeconds}) => ({id, startSeconds, durationSeconds})),
    v021Manifest.scenes.map(({id, startSeconds, durationSeconds}) => ({id, startSeconds, durationSeconds})),
  );
  assert.equal(v022Manifest.totalDurationSeconds, v021Manifest.totalDurationSeconds);
});

test("v0.2.2 PR evidence has validated provenance, dimensions, checksums, and crops", () => {
  validateEvidenceAssets(v022Plan);
  const concrete = v022Plan.scenes.find((scene) => scene.id === "concrete-example");
  const owner = v022Plan.scenes.find((scene) => scene.id === "one-owner");
  assert.equal(concrete.evidence.sourceLabel, "Source: PR 966 · Before & After");
  assert.equal(owner.evidence.sourceLabel, "Source: PR 966 · Design");
  assert.deepEqual(
    concrete.evidence.focusRegions.map((region) => region.id),
    ["legacy-orchestration", "signal-owned-store"],
  );
  assert.deepEqual(
    owner.evidence.focusRegions.map((region) => region.id),
    ["task-data-loading", "readiness-gate", "action-submission"],
  );
  assert.equal(
    hashFile(path.join(projectRoot, "public", concrete.evidence.staticFile)),
    concrete.evidence.sha256,
  );
  assert.equal(
    hashFile(path.join(projectRoot, "public", owner.evidence.staticFile)),
    owner.evidence.sha256,
  );
});
