import assert from "node:assert/strict";
import {execFileSync} from "node:child_process";
import {readFileSync} from "node:fs";
import path from "node:path";
import {test} from "node:test";
import {fileURLToPath} from "node:url";
import {launchPlan} from "../launch/tdd-jest-validation-v001.mjs";
import {
  getTddJestValidationChecks,
  validateTddJestLaunchPlan,
} from "../scripts/build-tdd-jest-launch.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const content = JSON.parse(
  readFileSync(path.join(projectRoot, "content", "tdd-jest-validation-v001.json"), "utf8"),
);
const wordCount = (value) => String(value).trim().split(/\s+/).filter(Boolean).length;

test("v001 locks the 143-second narrative and six-second Oracle end slate", () => {
  assert.equal(launchPlan.validationProfile, "tdd-jest-validation-engineer-explainer-v001");
  assert.equal(launchPlan.fps, 30);
  assert.equal(launchPlan.width, 1920);
  assert.equal(launchPlan.height, 1080);
  assert.deepEqual(launchPlan.scenes.map((scene) => scene.durationSeconds), [5, 17, 14, 17, 20, 34, 18, 18]);
  assert.equal(launchPlan.scenes.reduce((total, scene) => total + scene.durationSeconds, 0), 143);
  assert.equal(launchPlan.endSlate.durationSeconds, 6);
  assert.equal(launchPlan.runtimeSeconds, 149);
  assert.ok(launchPlan.runtimeSeconds <= 150);

  const narrationText = launchPlan.scenes.map((scene) => scene.narration).join(" ");
  assert.ok(wordCount(narrationText) >= 340);
  assert.ok(wordCount(narrationText) <= 370);
  assert.equal(launchPlan.scenes[0].id, "introduction");
  assert.match(launchPlan.scenes[0].narration, /^Meet the TDD Jest Validation Gate/);
  assert.equal(content.format.voice, "af_heart");
  assert.equal(content.format.music, "none");
  assert.equal(content.format.captionLayer, "none");
});

test("dedicated validation profile covers the engineer-explainer contract", () => {
  const checks = validateTddJestLaunchPlan(launchPlan);
  assert.ok(checks.length >= 35);
  assert.ok(checks.every(({passed}) => passed));

  const labels = checks.map(({label}) => label).join("\n");
  for (const expected of [
    "Introduction presents requirement-backed tests",
    "Problem hook contrasts code-first",
    "Problem hook makes requirement-backed tests drive",
    "phase four after reviewed planning",
    "engineers and Codex inside agreed boundaries",
    "Capabilities connect traceability",
    "Getting-started workflow follows requirements",
    "Canonical TDD begins with a behavior list",
    "Canonical Red",
    "Canonical Green",
    "Canonical Refactor",
    "Validator governance surrounds",
    "Green is a checkpoint",
    "Approved unit-testable behavior changes update Jest before code",
    "New behavior outside scope becomes a potential gap",
    "Dashboard frames all six",
    "Standalone Codex, direct CLI, and SDD Orchestrator",
    "Use, stress-test, and contribution CTAs",
  ]) {
    assert.match(labels, new RegExp(expected, "i"));
  }
});

test("validation rejects a plan that loses a required usage mode", () => {
  const invalid = structuredClone(launchPlan);
  invalid.content.scenes["usage-cta"].usageModes = invalid.content.scenes["usage-cta"].usageModes
    .filter((mode) => mode.id !== "direct-cli");
  const checks = getTddJestValidationChecks(invalid);
  assert.equal(
    checks.find(({label}) => label === "Standalone Codex, direct CLI, and SDD Orchestrator modes are present")?.passed,
    false,
  );
  assert.throws(() => validateTddJestLaunchPlan(invalid), /usage mode|Direct CLI/i);
});

test("dashboard questions, prompt modes, and high-resolution media provenance stay explicit", () => {
  assert.deepEqual(content.scenes.dashboard.questions, [
    "What blocks the gate?",
    "Which requirements have evidence?",
    "Which tests need mappings?",
    "Are reviewed plans and baselines present?",
    "Were tests deleted or weakened?",
    "Which potential gaps need review?",
  ]);
  assert.deepEqual(
    content.scenes["usage-cta"].usageModes.map(({id}) => id),
    ["standalone-codex", "direct-cli", "sdd-orchestrator"],
  );
  assert.equal(content.scenes["usage-cta"].usageModes[0].command, "$tdd-jest-validation");
  assert.match(content.scenes["usage-cta"].usageModes[1].command, /run-jest-validation-gate\.mjs/);
  assert.match(content.scenes["usage-cta"].usageModes[2].prompt, /SDD Orchestrator.*TDD Jest phase/i);

  const mediaByRole = new Map(content.media.demoStills.map((still) => [still.evidenceRole, still]));
  assert.match(mediaByRole.get("representative-sample-and-prompt").sourceFile, /7\.07\.14 PM\.mov$/);
  assert.equal(mediaByRole.get("representative-sample-and-prompt").timecodeSeconds, 50);
  assert.match(mediaByRole.get("implementation-change").sourceFile, /11\.49\.39 PM\.mov$/);
  assert.equal(mediaByRole.get("implementation-change").timecodeSeconds, 20);
  assert.match(mediaByRole.get("validation-evidence").sourceFile, /11\.51\.42 PM\.mov$/);
  assert.equal(mediaByRole.get("validation-evidence").timecodeSeconds, 45);
  assert.ok(content.media.demoStills.every((still) => /not a definition of canonical/i.test(still.usage)));
  assert.match(content.media.sequenceIndex.usage, /reference only/i);
});

