# Documentation-to-Video Compiler

This project still contains the original SDD Orchestrator Remotion explainer, but it now also includes a modular documentation-to-video compiler.

The compiler treats documentation as source code and the rendered video as a compiled artifact. Each stage receives structured JSON, returns structured JSON, validates its output, and can be executed independently from the CLI.

## Pipeline

```text
Input Document
  -> Document Parser
  -> Document AST
  -> Semantic Analyzer
  -> Semantic Model
  -> Story Planner
  -> Story Plan
  -> Visual Director
  -> Visual Plan
  -> Shot Planner
  -> Shot Plan
  -> Media Mix Planner
  -> Media Mix Plan
  -> Asset Planner
  -> Asset Manifest
  -> Narration Generator
  -> Narration
  -> Animation Planner
  -> Animation Plan
  -> Edit Decision List
  -> Renderer Adapter
  -> Remotion / Motion Canvas manifest
  -> MP4
```

The renderer never decides what to teach. The AI stages never emit React, Remotion, Motion Canvas, or SVG code.

## Commands

Install dependencies once:

```bash
npm install
```

Run the full compiler without rendering an MP4:

```bash
npm run video -- compile docs.md
npm run compile -- docs.md
```

Run individual stages for debugging:

```bash
npm run video -- parse docs.md
npm run video -- semantic docs.md
npm run video -- story docs.md
npm run video -- visual docs.md
npm run video -- shots docs.md
npm run video -- media docs.md
npm run video -- assets docs.md
npm run video -- narration docs.md
npm run video -- animation docs.md
npm run video -- edl docs.md
```

Render with the Remotion adapter:

```bash
npm run video -- render docs.md
npm run render -- docs.md
```

Skip the MP4 render while still producing the Remotion render manifest:

```bash
npm run video -- render docs.md --no-mp4
```

Inspect artifacts:

```bash
npm run video -- inspect semantic docs.md
npm run video -- inspect visual docs.md
npm run video -- inspect story docs.md
npm run video -- inspect shots docs.md
npm run video -- inspect media docs.md
npm run video -- inspect edl docs.md
npm run inspect -- animation docs.md
```

Validate the experience profile without rendering:

```bash
npm run validate-experience -- docs.md
```

Clean artifacts:

```bash
npm run video -- clean docs.md
```

Use deterministic offline fallbacks instead of AI:

```bash
npm run video -- compile docs.md --no-ai
```

## Artifacts

Stage outputs are written under:

```text
artifacts/<document-slug>/
```

Important files:

```text
document-ast.json
semantic-document.json
story-plan.json
visual-plan.json
shot-plan.json
media-mix-plan.json
asset-manifest.json
narration.json
animation-plan.json
edit-decision-list.json
experience-validation.json
render-manifest.json
.semantic.cache.json
.story.cache.json
.visual.cache.json
```

Every stage hashes its structured input plus prompt or renderer version. If the hash matches its cache file, the compiler skips regeneration and reuses the validated artifact.

## Prompts

Stage prompts live in `prompts/`:

```text
semantic.prompt.md
story.prompt.md
visual.prompt.md
shots.prompt.md
media-mix.prompt.md
asset.prompt.md
narration.prompt.md
animation.prompt.md
edit.prompt.md
```

Each prompt has a `Prompt-Version` header. Prompt content is included in the stage cache key, so prompt edits invalidate only the stages that depend on that prompt.

## AI Layer

The compiler uses `compiler/ai/openai-client.mjs` as the only OpenAI-specific layer. It supports:

- GPT-5 by default through `OPENAI_MODEL`
- structured JSON outputs
- temperature via `OPENAI_TEMPERATURE`
- retries via `OPENAI_MAX_RETRIES`
- simple rate limiting via `OPENAI_MIN_INTERVAL_MS`
- prompt versioning through prompt file hashes

Set `OPENAI_API_KEY` to enable AI-backed stages. Without a key, stages use deterministic fallbacks so CLI debugging and tests still work.

To add another provider, implement a client with the same `generateJson({stageName, prompt, schema, input})` shape and pass it into the pipeline.

## Schemas

Intermediate representation schemas live in `compiler/schemas.mjs`.

Schemas exist for:

- `DocumentAST`
- `SemanticDocument`
- `StoryPlan`
- `VisualPlan`
- `ShotPlan`
- `MediaMixPlan`
- `AssetManifest`
- `Narration`
- `AnimationPlan`
- `EditDecisionList`
- `RenderManifest`

Each stage validates before writing its artifact. Bad JSON fails early instead of reaching the renderer.

## Renderer Adapters

Renderer contracts live in `compiler/renderers/`.

Implemented adapters:

- `RemotionRenderer`
- `MotionCanvasRenderer`

The Remotion adapter writes:

```text
src/compiler/generated/render-manifest.json
```

The new Remotion composition `DocumentationCompilerVideo` consumes that manifest. The original `SddOrchestratorExplainer` composition remains available for backwards compatibility.

To switch renderers:

```bash
npm run video -- compile docs.md --renderer motion-canvas
```

To add a renderer, implement `RendererAdapter.render(inputs, options)` and return a validated `RenderManifest`.

## From Scenes to Shots

Scenes decide what the video teaches. Shots decide how the video is edited.

The compiler keeps scene-level artifacts for backward compatibility, but the default render path is now shot-based:

