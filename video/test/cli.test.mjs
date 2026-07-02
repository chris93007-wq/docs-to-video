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
  ], {cwd: process.cwd()});

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
