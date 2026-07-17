# Docs to Video

Turn structured product documentation into polished, narrated videos with Remotion.

This workspace supports two complementary production paths:

1. **Curated showcases** for launch-ready stories with purpose-built scenes, validated copy, synchronized narration, and versioned renders.
2. **The documentation compiler** for turning Markdown into a reusable semantic plan, story, narration, shot list, animation plan, and Remotion composition.

The pipeline is inspectable at every stage, works deterministically without an AI key, and keeps source content separate from generated manifests and final media.

## Quick start

Requirements:

- Node.js 20 or newer
- npm 10 or newer
- About 2 GB of free space for dependencies, Chromium, and the first Kokoro voice-model download
- Network access for the initial install and first narration synthesis

From the `video/` directory:

```bash
npm install
npm test
npm run typecheck
npm run studio
```

Remotion Studio exposes all curated showcases plus the generic `DocumentationCompilerVideo` composition.

## Curated showcases

| Showcase | Composition | Build | Render |
| --- | --- | --- | --- |
| SDD Orchestrator v008 | `SddOrchestratorLaunchV008` | `npm run build:launch-v008` | `npm run render:launch-v008` |
| SDD Orchestrator v009, Oracle Redwood | `SddOrchestratorLaunchV009` | `npm run build:launch-v009` | `npm run render:launch-v009` |
| SDD Orchestrator v0.8.2, Oracle Redwood live-demo hybrid | `SddOrchestratorLaunchV082` | `npm run build:launch-v0.8.2` | `npm run render:launch-v0.8.2` |
| TDD Jest Validation v001 | `TddJestValidationExplainerV001` | `npm run build:tdd-jest-v001` | `npm run render:tdd-jest-v001` |

Build commands validate the launch plan, synthesize or reuse narration, and write generated manifests. Render commands perform the build and then create an H.264 MP4 under `out/`.

### SDD Orchestrator editions

The three SDD editions share the approved v008 narrative while varying presentation and proof:

- **v008** is the baseline launch story and visual system.
- **v009** applies the Oracle Redwood brand treatment and official end slate.
- **v0.8.2** combines the v008 story with Oracle Redwood branding and synchronized evidence from the RX-13603 live SDD run.

Edit shared on-screen copy in [`content/sdd-orchestrator-launch-content.json`](content/sdd-orchestrator-launch-content.json). Timing, narration, and edition-specific metadata live under [`launch/`](launch/).

### TDD Jest Validation

The TDD Jest showcase explains the requirement-backed test gate, the Red-Green-Refactor working loop, evidence and drift checks, and the supported ways engineers can use the workflow.

Its primary editing surfaces are:

- [`content/tdd-jest-validation-v001.json`](content/tdd-jest-validation-v001.json) for structured copy and visual content
- [`launch/tdd-jest-validation-v001.mjs`](launch/tdd-jest-validation-v001.mjs) for narration, timing, source truth, and launch metadata
- [`src/renderers/remotion/showcases/tdd-jest-validation/`](src/renderers/remotion/showcases/tdd-jest-validation/) for scene implementation
- [`public/media/tdd-jest-validation/`](public/media/tdd-jest-validation/) for curated proof media

## Compile a Markdown document

Run the full compiler without rendering:

```bash
npm run compile -- fixtures/sdd-orchestrator-launch.md --no-ai
```

The `--no-ai` flag uses deterministic fallbacks and does not require credentials. To use AI-backed stages, set `OPENAI_API_KEY` and omit the flag.

Render a compiler-generated video:

```bash
npm run render:compiler -- fixtures/sdd-orchestrator-launch.md --mp4
```

By default, the compiler uses Remotion. Motion Canvas can also be selected when supported by the target workflow:

```bash
npm run compile -- docs.md --renderer motion-canvas --no-ai
```

### Work stage by stage

The compiler stages are independently runnable and cached:

```bash
npm run video -- parse docs.md --no-ai
npm run video -- semantic docs.md --no-ai
npm run video -- story docs.md --no-ai
npm run video -- visual docs.md --no-ai
npm run video -- shots docs.md --no-ai
npm run video -- narration docs.md --no-ai
npm run video -- animation docs.md --no-ai
npm run video -- edl docs.md --no-ai
```

Inspect an artifact without rerunning the pipeline:

```bash
npm run video -- inspect story docs.md
npm run video -- inspect shots docs.md
npm run video -- inspect edl docs.md
```

Validate the result against the experience profile:

