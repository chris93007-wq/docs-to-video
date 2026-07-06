# V002 Quality Regression

The shot-based v002 render was technically more sophisticated than the v1 benchmark, but the viewer experience was worse. The failure was not ShotPlan, MediaMixPlan, or EDL as concepts. The failure was using EDL decisions as permission to render every shot as a separate generic full-screen layout.

## What V1 Did Better

V1 used a small number of memorable set pieces. Each scene had a dominant visual idea: a large intro mark, a tangled manual workflow, a stateful run diagram, a workflow rail, Codex/CLI runtime proof, benefit cards, and a focused CTA. The compositions used scale, hierarchy, path drawing, progressive reveal, and camera movement.

V1 also kept the scene visually coherent over time. Motion happened inside a scene, so the viewer could watch an idea develop instead of repeatedly re-orienting to a new generic card.

## What V002 Got Wrong

V002 cut between many weak independent shots. Most shots were centered cards, small proof panels, or document/source cards on a pale canvas. The result felt like a generated presentation rather than a produced explainer.

The main regressions were:

- Too much empty white space, which made frames feel unfinished.
- Repeated centered cards, which made the output feel template-driven.
- Tiny UI mockups, which made demo/proof moments emotionally weak and hard to inspect.
- Bottom captions carrying too much meaning, because the visuals were not expressive enough.
- Weak hierarchy, with no strong hero object in many shots.
- Repetitive source-document closeups, where grounding became static thumbnails.
- Literal shot rendering, where more cuts did not produce better editorial energy.
- Underpowered visual primitives, closer to wireframes than rich explainer scenes.
- No memorable set pieces comparable to the v1 workflow rail or stateful run diagram.

## Product Impact

The intended audience should leave thinking the SDD Orchestrator is easier, safer, more repeatable, and worth trying. V002 made the workflow look smaller and more abstract than it is. Instead of making the product feel adoptable, it made the product feel like animated documentation.

The visual system must do more of the persuasion. A viewer should understand the hook, command-center idea, approval pause, workflow path, evidence chain, and CTA without relying on captions.

## Repair Direction

The renderer should use the shot layer as an editing/timing layer, not as a generic layout generator.

Bad behavior:

```text
EDL item -> generic CompilerShot -> small card on white canvas
```

Better behavior:

```text
Scene archetype -> rich v1-style set piece -> ShotPlan/EDL controls internal timing
```

For the SDD Orchestrator video, the renderer should use a curated showcase path with seven strong scene components. Each component should consume the scene shots and EDL timing internally to control reveals, camera beats, phase highlights, source transformations, UI proof moments, gates, and transitions.

Generic compiler rendering can remain available for drafts and other documents. The SDD launch video should use the showcase renderer.
