# SDD Orchestrator

## Purpose

Spec-Driven Development works best when the spec is not a document on the side. It is the control plane for scope, implementation, validation, and evidence.

The SDD Orchestrator turns separate SDD skills, scripts, approvals, and gates into one stateful workflow. It orders the phases, records what happened, stops when human input is required, and keeps requirements, design, implementation, and validation evidence connected.

## Why It Matters

Without an orchestrator, the workflow is distributed across prompts, artifacts, approvals, tests, implementation handoffs, and final validation. Developers have to reconstruct the sequence, confirm which evidence was registered, and determine whether the next gate is actually clear.

The orchestrator is the usability layer for SDD. It makes the approved workflow easier to start, easier to resume, and easier to audit. Specs remain the source of truth, Codex or CLI workers execute bounded work, and the coordinator owns the evidence trail.

## Canonical Workflow

1. Requirements intake from Jira or Confluence source material.
2. Design authoring and design approval.
3. Implementation planning and Unit Test Target Plan.
4. TDD unit tests.
5. Bounded implementation slices.
6. Browser-based requirement validation.
7. Lifecycle update with evidence.

Each phase registers evidence before the next gate trusts it. If implementation fans out, slices must be reviewed, bounded, and non-overlapping. Fan-in remains serial, with focused checks after each result.

## Benefits

- Lower cognitive load: engineers do not need to remember every SDD phase, skill, script, and gate by hand.
- Easier onboarding: new adopters can start from one prompt or one CLI command.
- Less tribal knowledge: inputs, approvals, artifacts, blockers, and child results are recorded in run state.
- Repeatable phase order: the run follows requirements intake, design, planning, TDD unit tests, implementation, browser validation, and lifecycle update.
- Safer parallel work: implementation can fan out only when slices are reviewed, bounded, non-overlapping, and ready for fan-in.
- Resumable execution: runs can be inspected, resumed, restarted at a phase boundary, or advanced after approval.
- Stronger traceability: the same run ties Jira and Confluence source material to requirements, design, Unit Test Target Plan, TDD test baseline, implementation slices, drift checks, validation evidence, and final status.

## Capabilities

- Run creation and status: create an SDD run from Jira or feature input and expose state, blockers, approvals, and artifacts.
- Auto-run and resume: run deterministic phases when possible and stop at human approval or clarification boundaries.
- Approval capture: record design and implementation-plan approvals as explicit run events.
- Artifact registration: register durable and local-only artifacts so later gates verify source truth.
- Phase execution: map phases to requirements intake, design authoring, implementation planning, validation, and lifecycle update skills.
- Child planning and fan-in: plan implementation children, track starts and results, and fan in one result set at a time.
- Gate execution: run final validation using unit-test readiness, implementation drift checks, and browser-based requirement traceability.
- Dashboard evidence: project run state into dashboard artifacts so progress, blockers, and events are visible beyond the active thread.
- Codex and CLI support: support Codex app workflows and local CLI workflows from the same coordinator runtime.

## What It Guards Against

- Scope creep by tying active work to reviewed requirements.
- Skipped approvals by stopping at design and implementation-plan boundaries.
- Ambiguous handoffs by turning outputs, questions, child assignments, and blockers into explicit state.
- Missing requirement traceability by maintaining the evidence chain from Jira and Confluence through requirements, design, tests, implementation, and final validation.
- Skipped TDD evidence by requiring a reviewed Unit Test Target Plan and baseline expectations.
- Implementation drift by checking changed source paths against reviewed implementation scope.
- Uncoordinated child work by only fanning out eligible, non-overlapping slices.
- Fabricated or stale evidence by requiring registered artifacts, baselines, child results, and final gates.
- Stalled loops by preserving current state and returning control to the coordinator when a phase cannot complete safely.

## How To Use

Use the orchestrator for full feature work, resumed SDD work, multi-slice implementation, or any feature where traceability and approval checkpoints matter.

Via Codex:

```text
Run SDD for RX-12345 in pharmacy-ui. Use the SDD coordinator.

Start from requirements intake, register durable artifacts, and stop for required approvals.
Create TDD unit tests before product code.
Fan out implementation slices only after the implementation plan is approved.
Run drift checks after product source edits.
Finish with unit-test validation, browser traceability, lifecycle update, and blockers plus next actions.
```

Via CLI:

```bash
npm run sdd -- create --jira RX-12345 --feature-slug <featureSlug> --fix-version <fixVersion>
npm run sdd -- auto-run --jira RX-12345 --fix-version <fixVersion>
npm run sdd -- auto-run --run <runId>
npm run sdd -- status --run <runId>
npm run sdd -- resume --run <runId>
npm run sdd -- approve design --run <runId> --approved-by <user>
npm run sdd -- approve plan --run <runId> --approved-by <user>
npm run sdd -- artifact add --run <runId> --path <path> --role <role> --retention repo
npm run sdd -- children plan-from-manifest --run <runId> --feature <featureSlug> --driver cli-exec
npm run sdd -- manifest run --run <runId> --driver cli-exec
npm run sdd -- manifest run --run <runId> --gate-only
```

## Launch Takeaway

The orchestrator does not replace SDD discipline. It makes the discipline runnable. The skills are already in the repo, so teams can try it on the next feature: start one run, inspect status, approve gates, and let the source of truth stay connected to the work.

## Source

Confluence source page: https://confluence.oraclecorp.com/confluence/display/OPDE/SDD+Orchestrator%3A+Making+Spec-Driven+Development+Easier+to+Run
