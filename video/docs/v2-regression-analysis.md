# V2 Regression Analysis

The compiler architecture is valuable and should stay. The regression is experiential: current compiler-generated video artifacts do not preserve the pacing, density, motion vocabulary, or visual specificity of the v1 explainer.

## Current V2 Behavior

The checked-in compiler render manifest currently produces a single 18-second scene. The rendered `documentation-video.mp4` reports 18.048 seconds and 540 video frames. The scene is a generic compiler overview with a title, teaching point, metaphor text, and simple pipeline/network layout.

The deterministic compiler fallback produces a better but still insufficient plan: 6 scenes, 95 seconds, generic purposes, generic visual types, and renderer-neutral animation intent such as `draw`, `pop`, and `fade`.

## Regressions Against V1

- Pacing: V1 is 105 seconds with 7 scenes; current generated output can collapse to one scene or a 6-scene summary.
- Scene density: V1 gives each scene a strong visual idea; V2 scenes can become title, teaching point, metaphor, and generic nodes.
- Animation richness: V1 uses path drawing, progressive node activation, line-by-line terminals, readouts, camera shifts, and overlapping reveals. V2 mostly animates opacity, scale, or a simple rail.
- Visual metaphor usage: V1 metaphors are concrete and system-shaped. V2 names metaphors but does not bind them to reusable visual primitives.
- Camera movement: V1 uses push, rise, shift, scale, and rail motion. V2 can use `steady-focus` and has no validation against static scenes.
- Diagram animation: V1 diagrams draw paths and reveal evidence. V2 diagrams are mostly generated as static card/node layouts.
- Terminal animation: V1 has a dedicated animated terminal/code scene. V2 has no terminal primitive or command-aware requirement.
- Narration density: V1 is 297 words over 105 seconds. V2 fallback narration can sound like compiler meta-commentary and may spend words saying it is not repeating the document.
- Text heaviness: V2 puts title, teaching point, and metaphor copy on screen. This makes the frame feel like a slide.
- Slide-like structure: V2 scenes can follow generic problem/pain/solution/benefits framing without enough visual progression.
- Generic layouts: V2 renderer only chooses between a simple pipeline and network.
- Lack of continuous motion: V2 has no rule preventing long static holds.
- Lack of SVG path animation: V2 renderer has no path-draw library.
- Lack of morphing/progressive reveal: V2 has simple reveals, but no explicit morphing layouts or focus choreography.

## Concrete Changes Needed

1. Add a golden experience profile that encodes the v1 creative contract as data.
2. Update story planning to target 7 to 9 scenes, 90 to 120 seconds, and the v1 story arc: hook, problem, pain, solution, guided workflow, benefits, developer experience, conclusion.
3. Update visual planning so every scene selects a real visual primitive, motion style, metaphor, camera intent, density, and text-density target.
4. Update narration generation to produce 220 to 300 words in a polished engineering explainer voice, without section-by-section phrasing.
5. Update animation planning to require primary/secondary animated objects, camera movement, transition in/out, progressive reveal timing, focus highlights, and path or diagram animation where appropriate.
6. Add validation that rejects plans that are too short, too long, too sparse, text-only, bullet-heavy, static, missing camera movement, or missing required workflow/path/terminal coverage.
7. Create a Remotion visual language library based on v1 patterns: workflow rails, path draw, gates, stateful run graph, terminal sequence, connected nodes, benefit cards, camera rails, progressive highlights, and scene transitions.
8. Update the renderer so it maps `visualPrimitive + animationPlan + scene data` to those reusable components.
9. Add the SDD Orchestrator documentation fixture and validate it against the golden profile.
10. Update README and CLI scripts so developers can compile, inspect, validate, and render while seeing why a plan feels presentation-like.

## Architectural Boundary

The renderer should not decide the story. It should only render the visual primitive, scene data, assets, and animation intent selected by compiler stages. The planner should not emit React or SVG code. The schema needs enough shared vocabulary for the compiler and renderer to meet in the middle without collapsing into a presentation generator.
