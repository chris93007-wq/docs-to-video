# V1 Golden Reference

The original `SddOrchestratorExplainer` composition is the creative benchmark for the compiler implementation. It is not just an old renderer path; it defines the target pacing, density, motion vocabulary, and engineering-focused storytelling.

## Core Metrics

- Scene count: 7 scenes (`intro`, `problem`, `solution`, `workflow`, `demo`, `benefits`, `outro`).
- Total runtime: 105 seconds in the Remotion timeline; the rendered MP4 reports 105.045 seconds.
- Average scene duration: 15 seconds.
- Narration word count: 297 words.
- Approximate words per minute: about 170 WPM.
- Major animated visual sequences: 7, one strong animated idea per scene.
- SVG/path animation sequences: at least 5 major path-draw moments: brand mark ring, two tangled problem paths, stateful run connectors, workflow rail, and gate connector rows.
- Camera/composition moves: at least 7 scene-level moves, including push-ins, rise-ins, rail pan/shift, window lifts, card rises, center scale, and transition fades.
- Transitions: every scene fades in/out through `SceneFrame`; the sequence also uses visual match continuity through shared grids, pills, diagram vocabulary, and animated reveals.
- On-screen text per scene: low to moderate. Most scenes have an eyebrow, title, short subtitle, plus 3 to 6 labels. Text supports the visual rather than replacing it.

## Scene Structure

The story arc is compact and deliberate:

1. Hook: the spec becomes the control plane.
2. Problem: manual SDD depends on memory.
3. Solution: the orchestrator creates a stateful run.
4. Guided workflow: phases and gates become visible.
5. Developer experience: Codex and CLI share one runtime.
6. Benefits: cognitive load, traceability, onboarding, resumability, and safe fan-out.
7. Conclusion: the orchestrator makes SDD discipline runnable.

The structure does not follow documentation order. It teaches the operating model in the order an engineer needs to understand it.

## Visual Metaphors

V1 succeeds because each scene has a visual metaphor with motion:

- Control plane: a pulsing SVG brand mark with scope, validation, and evidence orbiting the idea.
- Fragile manual process: crossing, tangled paths behind decision cards.
- Stateful run: central run node with animated connectors to status, blockers, approvals, artifacts, and events.
- Canonical workflow: a drawn rail with progressive phase activation and a gate close-up.
- Shared runtime: two terminal/code windows feeding an event-sourced `.sdd-runtime` strip.
- Benefits: capability cards plus readouts for adoption friction, evidence continuity, and parallel work safety.
- Outro: the brand mark returns, scaled down and focused on the final takeaway.

## Animation Primitives Used

The Remotion implementation uses a small but expressive vocabulary:

- `Sequence` for scene timing.
- `AbsoluteFill` for full-frame composition.
- `useCurrentFrame()` for frame-level control.
- `interpolate()` for opacity, translation, scale, rail progress, and path timing.
- `spring()` through `softSpring()` for organic scale-in.
- SVG `strokeDasharray` and `strokeDashoffset` for path drawing.
- Progressive reveal through `sequenceOpacity()`.
- Scene fade-in/fade-out through `SceneFrame`.
- Grid background and subtle gradients to keep the frame technical and modern.
- Animated cards, pills, readouts, terminal rows, and diagram nodes.

## Terminal And Code Visuals

The demo scene treats terminal/code content as an animated system interaction, not a text slide. Codex instructions and CLI commands reveal line by line, then connect visually to a shared `.sdd-runtime` event strip. The commands are specific enough for engineers, but the runtime strip gives them a story function: both interfaces write to the same event-sourced state.

## Workflow Diagram Animation

The workflow scene uses an SVG rail drawn over time, nodes that activate progressively, and a late scene shift to reveal a gate diagram. The gate is not static: evidence rows slide toward the gate from both sides. This makes validation feel like a mechanism instead of a bullet list.

## Benefits Presentation

Benefits are presented as capabilities forming an operating model. Five benefit cards appear in sequence, then quantified readouts reinforce the effect. The scene avoids a generic "benefits slide" by combining cards, icons, and metrics into a compact engineering dashboard.

## Intro And Outro Pacing

The intro spends 13 seconds establishing the core idea, with the brand mark animating before the supporting copy and pills appear. The outro is only 6 seconds: it reprises the brand mark, states the final thesis, and exits before the message loses energy. This asymmetry is important: V1 earns time in the workflow and demo scenes, then finishes decisively.

## Why V1 Works

V1 feels like a polished engineering explainer because it combines high narration density with low on-screen text density. Each scene has one strong visual job, and the visuals keep moving: paths draw, cards rise, terminals type in, rails shift, gates assemble, and the camera subtly reframes. The viewer is not asked to read a deck; they are guided through a system.
