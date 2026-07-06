import {FPS, SceneKey, scenes, VIDEO_DURATION_SECONDS} from "../data/timeline";

export const narrationAudioFile = "audio/narration.wav";

export const narrationText = `Spec-Driven Development works best when the spec is not a document on the side. It is the control plane: defining scope, validating work, and keeping evidence connected.

But running that model by hand creates friction. Engineers have to remember which skill to call, when to stop for approval, when to create TDD unit tests, and how implementation returns for final validation. Good intent gets held together by memory.

The SDD orchestrator turns those loose steps into a stateful workflow. Start from a Jira key or feature input, and the coordinator creates a run with status, blockers, pending approvals, artifacts, and events. Codex or the CLI can move deterministic phases forward, but the run stops when a human decision is required.

The canonical path stays visible: requirements intake, design, implementation planning, TDD unit tests, bounded implementation, Playwright requirement validation, and lifecycle update. Each phase registers durable evidence, so the next gate checks run state instead of trusting thread context. If implementation fans out, slices must be reviewed, bounded, and non-overlapping. Fan-in stays serial, with focused checks after each result.

In Codex, the prompt asks the coordinator to run SDD for the Jira issue, register artifacts, capture approvals, create TDD unit tests before product code, and report blockers honestly. In the CLI, the same runtime supports create, auto-run, status, resume, approve, artifacts, manifests, and gate-only commands.

For engineers, the payoff is lower cognitive load and stronger traceability. New adopters get one entry point. Teams get resumable execution, safer parallel work, explicit approval boundaries, drift checks, and evidence from Jira and Confluence through tests and final validation.

The orchestrator does not replace SDD discipline. It makes the discipline runnable. Specs remain the source of truth, workers do bounded work, and the coordinator preserves the trail that lets teams move quickly without losing control.`;

export type NarrationSegment = {
  id: SceneKey;
  startFrame: number;
  endFrame: number;
  text: string;
};

const segmentCopy: Record<SceneKey, string> = {
  intro:
    "Spec-Driven Development works best when the spec is not a document on the side. It is the control plane: defining scope, validating work, and keeping evidence connected.",
  problem:
    "But running that model by hand creates friction. Engineers have to remember which skill to call, when to stop for approval, when to create TDD unit tests, and how implementation returns for final validation. Good intent gets held together by memory.",
  solution:
    "The SDD orchestrator turns those loose steps into a stateful workflow. Start from a Jira key or feature input, and the coordinator creates a run with status, blockers, pending approvals, artifacts, and events. Codex or the CLI can move deterministic phases forward, but the run stops when a human decision is required.",
  workflow:
    "The canonical path stays visible: requirements intake, design, implementation planning, TDD unit tests, bounded implementation, Playwright requirement validation, and lifecycle update. Each phase registers durable evidence, so the next gate checks run state instead of trusting thread context. If implementation fans out, slices must be reviewed, bounded, and non-overlapping. Fan-in stays serial, with focused checks after each result.",
  demo:
    "In Codex, the prompt asks the coordinator to run SDD for the Jira issue, register artifacts, capture approvals, create TDD unit tests before product code, and report blockers honestly. In the CLI, the same runtime supports create, auto-run, status, resume, approve, artifacts, manifests, and gate-only commands.",
  benefits:
    "For engineers, the payoff is lower cognitive load and stronger traceability. New adopters get one entry point. Teams get resumable execution, safer parallel work, explicit approval boundaries, drift checks, and evidence from Jira and Confluence through tests and final validation.",
  outro:
    "The orchestrator does not replace SDD discipline. It makes the discipline runnable. Specs remain the source of truth, workers do bounded work, and the coordinator preserves the trail that lets teams move quickly without losing control.",
};

export const narrationSegments: NarrationSegment[] = scenes.map((scene) => ({
  id: scene.key,
  startFrame: scene.startFrame,
  endFrame: scene.startFrame + scene.durationFrames,
  text: segmentCopy[scene.key],
}));

const wordCount = narrationText.split(/\s+/).filter(Boolean).length;

export const narrationMetadata = {
  estimatedDurationSeconds: VIDEO_DURATION_SECONDS,
  framesPerSecond: FPS,
  wordCount,
  estimatedWordsPerMinute: Math.round(wordCount / (VIDEO_DURATION_SECONDS / 60)),
};
