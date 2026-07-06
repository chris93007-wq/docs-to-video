import assert from "node:assert/strict";
import {execFileSync} from "node:child_process";
import {mkdtempSync} from "node:fs";
import os from "node:os";
import path from "node:path";
import {test} from "node:test";

const samplePath = path.resolve("test/fixtures/sample.md");

test("CLI can run an individual stage and inspect its artifact", () => {
  const artifactDir = mkdtempSync(path.join(os.tmpdir(), "doc-video-cli-"));

  execFileSync("node", [
    "scripts/video.mjs",
    "semantic",
    samplePath,
    "--no-ai",
    "--artifact-dir",
    artifactDir,
  ], {cwd: process.cwd(), env: {...process.env, DOC_VIDEO_TEST_SYNTHESIS: "1"}});

  const output = execFileSync("node", [
    "scripts/video.mjs",
    "inspect",
    "semantic",
    "--artifact-dir",
    artifactDir,
  ], {cwd: process.cwd(), encoding: "utf8"});

  const semantic = JSON.parse(output);
  assert.equal(semantic.kind, "SemanticDocument");
  assert.equal(semantic.title, "Release Gate Compiler");
});

test("CLI can run and inspect shot-based editorial stages", () => {
  const artifactDir = mkdtempSync(path.join(os.tmpdir(), "doc-video-cli-shots-"));

  execFileSync("node", [
    "scripts/video.mjs",
    "edl",
    samplePath,
    "--no-ai",
    "--artifact-dir",
    artifactDir,
  ], {cwd: process.cwd(), env: {...process.env, DOC_VIDEO_TEST_SYNTHESIS: "1"}});

  const shots = JSON.parse(execFileSync("node", [
    "scripts/video.mjs",
    "inspect",
    "shots",
    "--artifact-dir",
    artifactDir,
  ], {cwd: process.cwd(), encoding: "utf8"}));
  const media = JSON.parse(execFileSync("node", [
    "scripts/video.mjs",
    "inspect",
    "media",
    "--artifact-dir",
    artifactDir,
  ], {cwd: process.cwd(), encoding: "utf8"}));
  const edl = JSON.parse(execFileSync("node", [
    "scripts/video.mjs",
    "inspect",
    "edl",
    "--artifact-dir",
    artifactDir,
  ], {cwd: process.cwd(), encoding: "utf8"}));

  assert.equal(shots.kind, "ShotPlan");
  assert.equal(media.kind, "MediaMixPlan");
  assert.equal(edl.kind, "EditDecisionList");
  assert.equal(edl.decisions.length, shots.shots.length);
});
