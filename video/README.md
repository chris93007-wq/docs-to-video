# SDD Orchestrator Video Studio

This project turns structured product content into polished Remotion videos. It includes two supported SDD Orchestrator launch editions and a reusable documentation-to-video compiler:

- **v008** — approved launch narrative and visual system.
- **v009** — Oracle Redwood edition with official brand assets and end slate.
- **v0.8.2** — v008 narrative with synchronized proof from the RX-13603 live SDD demo.

Visible copy for both editions lives in one editable file: [`content/sdd-orchestrator-launch-content.json`](content/sdd-orchestrator-launch-content.json).

## Table of contents

- [Prerequisites](#prerequisites)
- [Capabilities](#capabilities)
- [Getting started](#getting-started)
- [How to use](#how-to-use)
  - [Via Codex](#via-codex)
  - [Via CLI](#via-cli)
- [Editing the launch video](#editing-the-launch-video)
- [Project structure](#project-structure)
- [Validation](#validation)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js 20 or newer.
- npm 10 or newer.
- Approximately 2 GB of free disk space for dependencies, Chromium, and the first Kokoro voice-model download.
- Network access for the first `npm install` and first narration synthesis.
- Optional: `OPENAI_API_KEY` for AI-backed compiler stages. The deterministic `--no-ai` workflow does not require a key.
- Optional: `FFMPEG_PATH` if you prefer a system FFmpeg binary. Otherwise the build discovers Remotion's bundled FFmpeg automatically.

The Oracle assets under `public/brand/oracle/` are intended for authorized internal use. Their source filenames and provenance are documented in `public/brand/oracle/ASSET-SOURCES.md`.

## Capabilities

- Builds and renders the approved v008, Oracle Redwood v009, and live-demo v0.8.2 launch videos.
- Keeps narration, pauses, scene timing, and visual beats synchronized.
- Reuses v008 narration audio for v009 and v0.8.2 without resynthesis.
- Centralizes all bespoke on-screen copy, including FAQs, prompts, lifecycle labels, role lanes, guardrails, and CTAs.
- Provides an isolated brand provider so v009 styling does not change v008.
- Compiles Markdown documentation through structured semantic, story, narration, visual, shot, animation, and render stages.
- Supports deterministic offline compiler fallbacks for testing and iteration.
- Produces inspectable JSON artifacts and Remotion manifests before rendering MP4 output.

## Getting started

From this directory:

```bash
npm install
npm test
npm run typecheck
```

Build the supported launch manifests:

```bash
npm run build:launch-v008
npm run build:launch-v009
npm run build:launch-v0.8.2
```

Open Remotion Studio for interactive previewing:

```bash
npm run studio
```

Select either `SddOrchestratorLaunchV008` or `SddOrchestratorLaunchV009` in Studio.

## How to use

### Via Codex

Codex can edit the shared copy, update visuals, run validation, and render a version. Give it a specific outcome and name the version you want to preserve.

Example: render the Oracle Redwood edition.

```text
Build and render SDD Orchestrator launch v009.
Preserve the approved narration and timing from v008.
Run tests and TypeScript checks, inspect representative stills,
and save the final MP4 under out/.
```

Example: render the live-demo hybrid edition.

```text
Build and render SDD Orchestrator launch v0.8.2.
Preserve the v008 narration and timing exactly.
Use the bundled RX-13603 live-demo proof assets,
inspect the Codex and lifecycle proof beats, and save the MP4 under out/.
```

Example: make a copy change safely.

```text
In content/sdd-orchestrator-launch-content.json,
change the FAQ header from "FAQs" to "Top questions".
Do not change narration or timing.
Rebuild v008 and v009, then render a still of the FAQ scene for review.
```

Example: change a lifecycle label.

```text
Update the workflow label "Jest Unit Tests" to "Jest Tests"
through the shared project content file.
Check for visual overflow in both v008 and v009 and run the full test suite.
```

Example: compile a new document-driven video.

```text
Use the documentation-to-video compiler on fixtures/sdd-orchestrator-launch.md.
Use deterministic fallbacks, inspect the story and shot plans,
validate the experience profile, and do not render an MP4 yet.
```

### Via CLI

Build a supported launch edition:

```bash
npm run build:launch-v008
npm run build:launch-v009
npm run build:launch-v0.8.2
```

Render the final MP4s:

```bash
npm run render:launch-v008
npm run render:launch-v009
npm run render:launch-v0.8.2
```

Outputs:

```text
out/sdd-orchestrator-launch-explainer-new-v008.mp4
out/sdd-orchestrator-launch-explainer-new-v009.mp4
out/sdd-orchestrator-launch-explainer-new-v0.8.2.mp4
```

Compile a Markdown document without rendering:

```bash
npm run compile -- fixtures/sdd-orchestrator-launch.md --no-ai
```

Render a compiler-generated video:

```bash
npm run render:compiler -- fixtures/sdd-orchestrator-launch.md --mp4
```

Run or inspect one compiler stage:

```bash
npm run video -- story fixtures/sdd-orchestrator-launch.md --no-ai
npm run video -- inspect story fixtures/sdd-orchestrator-launch.md
npm run video -- inspect shots fixtures/sdd-orchestrator-launch.md
npm run video -- validate-experience fixtures/sdd-orchestrator-launch.md
```

Clean generated compiler artifacts for one source document:

```bash
npm run video -- clean fixtures/sdd-orchestrator-launch.md
```

Show all compiler commands:

```bash
npm run video -- --help
```

## Editing the launch video

Use these files as the supported editing surface:

- `content/sdd-orchestrator-launch-content.json` — all editable visual copy and project messaging.
- `launch/sdd-orchestrator-launch-v008.mjs` — approved narration, pauses, durations, and media intent.
- `launch/sdd-orchestrator-launch-v009.mjs` — v009-only brand mode and official end-slate metadata.
- `launch/sdd-orchestrator-launch-v0.8.2.mjs` — v0.8.2 live-demo asset mapping and narration-synchronized proof timings.
- `public/demo/sdd-live-v0.8.2/ASSET-SOURCES.md` — source recording and timestamp provenance for each proof asset.
- `src/renderers/remotion/showcases/sdd-orchestrator/` — visual composition and animation code.
- `src/renderers/remotion/showcases/sdd-orchestrator/brand.tsx` — legacy and Oracle Redwood brand providers.

Generated manifests under `src/launch/*.json` should not be edited manually. Rebuild them through the npm scripts.

## Project structure

```text
content/                 Shared project copy
launch/                  Supported v008/v009/v0.8.2 launch plans
compiler/                Documentation-to-video compiler
prompts/                 Compiler-stage prompts
src/launch/              Remotion launch compositions and generated manifests
src/renderers/           Showcase and generic compiler renderers
public/audio/            Versioned narration audio
public/brand/oracle/     Oracle fonts, marks, icons, texture, and end slate
artifacts/                Generated build plans and manifests
out/                      Final MP4 files
test/                     Compiler and launch regression tests
```

## Validation

Run the complete local check set:

```bash
npm test
npm run typecheck
npm run build:launch-v008
npm run build:launch-v009
npm run build:launch-v0.8.2
git diff --check
```

The launch build validates runtime, scene count, narration length, Codex usage, lifecycle content, approval boundaries, evidence, CTA presence, and visual-first composition.

## Troubleshooting

**The first build is slow**

Kokoro downloads its voice model on first use. Later builds reuse the local model and versioned narration WAVs.

**FFmpeg cannot be found**

Run `npm install` again, or set `FFMPEG_PATH` to an FFmpeg executable.

```bash
FFMPEG_PATH=/path/to/ffmpeg npm run build:launch-v008
```

**A text edit does not appear**

Confirm the change is in `content/sdd-orchestrator-launch-content.json`, rebuild the target version, and restart Remotion Studio if it was already open.

**The compiler uses AI when it should not**

Pass `--no-ai` to use deterministic stage fallbacks.
