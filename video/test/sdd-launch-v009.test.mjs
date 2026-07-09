import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {existsSync, readFileSync} from "node:fs";
import path from "node:path";
import {test} from "node:test";
import {launchPlan as v008Plan} from "../launch/sdd-orchestrator-launch-v008.mjs";
import {launchPlan as v009Plan} from "../launch/sdd-orchestrator-launch-v009.mjs";
import {projectRoot} from "../compiler/utils.mjs";

const manifestFor = (version) => JSON.parse(
  readFileSync(path.join(projectRoot, "src", "launch", `sdd-orchestrator-launch-${version}.json`), "utf8"),
);
const projectContent = JSON.parse(
  readFileSync(path.join(projectRoot, "content", "sdd-orchestrator-launch-content.json"), "utf8"),
);

const sha256 = (filePath) => createHash("sha256").update(readFileSync(filePath)).digest("hex");

test("v009 preserves the approved v008 narrative and adds only the Oracle Redwood tail", () => {
  const v008Manifest = manifestFor("v008");
  const v009Manifest = manifestFor("v009");

  assert.equal(v009Plan.brandMode, "oracle-redwood");
  assert.equal(v009Plan.scenes.length, 7);
  assert.equal(v009Manifest.scenes.length, 7);
  assert.equal(v009Manifest.totalDurationSeconds, 123);
  assert.ok(v009Manifest.totalDurationSeconds < 125);
  assert.equal(v009Manifest.endSlate.durationSeconds, 6);
  assert.equal(v009Manifest.scenes.at(-1).startSeconds + v009Manifest.scenes.at(-1).durationSeconds, 117);

  assert.deepEqual(
    v009Plan.scenes.map(({narration, performanceSegments}) => ({narration, performanceSegments})),
    v008Plan.scenes.map(({narration, performanceSegments}) => ({narration, performanceSegments})),
  );
  assert.deepEqual(
    v009Manifest.scenes.map(({startSeconds, durationSeconds, narration}) => ({startSeconds, durationSeconds, narration})),
    v008Manifest.scenes.map(({startSeconds, durationSeconds, narration}) => ({startSeconds, durationSeconds, narration})),
  );

  const narrationText = v009Manifest.scenes.map((scene) => scene.narration.text).join(" ");
  for (const required of [
    "Jest Unit Tests",
    "Playwright validation",
    "evidence",
    "Let’s team up to test, scale, and shape it together.",
  ]) {
    assert.match(narrationText, new RegExp(required, "i"));
  }
  assert.match(JSON.stringify(v009Manifest.scenes), /approval/i);
});

test("v008 plan metadata and editable scene copy come from the shared project content", () => {
  assert.equal(v008Plan.title, projectContent.project.title);
  assert.equal(v008Plan.primaryCta, projectContent.project.primaryCta);
  assert.equal(v008Plan.secondaryCta, projectContent.project.secondaryCta);
  assert.deepEqual(
    v008Plan.scenes.map(({id, title, purpose, teachingPoint, cues}) => ({id, title, purpose, teachingPoint, cues})),
    v008Plan.scenes.map(({id}) => ({id, ...projectContent.scenes[id]})).map(
      ({id, title, purpose, teachingPoint, cues}) => ({id, title, purpose, teachingPoint, cues}),
    ),
  );
  assert.equal(projectContent.scenes.problem.headerLabel, "FAQs");
  assert.equal(projectContent.scenes.workflow.steps[5].label, "Jest Unit Tests");
  assert.equal(projectContent.scenes.conclusion.communityLine, projectContent.project.secondaryCta);
});

test("v009 bundles official Oracle assets and reuses every v008 narration WAV exactly", () => {
  const requiredAssets = [
    "fonts/OracleSans_Rg.ttf",
    "fonts/OracleSans_SBd.ttf",
    "fonts/OracleSans_Bd.ttf",
    "fonts/OracleSans_XBd.ttf",
    "logos/Oracle_rgb_#c74634.png",
    "logos/TheO_rgb_#c74634.png",
    "logos/Oracle red tag rgb_#c74634.png",
    "textures/96dpi_DataTexture_10a.png",
    "icons/RMIL_Personas_Developer-M_Bark_RGB.svg",
    "icons/RMIL_Personas_Business-Person-LOB-F_Bark_RGB.svg",
    "icons/RMIL_Personas_Executive-Male_Bark_RGB.svg",
    "video/Oracle Endslate 2026 Opaque HD.mp4",
    "ASSET-SOURCES.md",
  ];

  for (const asset of requiredAssets) {
    assert.ok(existsSync(path.join(projectRoot, "public", "brand", "oracle", asset)), asset);
  }

  for (const scene of v009Plan.scenes) {
    const v008Audio = path.join(projectRoot, "public", "audio", "sdd-orchestrator-launch-v008", `${scene.id}.wav`);
    const v009Audio = path.join(projectRoot, "public", "audio", "sdd-orchestrator-launch-v009", `${scene.id}.wav`);
    assert.equal(sha256(v009Audio), sha256(v008Audio), scene.id);
  }
});
