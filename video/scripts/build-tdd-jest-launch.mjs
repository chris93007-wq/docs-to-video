import {execFileSync} from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {speechTextFor} from "../compiler/stages/narration-audio.mjs";
import {hashValue} from "../compiler/utils.mjs";
import {launchPlan} from "../launch/tdd-jest-validation-v001.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const generatedManifestPath = path.join(projectRoot, "src", "launch", `${launchPlan.id}.json`);
const artifactDir = path.join(projectRoot, "artifacts", launchPlan.id);
const audioDir = path.join(projectRoot, "public", "audio", launchPlan.id);
const synthesisWorker = path.join(__dirname, "synthesize-sdd-performance-scene.mjs");

const words = (value) => String(value ?? "").trim().split(/\s+/).filter(Boolean);
const wordCount = (value) => words(value).length;
const includesAll = (value, patterns) => patterns.every((pattern) => pattern.test(value));
const writeJson = (filePath, value) => writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
const normalizeSpeechText = (text) => speechTextFor(text)
  .replace(/[’]/g, "'")
  .replace(/[—–]/g, ", ");

const check = (label, passed) => ({label, passed: Boolean(passed)});

export const getTddJestValidationChecks = (plan = launchPlan) => {
  const narrationText = plan.scenes.map((scene) => scene.narration).join(" ");
  const narrativeRuntimeSeconds = plan.scenes.reduce((total, scene) => total + scene.durationSeconds, 0);
  const endSlateDurationSeconds = plan.endSlate?.durationSeconds ?? 0;
  const allText = `${narrationText} ${JSON.stringify(plan.content)}`;
  const expectedDurations = [5, 17, 14, 17, 20, 34, 18, 18];
  const usageModes = plan.content?.scenes?.["usage-cta"]?.usageModes ?? [];
  const usageModeIds = usageModes.map((mode) => mode.id);
  const dashboardQuestions = plan.content?.scenes?.dashboard?.questions ?? [];
  const demoStills = plan.content?.media?.demoStills ?? [];
  const cycleCopy = plan.content?.scenes?.["red-green-refactor"]?.canonicalMethodology;
  const canonicalCycle = cycleCopy?.cycle ?? [];
  const governance = plan.content?.scenes?.["red-green-refactor"]?.validatorGovernance;
  const workingLoop = plan.content?.scenes?.["red-green-refactor"]?.workingLoop ?? {};
  const gettingStarted = plan.content?.scenes?.["getting-started"] ?? {};
  const gettingStartedWorkflow = gettingStarted.workflow ?? [];
  const sourceTruth = plan.sourceTruth ?? [];
  const narrationFor = (sceneId) => plan.scenes.find((scene) => scene.id === sceneId)?.narration ?? "";

  return [
    check("Dedicated TDD Jest validation profile is selected", plan.validationProfile === "tdd-jest-validation-engineer-explainer-v001"),
    check("Canvas is 1920x1080 at 30 fps", plan.width === 1920 && plan.height === 1080 && plan.fps === 30),
    check("Exactly eight narrative scenes", plan.scenes.length === 8),
    check("Scene durations are 5, 17, 14, 17, 20, 34, 18, and 18 seconds", JSON.stringify(plan.scenes.map((scene) => scene.durationSeconds)) === JSON.stringify(expectedDurations)),
    check("Narrative runtime is 143 seconds", narrativeRuntimeSeconds === 143),
    check("Narrative plus end slate is exactly 149 seconds", narrativeRuntimeSeconds + endSlateDurationSeconds === 149 && plan.runtimeSeconds === 149),
    check("Final runtime stays within 150 seconds", plan.runtimeSeconds <= 150),
    check("Narration is 340-370 words", wordCount(narrationText) >= 340 && wordCount(narrationText) <= 370 && wordCount(narrationText) >= plan.narrationWordRange.min && wordCount(narrationText) <= plan.narrationWordRange.max),
    check("Warm af_heart narration is configured", plan.content?.format?.voice === "af_heart" && /warm|friendly/i.test(plan.voiceDirection)),
    check("No music or full caption layer is requested", plan.content?.format?.music === "none" && plan.content?.format?.captionLayer === "none"),
    check("Introduction presents requirement-backed tests before product code", /^Meet the TDD Jest Validation Gate/i.test(narrationText) && includesAll(JSON.stringify(plan.content?.scenes?.introduction ?? {}), [/requirement-backed tests/i, /before product code/i])),
    check("Problem hook contrasts code-first Codex changes with tests written afterward", includesAll(narrationFor("problem-hook"), [/code-first/i, /Codex (?:implements|writes).*change/i, /then tests (?:its own output|what it produced)|writes tests around what it produced/i])),
    check("Problem hook explains why post-hoc tests can mirror implementation", includesAll(narrationFor("problem-hook"), [/tests (?:may|can) pass/i, /mirroring the implementation/i])),
    check("Problem hook makes requirement-backed tests drive bounded implementation", includesAll(narrationFor("problem-hook"), [/TDD (?:reverses|flips)/i, /requirement-backed tests/i, /define the boundary/i, /drive (?:the )?code/i])),
    check("Problem hook surfaces unmapped implementation as drift or a potential gap", includesAll(narrationFor("problem-hook"), [/unmapped implementation/i, /drift/i, /potential gap/i])),
    check("SDD placement is phase four after reviewed planning and before product code", includesAll(narrationFor("sdd-fit"), [/phase four/i, /(?:after reviewed planning.*before product code|between reviewed planning and product code)/i])),
    check("SDD placement keeps engineers and Codex inside agreed boundaries", includesAll(narrationFor("sdd-fit"), [/Engineers and Codex/i, /(?:inside|within) (?:the |those |SDD's )?(?:agreed )?boundar(?:y|ies)/i])),
    check("Playwright is complementary and does not replace Jest", includesAll(allText, [/Playwright.*complement/i, /does not replace|never replaces|rather than replacing|not replac(?:e|es|ed|ing)/i, /Jest/i])),
    check("Capabilities connect traceability, baseline, drift, test integrity, and readiness", includesAll(narrationFor("capabilities"), [/requirement and acceptance IDs/i, /Jest specs/i, /source paths/i, /baseline/i, /implementation drift/i, /(?:weakened tests|(?:test-)?weakening signals)/i, /traceability/i, /test integrity/i, /feature readiness/i])),
    check("Getting started begins with product-approved requirements committed to the repo", includesAll(narrationFor("getting-started"), [/product-approved requirements/i, /committed to the repo/i])),
    check("The TDD phase prepares the Unit Test Target Plan inside reviewed scope", includesAll(`${narrationFor("getting-started")} ${gettingStarted.teachingPoint ?? ""}`, [/TDD phase.*prepare/i, /Unit Test Target Plan/i, /reviewed feature scope/i])),
    check("Getting-started workflow follows requirements, plan, approvals, suite, baseline, and gate", gettingStartedWorkflow.length === 7 && [
      /Commit approved requirements/i,
      /Prepare Unit Test Target Plan/i,
      /Review and approve the plan/i,
      /representative failing spec/i,
      /complete planned suite/i,
      /red-phase baseline/i,
      /gate before product code/i,
    ].every((pattern, index) => pattern.test(gettingStartedWorkflow[index]?.label ?? ""))),
    check("Human plan and sample approval precede full-suite generation", includesAll(`${gettingStarted.approval?.label ?? ""} ${gettingStarted.approval?.detail ?? ""}`, [/Human approval/i, /Unit Test Target Plan/i, /representative failing spec/i, /before generating the complete planned suite/i])),
    check("Getting started runs the gate before product code", includesAll(narrationFor("getting-started"), [/planned suite/i, /red-phase baseline/i, /run the gate before (changing )?product code/i])),
    check("Kent Beck, Martin Fowler, and GDS TDD sources are explicit", [
      "https://newsletter.kentbeck.com/p/canon-tdd",
      "https://martinfowler.com/bliki/TestDrivenDevelopment.html",
      "https://gds-way.digital.cabinet-office.gov.uk/standards/test-driven-development.html",
    ].every((source) => sourceTruth.includes(source))),
    check("Canonical TDD begins with a behavior list and one case at a time", /list.*behaviors|list the desired behaviors/i.test(cycleCopy?.testList ?? "") && /one case at a time/i.test(cycleCopy?.testList ?? "")),
    check("Canonical Red is an expected failing test", canonicalCycle.some((stage) => stage.state === "RED" && /fails in the expected way/i.test(stage.definition ?? ""))),
    check("Canonical Green uses just enough code and keeps prior tests passing", canonicalCycle.some((stage) => stage.state === "GREEN" && /just enough code/i.test(stage.definition ?? "") && /every earlier test to pass/i.test(stage.definition ?? ""))),
    check("Canonical Refactor stays green without changing behavior", canonicalCycle.some((stage) => stage.state === "REFACTOR" && /remain green/i.test(stage.definition ?? "") && /without changing behavior/i.test(stage.definition ?? ""))),
    check("Canonical TDD repeats one case until the behavior list is empty", /next behavior.*repeat.*list is empty/i.test(cycleCopy?.repeat ?? "")),
    check("Validator explicitly does not redefine Red, Green, or Refactor", /does not redefine Red, Green, or Refactor/i.test(governance?.statement ?? "")),
    check("Validator governance surrounds rather than renames canonical colors", includesAll(`${governance?.items?.join(" ")} ${governance?.boundary ?? ""}`, [/approved requirements/i, /reviewed target plan/i, /baseline/i, /traceability/i, /drift checks/i, /potential-gap review/i, /composed.*gate/i, /governance around TDD/i, /not canonical color definitions/i])),
    check("Red-green-refactor is the engineer and Codex iterative working loop", includesAll(narrationFor("red-green-refactor"), [/engineers and Codex/i, /iterate together|iterative work|time together/i, /one planned behavior/i])),
    check("Green is a checkpoint followed by local exploratory testing", includesAll(`${narrationFor("red-green-refactor")} ${workingLoop.greenCheckpoint ?? ""} ${workingLoop.localValidation ?? ""}`, [/green is a checkpoint/i, /not PR-ready|not proof.*PR-ready/i, /locally|local build/i, /behavior/i, /UX/i, /edge cases/i])),
    check("Approved unit-testable behavior changes update Jest before code", includesAll(`${narrationFor("red-green-refactor")} ${workingLoop.inScopeChange ?? ""}`, [/unit-testable/i, /approved scope|approved requirements/i, /update Jest|Jest evidence first/i, /confirm red|confirm the expected failure/i, /then change.*code/i])),
    check("New behavior outside scope becomes a potential gap for review", includesAll(`${narrationFor("red-green-refactor")} ${workingLoop.outsideScopeChange ?? ""}`, [/New behavior|behavior outside/i, /outside.*boundary|outside approved/i, /potential gap/i, /review/i])),
    check("Refactor stays green until the complete slice is ready", includesAll(`${narrationFor("red-green-refactor")} ${workingLoop.refactor ?? ""}`, [/Refactor while green|suite remains green/i, /repeat/i, /slice is ready|reviewed slice is ready/i])),
    check("Dashboard frames all six engineering questions", dashboardQuestions.length === 6 && [
      /blocks the gate/i,
      /requirements have evidence/i,
      /tests need mappings/i,
      /plans and baselines/i,
      /deleted or weakened/i,
      /potential gaps/i,
    ].every((pattern) => dashboardQuestions.some((question) => pattern.test(question)))),
    check("Standalone Codex, direct CLI, and SDD Orchestrator modes are present", ["standalone-codex", "direct-cli", "sdd-orchestrator"].every((id) => usageModeIds.includes(id))),
    check("Standalone Codex example invokes the skill", usageModes.some((mode) => mode.id === "standalone-codex" && mode.command === "$tdd-jest-validation")),
    check("Direct CLI example runs the composed gate", usageModes.some((mode) => mode.id === "direct-cli" && /run-jest-validation-gate\.mjs/.test(mode.command ?? ""))),
    check("Orchestrator example enters the TDD Jest phase", usageModes.some((mode) => mode.id === "sdd-orchestrator" && /SDD Orchestrator/i.test(mode.prompt ?? "") && /TDD Jest phase/i.test(mode.prompt ?? ""))),
    check("Use, stress-test, and contribution CTAs are all present", includesAll(narrationText, [/next feature/i, /evaluate the evidence/i, /stress-test the guardrails/i, /contribute prompts, checks, tests, and dashboard metrics/i])),
    check("Official Oracle end slate is six seconds and muted", plan.endSlate?.durationSeconds === 6 && /Oracle Endslate 2026/.test(plan.endSlate?.staticFile ?? "") && /muted/i.test(plan.endSlate?.treatment ?? "")),
    check("Every scene has sparse editable cues", plan.scenes.every((scene) => scene.cues.length >= 2 && scene.cues.length <= 4)),
    check("Every scene uses a bespoke visual primitive", plan.scenes.every((scene) => Boolean(scene.visualPrimitive))),
    check("Demo media references only original high-resolution MOV files", demoStills.length === 3 && demoStills.every((still) => /\.mov$/i.test(still.sourceFile) && !/My Movie/i.test(still.sourceFile) && Number.isFinite(still.timecodeSeconds))),
    check("Stitched demo is sequence-reference only", /sequence reference only/i.test(plan.content?.media?.sequenceIndex?.usage ?? "")),
    check("Confluence and the authoritative skill are source truth", sourceTruth.some((source) => /Validation\+Gate/.test(source)) && sourceTruth.some((source) => /tdd-jest-validation\/SKILL\.md/.test(source))),
    check("Narration is split into performance beats", plan.scenes.every((scene, index) => scene.performanceSegments.length >= (index === 0 ? 1 : 2) && scene.performanceSegments.every((segment) => Number.isFinite(segment.pauseAfterMs)))),
  ];
};

export const validateTddJestLaunchPlan = (plan = launchPlan) => {
  const checks = getTddJestValidationChecks(plan);
  const failed = checks.filter(({passed}) => !passed);
  if (failed.length > 0) {
    throw new Error(`TDD Jest launch validation failed:\n${failed.map(({label}) => `- ${label}`).join("\n")}`);
  }
  return checks;
};

const findFfmpeg = () => {
  if (process.env.FFMPEG_PATH) {
    return process.env.FFMPEG_PATH;
  }
  const remotionModules = path.join(projectRoot, "node_modules", "@remotion");
  if (!existsSync(remotionModules)) {
    return null;
  }
  return readdirSync(remotionModules)
    .filter((name) => name.startsWith("compositor-"))
    .map((name) => path.join(remotionModules, name, process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg"))
    .find((candidate) => existsSync(candidate)) ?? null;
};

const synthesizeNarration = ({previousManifest}) => {
  const ffmpeg = findFfmpeg();
  const previousAudioByScene = new Map(
    (previousManifest?.narrationAudio?.segments ?? []).map((segment) => [segment.sceneId, segment]),
  );
  const audioSegments = [];
  let sceneCursor = 0;

  for (let index = 0; index < launchPlan.scenes.length; index += 1) {
    const scene = launchPlan.scenes[index];
    const isLast = index === launchPlan.scenes.length - 1;
    const pauseAfterSeconds = isLast ? 0 : 0.65;
    const targetAudioSeconds = scene.durationSeconds - pauseAfterSeconds;
    const targetSpeechSeconds = targetAudioSeconds - 0.25;
    const outputFile = path.join(audioDir, `${scene.id}.wav`);
    const expectedPerformance = scene.performanceSegments.map((segment) => ({
      displayText: segment.text,
      spokenText: normalizeSpeechText(segment.text),
      pauseAfterMs: segment.pauseAfterMs,
    }));
    const previousAudio = previousAudioByScene.get(scene.id);
    const previousAudioFile = previousAudio?.staticFile
      ? path.join(projectRoot, "public", previousAudio.staticFile)
      : null;
    const canReuseAudio = Boolean(previousAudio && previousAudioFile && existsSync(previousAudioFile))
      && previousAudio.audioDurationSeconds === targetAudioSeconds
      && previousAudio.pauseAfterSeconds === pauseAfterSeconds
      && previousAudio.performanceSegments?.length === expectedPerformance.length
      && expectedPerformance.every((segment, segmentIndex) => {
        const prior = previousAudio.performanceSegments[segmentIndex];
        return prior?.displayText === segment.displayText
          && prior?.spokenText === segment.spokenText
          && prior?.pauseAfterMs === segment.pauseAfterMs;
      });

    if (canReuseAudio) {
      if (path.resolve(previousAudioFile) !== path.resolve(outputFile)) {
        copyFileSync(previousAudioFile, outputFile);
      }
      audioSegments.push({
        ...previousAudio,
        staticFile: `audio/${launchPlan.id}/${scene.id}.wav`,
        startSeconds: sceneCursor,
        endSeconds: sceneCursor + targetAudioSeconds,
        audioDurationSeconds: targetAudioSeconds,
        pauseAfterSeconds,
      });
      sceneCursor += scene.durationSeconds;
      continue;
    }

    if (!ffmpeg) {
      throw new Error("FFmpeg was not found. Run npm install to install Remotion's bundled compositor, or set FFMPEG_PATH.");
    }

    const rawFile = path.join(audioDir, `${scene.id}.raw.wav`);
    const synthesisInput = path.join(audioDir, `${scene.id}.synthesis-input.json`);
    const synthesisMetadata = path.join(audioDir, `${scene.id}.synthesis-metadata.json`);
    writeJson(synthesisInput, {sceneId: scene.id, performanceSegments: scene.performanceSegments});
    execFileSync(process.execPath, [synthesisWorker, synthesisInput, rawFile, synthesisMetadata], {stdio: "ignore"});
    const performance = JSON.parse(readFileSync(synthesisMetadata, "utf8"));
    const rawDurationSeconds = performance.rawDurationSeconds;
    const playbackSpeed = Math.max(1, rawDurationSeconds / targetSpeechSeconds);
    if (playbackSpeed > 1.2) {
      throw new Error(`Narration for ${scene.id} requires ${playbackSpeed.toFixed(3)}x playback; shorten the copy instead of exceeding 1.2x.`);
    }

    execFileSync(ffmpeg, [
      "-y",
      "-i", rawFile,
      "-filter:a", `atempo=${playbackSpeed.toFixed(6)},apad=pad_dur=1,atrim=0:${targetAudioSeconds.toFixed(3)}`,
      "-ac", "1",
      "-ar", "24000",
      outputFile,
    ], {
      stdio: "ignore",
      env: {...process.env, DYLD_LIBRARY_PATH: path.dirname(ffmpeg)},
    });

    audioSegments.push({
      sceneId: scene.id,
      spokenText: performance.spokenSegments.map((segment) => segment.spokenText).join(" "),
      performanceSegments: performance.spokenSegments.map((segment) => ({
        displayText: segment.displayText,
        spokenText: segment.spokenText,
        startSeconds: Number((segment.rawStartSeconds / playbackSpeed).toFixed(3)),
        speechEndSeconds: Number((segment.rawSpeechEndSeconds / playbackSpeed).toFixed(3)),
        endSeconds: Number((segment.rawEndSeconds / playbackSpeed).toFixed(3)),
        pauseAfterMs: segment.pauseAfterMs,
        effectivePauseAfterMs: Math.round(segment.pauseAfterMs / playbackSpeed),
      })),
      staticFile: `audio/${launchPlan.id}/${scene.id}.wav`,
      sampleRate: 24000,
      rawDurationSeconds: Number(rawDurationSeconds.toFixed(3)),
      playbackSpeed: Number(playbackSpeed.toFixed(4)),
      audioDurationSeconds: targetAudioSeconds,
      startSeconds: sceneCursor,
      endSeconds: sceneCursor + targetAudioSeconds,
      pauseAfterSeconds,
    });
    sceneCursor += scene.durationSeconds;
  }

  return audioSegments;
};

const createTimedScenes = (audioSegments) => {
  let cursor = 0;
  return launchPlan.scenes.map((scene) => {
    const startSeconds = cursor;
    cursor += scene.durationSeconds;
    const audio = audioSegments.find((segment) => segment.sceneId === scene.id);
    return {
      id: scene.id,
      title: scene.title,
      purpose: scene.purpose,
      teachingPoint: scene.teachingPoint,
      startSeconds,
      durationSeconds: scene.durationSeconds,
      copy: launchPlan.content.scenes[scene.id],
      visual: {
        sceneId: scene.id,
        visualPrimitive: scene.visualPrimitive,
        visualType: "bespoke-tdd-jest-set-piece",
        layout: "full-frame custom composition",
        motionStyle: "continuous-progressive-reveal",
        density: "high",
        textDensity: "low",
        camera: "subtle-push-in",
        emphasis: scene.cues.slice(0, 3),
        avoid: ["generic centered cards", "tiny code", "paragraph captions", "time-sensitive dashboard counts"],
      },
      narration: {
        sceneId: scene.id,
        startSeconds,
        endSeconds: startSeconds + audio.audioDurationSeconds,
        text: scene.narration,
        performanceSegments: audio.performanceSegments,
      },
    };
  });
};

const createShots = (scenes) => {
  const shots = [];
  const assignments = [];
  const decisions = [];
  for (const scene of scenes) {
    const source = launchPlan.scenes.find((candidate) => candidate.id === scene.id);
    const shotDuration = scene.durationSeconds / source.cues.length;
    source.cues.forEach((cue, cueIndex) => {
      const shotId = `${scene.id}-shot-${String(cueIndex + 1).padStart(2, "0")}`;
      const startSeconds = scene.startSeconds + cueIndex * shotDuration;
      const durationSeconds = cueIndex === source.cues.length - 1
        ? scene.startSeconds + scene.durationSeconds - startSeconds
        : shotDuration;
      const mediaType = source.media[cueIndex];
      shots.push({
        shotId,
        sceneId: scene.id,
        order: cueIndex + 1,
        title: scene.title,
        purpose: scene.purpose,
        teachingPoint: scene.teachingPoint,
        startSeconds: Number(startSeconds.toFixed(3)),
        durationSeconds: Number(durationSeconds.toFixed(3)),
        visualIntent: `${cue} as part of the ${scene.id} set piece`,
        framing: cueIndex % 2 === 0 ? "wide" : "medium-close",
        camera: "subtle-push-in",
        onScreenText: [cue],
        media: {shotId, sceneId: scene.id, mediaType},
      });
      assignments.push({shotId, sceneId: scene.id, mediaType, rationale: `Supports ${cue}`});
      decisions.push({
        cutId: `cut-${shotId}`,
        shotId,
        sceneId: scene.id,
        fromFrame: Math.round(startSeconds * launchPlan.fps),
        durationFrames: Math.round(durationSeconds * launchPlan.fps),
        transition: cueIndex === 0 ? "match-cut" : "continuous-build",
        pacingRole: cueIndex === 0 ? "scene-open" : cueIndex === source.cues.length - 1 ? "scene-payoff" : "scene-build",
      });
    });
  }
  return {shots, assignments, decisions};
};

export const buildTddJestLaunch = () => {
  const checks = validateTddJestLaunchPlan(launchPlan);
  const narrativeRuntimeSeconds = launchPlan.scenes.reduce((total, scene) => total + scene.durationSeconds, 0);
  mkdirSync(artifactDir, {recursive: true});
  mkdirSync(audioDir, {recursive: true});
  mkdirSync(path.dirname(generatedManifestPath), {recursive: true});

  const previousManifest = existsSync(generatedManifestPath)
    ? JSON.parse(readFileSync(generatedManifestPath, "utf8"))
    : null;
  const narrationText = launchPlan.scenes.map((scene) => scene.narration).join(" ");
  const sourceHash = hashValue({launchPlan, narrationText});
  const audioSegments = synthesizeNarration({previousManifest});
  const postAudioChecks = [
    check("One narration WAV is generated for every narrative scene", audioSegments.length === launchPlan.scenes.length),
    check("Narration never exceeds 1.2x playback speed", audioSegments.every((segment) => segment.playbackSpeed <= 1.2)),
    check("Narration segments align to scene starts", audioSegments.every((segment, index) => segment.startSeconds === launchPlan.scenes.slice(0, index).reduce((total, scene) => total + scene.durationSeconds, 0))),
    check("Narration leaves the end slate silent", audioSegments.at(-1).endSeconds === narrativeRuntimeSeconds),
  ];
  const failedPostAudio = postAudioChecks.filter(({passed}) => !passed);
  if (failedPostAudio.length > 0) {
    throw new Error(`TDD Jest narration validation failed:\n${failedPostAudio.map(({label}) => `- ${label}`).join("\n")}`);
  }

  const scenes = createTimedScenes(audioSegments);
  const {shots, assignments, decisions} = createShots(scenes);
  const narration = {
    kind: "Narration",
    version: "1.0.0",
    sourceHash,
    text: narrationText,
    wordCount: wordCount(narrationText),
    tone: launchPlan.content.project.narrationTone,
    segments: scenes.map((scene) => scene.narration),
  };
  const narrationAudio = {
    kind: "NarrationAudio",
    version: "1.0.0",
    sourceHash,
    model: "onnx-community/Kokoro-82M-v1.0-ONNX",
    voice: "af_heart",
    totalDurationSeconds: narrativeRuntimeSeconds,
    segments: audioSegments,
  };
  const manifest = {
    kind: "RenderManifest",
    version: "1.0.0",
    renderer: "remotion",
    sourceHash,
    showcase: launchPlan.showcase,
    launchVersion: launchPlan.version,
    validationProfile: launchPlan.validationProfile,
    brandMode: launchPlan.brandMode,
    fps: launchPlan.fps,
    width: launchPlan.width,
    height: launchPlan.height,
    totalDurationSeconds: launchPlan.runtimeSeconds,
    narrativeDurationSeconds: narrativeRuntimeSeconds,
    endSlate: launchPlan.endSlate,
    content: launchPlan.content,
    scenes,
    shots,
    mediaMix: {kind: "MediaMixPlan", version: "1.0.0", sourceHash, assignments},
    edl: {kind: "EditDecisionList", version: "1.0.0", sourceHash, fps: launchPlan.fps, decisions},
    narration,
    narrationAudio,
  };
  const validation = {
    kind: "LaunchExperienceValidation",
    version: "1.0.0",
    sourceHash,
    passed: true,
    profile: launchPlan.validationProfile,
    checks: [...checks, ...postAudioChecks],
    metrics: {
      runtimeSeconds: launchPlan.runtimeSeconds,
      narrativeRuntimeSeconds,
      endSlateDurationSeconds: launchPlan.endSlate.durationSeconds,
      sceneCount: launchPlan.scenes.length,
      shotCount: shots.length,
      narrationWordCount: narration.wordCount,
      voice: narrationAudio.voice,
      usageModeCount: launchPlan.content.scenes["usage-cta"].usageModes.length,
      dashboardQuestionCount: launchPlan.content.scenes.dashboard.questions.length,
      captionsCarryMeaning: false,
      musicPresent: false,
    },
  };

  const narrationMarkdown = `# Narration — ${launchPlan.title} ${launchPlan.version}\n\n**Narrative runtime:** ${narrativeRuntimeSeconds} seconds  \n**Total runtime:** ${launchPlan.runtimeSeconds} seconds  \n**Word count:** ${narration.wordCount}\n\n${launchPlan.scenes.map((scene, index) => `## Scene ${index + 1} — ${scene.title}\n\n${scene.narration}`).join("\n\n")}\n`;
  const voicePerformance = `# Voice Performance — ${launchPlan.title} ${launchPlan.version}\n\nVoice: Kokoro af_heart. ${launchPlan.voiceDirection}\n\n${launchPlan.scenes.map((scene, index) => `## ${index + 1}. ${scene.title}\n\n${scene.performanceSegments.map((segment) => `${segment.text}${segment.pauseAfterMs ? `  \n_[Pause ${segment.pauseAfterMs}ms]_` : ""}`).join("\n\n")}`).join("\n\n")}\n`;
  const creativeBrief = `# Creative Brief — ${launchPlan.title}\n\n## Objective\n\nExplain how the TDD Jest Validation Gate keeps requirements, plans, Jest specs, and product source aligned through the red-green-refactor cycle.\n\n## Audience\n\nSoftware engineers.\n\n## Positioning\n\n> ${launchPlan.positioning}\n\n## CTA\n\n- ${launchPlan.primaryCta}\n- ${launchPlan.contributionCta}\n\n## Sources\n\n${launchPlan.sourceTruth.map((source) => `- ${source}`).join("\n")}\n`;

  writeFileSync(path.join(artifactDir, "creative-brief.md"), creativeBrief);
  writeFileSync(path.join(artifactDir, "narration.md"), narrationMarkdown);
  writeFileSync(path.join(artifactDir, "voice-performance.md"), voicePerformance);
  writeJson(path.join(artifactDir, "content.json"), launchPlan.content);
  writeJson(path.join(artifactDir, "media-manifest.json"), launchPlan.content.media);
  writeJson(path.join(artifactDir, "narration.json"), narration);
  writeJson(path.join(artifactDir, "narration-audio.json"), narrationAudio);
  writeJson(path.join(artifactDir, "shot-plan.json"), {kind: "ShotPlan", version: "1.0.0", sourceHash, shots});
  writeJson(path.join(artifactDir, "media-mix-plan.json"), manifest.mediaMix);
  writeJson(path.join(artifactDir, "edit-decision-list.json"), manifest.edl);
  writeJson(path.join(artifactDir, "experience-validation.json"), validation);
  writeJson(path.join(artifactDir, "render-manifest.json"), manifest);
  writeJson(generatedManifestPath, manifest);

  console.log(`Built ${launchPlan.id}: ${launchPlan.runtimeSeconds}s, ${narration.wordCount} words, ${shots.length} shots, ${audioSegments.length} narration WAVs.`);
  return {manifest, validation, generatedManifestPath};
};

const isMain = process.argv[1] && path.resolve(process.argv[1]) === __filename;
if (isMain) {
  if (process.argv.includes("--validate-only")) {
    const checks = validateTddJestLaunchPlan(launchPlan);
    console.log(`Validated ${launchPlan.id}: ${checks.length} TDD Jest profile checks passed.`);
  } else {
    buildTddJestLaunch();
  }
}
