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
  -> Asset Planner
  -> Asset Manifest
  -> Narration Generator
  -> Narration
  -> Animation Planner
  -> Animation Plan
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
```

Run individual stages for debugging:

```bash
npm run video -- parse docs.md
npm run video -- semantic docs.md
npm run video -- story docs.md
npm run video -- visual docs.md
npm run video -- assets docs.md
npm run video -- narration docs.md
npm run video -- animation docs.md
```

Render with the Remotion adapter:

```bash
npm run video -- render docs.md
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
asset-manifest.json
narration.json
animation-plan.json
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
asset.prompt.md
narration.prompt.md
animation.prompt.md
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
- `AssetManifest`
- `Narration`
- `AnimationPlan`
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
npm run render
```

Output:

```text
out/sdd-orchestrator-explainer.mp4
```

The compiler composition renders with:

```bash
npm run render:compiler
```

Output:

```text
out/documentation-video.mp4
```
