# SDD Orchestrator

Spec-Driven Development works best when the spec is not a document on the side. It is the control plane for scope, validation, and evidence. The SDD Orchestrator makes that discipline runnable by turning Jira or feature input into a stateful workflow that Codex and the CLI can both advance.

## Manual SDD Is Fragile

Running SDD by hand creates friction. Engineers have to remember which skill to call, when design approval is required, when to create TDD unit tests, how implementation should fan out, and how final validation returns to the requirement.

- Choose the right skill for the current phase.
- Register durable artifacts instead of local-only notes.
- Stop for human approval before implementation.
- Create TDD unit tests before product code.
- Validate requirements with browser checks before lifecycle updates.

## Stateful Run

The coordinator creates a durable run with status, blockers, pending approvals, artifacts, and events. Deterministic phases can move forward automatically, but the run stops whenever a human decision is required.

## Canonical Workflow

1. Requirements intake from Jira or feature input.
2. Design authoring and design approval.
3. Implementation planning and Unit Test Target Plan.
4. TDD unit tests.
5. Bounded implementation slices.
6. Browser-based requirement validation.
7. Lifecycle update with evidence.

Each phase registers evidence before the next gate trusts it. If implementation fans out, slices must be reviewed, bounded, and non-overlapping. Fan-in remains serial, with focused checks after each result.

## Developer Experience

Codex and the CLI use the same runtime. Codex can ask the coordinator to run SDD for a Jira issue, register artifacts, capture approvals, create TDD unit tests before product code, and report blockers honestly.

```bash
npm run sdd -- create --jira RX-12345
npm run sdd -- auto-run --run <runId>
npm run sdd -- status --run <runId>
npm run sdd -- approve design --run <runId>
npm run sdd -- manifest run --gate-only
```

## Engineering Payoff

The orchestrator lowers cognitive load for new adopters and gives teams stronger traceability. Work becomes easier to start, inspect, resume, audit, and scale. Approval boundaries are explicit, parallel work is safer, drift checks are visible, and evidence connects Jira and Confluence through tests and final validation.

The orchestrator does not replace SDD discipline. It makes the discipline runnable: specs stay true, workers stay bounded, and evidence stays connected.
