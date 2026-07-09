import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {existsSync, readFileSync} from "node:fs";
import path from "node:path";
import {test} from "node:test";
import {launchPlan as v008Plan} from "../launch/sdd-orchestrator-launch-v008.mjs";
import {launchPlan as v082Plan} from "../launch/sdd-orchestrator-launch-v0.8.2.mjs";
import {projectRoot} from "../compiler/utils.mjs";

const manifestFor = (version) => JSON.parse(
  readFileSync(path.join(projectRoot, "src", "launch", `sdd-orchestrator-launch-${version}.json`), "utf8"),
);
const projectContent = JSON.parse(
  readFileSync(path.join(projectRoot, "content", "sdd-orchestrator-launch-content.json"), "utf8"),
);
const sha256 = (filePath) => createHash("sha256").update(readFileSync(filePath)).digest("hex");

test("v0.8.2 preserves the approved v008 narrative and timing", () => {
  const v008Manifest = manifestFor("v008");
  const v082Manifest = manifestFor("v0.8.2");

  assert.equal(v082Plan.version, "v0.8.2");
  assert.equal(v082Plan.presentationMode, "live-demo-hybrid");
  assert.equal(v082Manifest.totalDurationSeconds, 117);
  assert.equal(v082Manifest.scenes.length, 7);
  assert.deepEqual(
    v082Plan.scenes.map(({narration, performanceSegments}) => ({narration, performanceSegments})),
    v008Plan.scenes.map(({narration, performanceSegments}) => ({narration, performanceSegments})),
  );
  assert.deepEqual(
    v082Manifest.scenes.map(({startSeconds, durationSeconds, narration}) => ({startSeconds, durationSeconds, narration})),
    v008Manifest.scenes.map(({startSeconds, durationSeconds, narration}) => ({startSeconds, durationSeconds, narration})),
  );
});

test("v0.8.2 bundles and maps the synchronized live-demo proof assets", () => {
  const manifest = manifestFor("v0.8.2");
  const assets = manifest.liveDemo.assets;
  const assetIds = new Set(assets.map((asset) => asset.id));

  assert.equal(manifest.presentationMode, "live-demo-hybrid");
  assert.equal(manifest.liveDemo.featureKey, "RX-13603");
  assert.ok(assets.some((asset) => asset.kind === "video"));
  assert.ok(assets.filter((asset) => asset.kind === "image").length >= 6);
  assert.ok(manifest.liveDemo.workflowProofs.every((proof) => assetIds.has(proof.assetId)));
  assert.deepEqual(
    projectContent.liveDemo.workflow.proofs.map((proof) => proof.id),
    manifest.liveDemo.workflowProofs.map((proof) => proof.assetId),
  );

  for (const asset of assets) {
    assert.ok(existsSync(path.join(projectRoot, "public", asset.staticFile)), asset.staticFile);
  }
  assert.ok(existsSync(path.join(projectRoot, "public", manifest.liveDemo.provenanceFile)));
});

test("v0.8.2 reuses every v008 narration WAV exactly", () => {
  for (const scene of v082Plan.scenes) {
    const v008Audio = path.join(projectRoot, "public", "audio", "sdd-orchestrator-launch-v008", `${scene.id}.wav`);
    const v082Audio = path.join(projectRoot, "public", "audio", "sdd-orchestrator-launch-v0.8.2", `${scene.id}.wav`);
    assert.equal(sha256(v082Audio), sha256(v008Audio), scene.id);
  }
});