test("validate-only build command exercises the profile without synthesizing audio", () => {
  const output = execFileSync(
    process.execPath,
    [path.join(projectRoot, "scripts", "build-tdd-jest-launch.mjs"), "--validate-only"],
    {cwd: projectRoot, encoding: "utf8"},
  );
  assert.match(output, /TDD Jest profile checks passed/);
});

test("canonical TDD stays distinct from validator governance", () => {
  const cycle = content.scenes["red-green-refactor"];
  assert.deepEqual(cycle.canonicalMethodology.cycle.map(({state}) => state), ["RED", "GREEN", "REFACTOR"]);
  assert.match(cycle.canonicalMethodology.testList, /one case at a time/i);
  assert.match(cycle.canonicalMethodology.cycle[0].definition, /fails in the expected way/i);
  assert.match(cycle.canonicalMethodology.cycle[1].definition, /just enough code.*every earlier test/i);
  assert.match(cycle.canonicalMethodology.cycle[2].definition, /remain green.*without changing behavior/i);
  assert.match(cycle.validatorGovernance.statement, /does not redefine Red, Green, or Refactor/i);
  assert.match(cycle.validatorGovernance.boundary, /governance around TDD.*not canonical color definitions/i);
  assert.deepEqual(cycle.validatorGovernance.items, [
    "Approved requirements",
    "Reviewed target plan",
    "Red-phase baseline",
    "Requirement traceability",
    "Implementation drift checks",
    "Potential-gap review",
    "Composed readiness gate",
  ]);
  for (const source of [
    "https://newsletter.kentbeck.com/p/canon-tdd",
    "https://martinfowler.com/bliki/TestDrivenDevelopment.html",
    "https://gds-way.digital.cabinet-office.gov.uk/standards/test-driven-development.html",
  ]) {
    assert.ok(content.project.sourceTruth.includes(source));
    assert.ok(cycle.canonicalMethodology.sources.includes(source));
  }
});

test("problem hook contrasts post-hoc tests with requirement-backed TDD", () => {
  const hook = launchPlan.scenes.find(({id}) => id === "problem-hook").narration;
  assert.match(hook, /code-first (?:development|risk)/i);
  assert.match(hook, /Codex (?:implements|writes).*change.*(?:then tests its own output|writes tests around what it produced)/i);
  assert.match(hook, /tests (?:may|can) pass.*mirroring the implementation/i);
  assert.match(hook, /requirement-backed tests define the boundary.*drive (?:the )?code/i);
  assert.match(hook, /unmapped implementation.*drift or a potential gap/i);

  const comparison = content.scenes["problem-hook"].comparison;
  assert.deepEqual(comparison.codeFirst.flow, ["Codex implementation", "Tests written afterward"]);
  assert.deepEqual(comparison.testFirst.flow, ["Approved requirements", "Jest evidence", "Implementation"]);
});

test("getting started preserves the reviewed plan and sample approval sequence", () => {
  const gettingStarted = content.scenes["getting-started"];
  assert.deepEqual(gettingStarted.workflow.map(({label}) => label), [
    "Commit approved requirements",
    "Prepare Unit Test Target Plan",
    "Review and approve the plan",
    "Review one representative failing spec",
    "Generate the complete planned suite",
    "Capture the red-phase baseline",
    "Run the composed gate before product code",
  ]);
  assert.match(gettingStarted.teachingPoint, /TDD phase prepares the Unit Test Target Plan/i);
  assert.match(gettingStarted.teachingPoint, /people approve the plan and representative sample/i);
  assert.match(gettingStarted.approval.detail, /before generating the complete planned suite/i);

  const narration = launchPlan.scenes.find(({id}) => id === "getting-started").narration;
  assert.match(narration, /product-approved requirements committed to the repo/i);
  assert.match(narration, /TDD phase to prepare the Unit Test Target Plan/i);
  assert.match(narration, /Review and approve the plan.*representative failing spec/i);
  assert.match(narration, /planned suite.*red-phase baseline.*gate before (changing )?product code/i);
});

test("red-green-refactor models the iterative engineer and Codex working loop", () => {
  const cycle = content.scenes["red-green-refactor"];
  const narration = launchPlan.scenes.find(({id}) => id === "red-green-refactor").narration;
  assert.match(narration, /engineers and Codex.*(iterate together|iterative work|time together)/i);
  assert.match(narration, /Red.*requirement-backed test.*(?:expected failure|fails as expected)/i);
  assert.match(narration, /Green:.*smallest change.*earlier tests.*passing/i);
  assert.match(narration, /green is a checkpoint.*not proof.*PR-ready/i);
  assert.match(narration, /feature locally.*behavior, UX, and edge cases/i);
  assert.match(narration, /unit-testable behavior change.*approved scope.*update Jest first.*confirm red.*change the code/i);
  assert.match(narration, /New behavior outside that boundary.*potential gap for review/i);
  assert.match(narration, /Refactor while green.*slice is ready/i);

  assert.match(cycle.workingLoop.greenCheckpoint, /safe checkpoint.*not proof.*PR-ready/i);
  assert.match(cycle.workingLoop.inScopeChange, /Jest evidence first.*expected failure.*product code/i);
  assert.match(cycle.workingLoop.outsideScopeChange, /potential gap.*do not implement it opportunistically/i);
});