```text
StoryPlan
  -> VisualPlan
  -> ShotPlan
  -> MediaMixPlan
  -> AssetManifest
  -> Narration
  -> AnimationPlan
  -> EditDecisionList
  -> RenderManifest
```

`shot-plan.json` breaks each scene into multiple timed editorial beats. For a 90-120 second explainer, the validator expects 25-45 total shots, 3-6 shots per scene, and average shot duration between 2 and 5 seconds.

`media-mix-plan.json` assigns exactly one primary media type to each shot, such as `source-excerpt`, `ui-mockup`, `terminal`, `workflow-animation`, `diagram`, `metaphor-visual`, `kinetic-text`, `icon-card`, or `transition`.

`edit-decision-list.json` converts shots into contiguous frame-based cuts. The Remotion renderer uses EDL decisions when present and falls back to the older one-sequence-per-scene rendering when no EDL is present.

Shot-based rendering includes simple production components for source closeups, Codex/product UI mockups, terminal demos, workflow-wide shots, diagram builds, callout inserts, metaphor visuals, kinetic titles, and shot transitions. These are intentionally renderer-owned React components; AI stages still emit only structured JSON intent.

To debug output that feels like a presentation deck:

```bash
npm run video -- inspect shots docs.md
npm run video -- inspect media docs.md
npm run video -- inspect edl docs.md
npm run validate-experience -- docs.md
```

Look for too few shots, long shot durations, repeated media types, missing source excerpts, missing UI/Codex proof shots, missing workflow animations, missing terminal/demo shots when commands exist, or EDL decisions that do not cover every shot.

## Golden Experience Profile

The original `SddOrchestratorExplainer` is the creative benchmark. The compiler is still modular, typed, cached, and inspectable, but generated videos should feel like a compact engineering explainer rather than a presentation deck.

The golden profile lives in:

```text
compiler/experience/goldenExperienceProfile.mjs
src/compiler/experience/goldenExperienceProfile.ts
```

It encodes the v1-style defaults:

- 90 to 120 second runtime, target 105 seconds.
- 220 to 300 narrated words.
- 7 to 9 scenes with a story arc of hook, problem, pain, solution, guided walkthrough, benefits, developer experience, and conclusion.
- Low on-screen text density, high motion density, animated diagrams, SVG-first visuals, path drawing, progressive reveal, camera movement, terminal animation, and no stock imagery.

The experience validator lives in:

```text
compiler/experience/validateExperience.mjs
src/compiler/experience/validateExperience.ts
```

It prevents slide-deck regressions by checking runtime, scene count, narration word count, visual primitives, camera movement, animation instructions, static holds, workflow coverage, path animation coverage, terminal coverage when commands appear in the source document, total shot count, shots per scene, average shot duration, media variety, repeated media runs, source closeups, UI proof shots, workflow shots, terminal shots, shot-level animation, and EDL coverage. Validation runs automatically before rendering and writes `experience-validation.json`.

The Remotion visual language library lives in:

```text
src/renderers/remotion/visual-language/
```

Reusable primitives include workflow rails, gates, connected node graphs, terminal sequences, document clouds, benefit cards, traceability chains, path drawing, progressive highlights, camera rails, and scene transitions. To add a new primitive:

1. Add a component under `src/renderers/remotion/visual-language/`.
2. Add its name to `goldenExperienceProfile.visualPrimitives`.
3. Add it to `visualPrimitiveSchema` in `compiler/schemas.mjs`.
4. Register it in `src/renderers/remotion/visual-language/index.tsx`.
5. Teach `compiler/stages/visual.mjs` when to select it.
6. Add validator coverage if the primitive satisfies a required experience metric.

Tune the profile only when the intended viewer experience changes. Do not lower the profile to make a weak plan pass; inspect `story`, `visual`, `animation`, and `experience` artifacts to see why the generated video feels presentation-like.

## Document Sources

The parser currently supports Markdown, README-style Markdown, RFC-like text, and simple HTML/Confluence exports. Extend `compiler/stages/parser.mjs` to add a new source reader, then keep its output contract as `DocumentAST`.

The parser must preserve structure. It should not summarize or interpret.

## Testing

Run unit and golden tests:

```bash
npm test
```

Typecheck Remotion and TypeScript files:

```bash
npm run typecheck
```

The tests cover parser preservation, schema validation, prompt output validation boundaries, renderer adapters, CLI behavior, cache reuse, and golden summaries for semantic, story, visual, and animation artifacts.

## Legacy Render

The original video still renders with:

```bash
npm run render:v1
```

Output:

```text
out/sdd-orchestrator-explainer.mp4
```

The compiler composition renders through the compiler CLI with versioned filenames:

```bash
npm run video -- render fixtures/sdd-orchestrator-launch.md --mp4 --title "SDD Orchestrator: Making SDD Easier to Run"
```

Output filenames are derived from the title and auto-incremented per title:

```text
out/sdd-orchestrator-making-sdd-easier-to-run-v001.mp4
```

Each successful MP4 render is recorded in `out/render-versions.json`. Pass
`--version <tag>` to choose a version label, or `--output <path>` to write to an
explicit MP4 path. Interactive MP4 renders prompt for a title when one is not
provided.

The `render:compiler` script is a shorthand for the compiler render command:

```bash
npm run render:compiler -- fixtures/sdd-orchestrator-launch.md --mp4 --title "SDD Orchestrator: Making SDD Easier to Run"
```