```bash
npm run video -- validate-experience docs.md --no-ai
```

Force a rebuild, choose a custom artifact directory, or clean one document's generated artifacts:

```bash
npm run compile -- docs.md --no-ai --force
npm run compile -- docs.md --no-ai --artifact-dir artifacts/my-video
npm run video -- clean docs.md
```

See the complete command and flag reference with:

```bash
npm run video -- --help
```

## Work with Codex

Ask for the outcome, identify the edition or source document, and state what must remain unchanged. For example:

```text
Update the SDD Orchestrator FAQ copy in the shared content file.
Do not change narration or timing. Rebuild v008 and v009, run the
validation suite, and render a representative still from each edition.
```

```text
Compile fixtures/sdd-orchestrator-launch.md with deterministic fallbacks.
Inspect the story, shot plan, and experience validation artifacts. Do not
render an MP4 yet.
```

```text
Build and render TDD Jest Validation v001. Preserve the approved runtime,
narration intent, and official end slate. Run tests and type checking before
reporting the output path.
```

## Editing model

Treat source files and generated files differently:

- Edit project copy under `content/`.
- Edit narration, scene timing, validation requirements, and edition metadata under `launch/`.
- Edit React/Remotion visuals under `src/renderers/`.
- Add approved media under `public/` and document its provenance alongside the asset set.
- Do not hand-edit generated manifests under `src/launch/`; rebuild them with the matching npm script.

Narration audio is versioned under `public/audio/` and reused when its inputs have not changed. A changed narration beat triggers synthesis during the next build.

## Project structure

```text
video/
├── content/       Editable structured copy for curated showcases
├── launch/        Narration, timing, validation, and edition metadata
├── compiler/      Markdown-to-video pipeline and renderer adapters
├── prompts/       Instructions for AI-backed compiler stages
├── fixtures/      Example Markdown inputs
├── src/           Remotion compositions, visuals, and generated manifests
├── public/        Narration, brand assets, and proof media
├── artifacts/     Generated plans, validation output, and render manifests
├── test/          Compiler and showcase regression tests
└── out/           Final rendered videos
```

## Validation

Run the standard local checks:

```bash
npm test
npm run typecheck
```

When changing a curated showcase, also run its build command. The build scripts enforce content, runtime, narration, evidence, branding, and composition-specific requirements before writing a new manifest.

For SDD changes that affect shared copy or visuals, validate all three editions:

```bash
npm run build:launch-v008
npm run build:launch-v009
npm run build:launch-v0.8.2
```

For TDD Jest changes:

```bash
npm run build:tdd-jest-v001
```

Before committing documentation or code changes, also run:

```bash
git diff --check
```

## Output names

Curated renders use stable filenames:

```text
out/sdd-orchestrator-launch-explainer-new-v008.mp4
out/sdd-orchestrator-launch-explainer-new-v009.mp4
out/sdd-orchestrator-launch-explainer-new-v0.8.2.mp4
out/tdd-jest-validation-explainer-v001.mp4
```

Compiler renders can be named with `--title`, `--version`, or an explicit `--output` path:

```bash
npm run render:compiler -- docs.md --mp4 --title "Feature Overview" --version v002
npm run render:compiler -- docs.md --mp4 --output out/feature-overview.mp4
```

## Troubleshooting

### The first build is slow

Kokoro downloads its voice model on first use. Later builds reuse the local model and any narration whose inputs are unchanged.

### FFmpeg cannot be found

Re-run `npm install` so the Remotion compositor is available, or point the build at a system binary:

```bash
FFMPEG_PATH=/path/to/ffmpeg npm run build:launch-v008
```

### A copy change does not appear

Confirm that you edited the source file under `content/` or `launch/`, rebuild the target showcase, and restart Remotion Studio if it was already running. Generated files under `src/launch/` are build outputs, not editing surfaces.

### The compiler calls AI unexpectedly

Add `--no-ai` to the command. This selects deterministic stage fallbacks and does not use `OPENAI_API_KEY`.

### Narration changed but audio did not

Run the relevant build again. If you need to bypass cached compiler stages, add `--force`; curated showcase builders compare narration inputs before deciding whether audio can be reused.

## Asset use

Oracle assets under `public/brand/oracle/` are intended for authorized internal use. Source filenames and provenance are recorded in [`public/brand/oracle/ASSET-SOURCES.md`](public/brand/oracle/ASSET-SOURCES.md). Live-demo sources are documented with their corresponding asset sets under `public/demo/`.
