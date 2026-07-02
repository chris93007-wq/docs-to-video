export const FPS = 30;
export const VIDEO_WIDTH = 1920;
export const VIDEO_HEIGHT = 1080;

export type SceneKey =
  | "intro"
  | "problem"
  | "solution"
  | "workflow"
  | "demo"
  | "benefits"
  | "outro";

export type SceneDefinition = {
  key: SceneKey;
  title: string;
  startFrame: number;
  durationFrames: number;
  transitionFrames: number;
  narrationId: SceneKey;
  assets: string[];
  takeaway: string;
};

const seconds = (value: number) => value * FPS;

export const scenes: SceneDefinition[] = [
  {
    key: "intro",
    title: "Specs as the control plane",
    startFrame: seconds(0),
    durationFrames: seconds(13),
    transitionFrames: seconds(1),
    narrationId: "intro",
    assets: ["source spec", "control plane", "evidence chain"],
    takeaway: "SDD works when the spec controls scope, validation, and evidence.",
  },
  {
    key: "problem",
    title: "The manual workflow is fragile",
    startFrame: seconds(13),
    durationFrames: seconds(16),
    transitionFrames: seconds(1),
    narrationId: "problem",
    assets: ["skills", "scripts", "approvals", "gates"],
    takeaway: "Without orchestration, adoption depends on memory and thread context.",
  },
  {
    key: "solution",
    title: "One stateful run",
    startFrame: seconds(29),
    durationFrames: seconds(16),
    transitionFrames: seconds(1),
    narrationId: "solution",
    assets: ["run state", "blockers", "approvals", "artifacts", "events"],
    takeaway: "The coordinator creates a durable run that knows what happened and what is next.",
  },
  {
    key: "workflow",
    title: "Canonical phases, visible evidence",
    startFrame: seconds(45),
    durationFrames: seconds(24),
    transitionFrames: seconds(1),
    narrationId: "workflow",
    assets: ["requirements", "design", "planning", "Jest", "implementation", "Playwright", "lifecycle"],
    takeaway: "Every phase registers evidence before the next gate trusts it.",
  },
  {
    key: "demo",
    title: "Codex and CLI, same runtime",
    startFrame: seconds(69),
    durationFrames: seconds(18),
    transitionFrames: seconds(1),
    narrationId: "demo",
    assets: ["Codex prompt", "CLI commands", ".sdd-runtime"],
    takeaway: "Codex and the CLI drive the same event-sourced coordinator runtime.",
  },
  {
    key: "benefits",
    title: "What engineers gain",
    startFrame: seconds(87),
    durationFrames: seconds(12),
    transitionFrames: seconds(1),
    narrationId: "benefits",
    assets: ["lower cognitive load", "traceability", "safe fan-out", "resumability"],
    takeaway: "The workflow gets easier to start, resume, audit, and scale.",
  },
  {
    key: "outro",
    title: "Run the discipline",
    startFrame: seconds(99),
    durationFrames: seconds(6),
    transitionFrames: seconds(1),
    narrationId: "outro",
    assets: ["source of truth", "bounded workers", "coordinator trail"],
    takeaway: "Specs stay true, workers stay bounded, and evidence stays connected.",
  },
];

export const VIDEO_DURATION_FRAMES = scenes.reduce(
  (max, scene) => Math.max(max, scene.startFrame + scene.durationFrames),
  0,
);

export const VIDEO_DURATION_SECONDS = VIDEO_DURATION_FRAMES / FPS;
