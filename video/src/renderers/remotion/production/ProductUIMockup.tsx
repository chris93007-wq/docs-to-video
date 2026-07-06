import {AbsoluteFill, interpolate} from "remotion";
import {theme} from "../../../styles/theme";
import {clamp} from "../../../utils/animation";
import {panelStyle, SmallLabel, useShotMotion} from "./helpers";
import type {ProductionShotProps} from "./types";

const proofByScene: Record<string, {
  chapter: string;
  status: string;
  prompt: string;
  branch: string;
  rows: Array<{meta: string; body: string; tag?: string}>;
}> = {
  solution: {
    chapter: "Stateful coordinator",
    status: "RUN_CREATED",
    prompt: "Run SDD for RX-13603 in pharmacy-ui. Use the SDD coordinator.",
    branch: "codex/run-sdd-for-rx13603",
    rows: [
      {meta: "Searched code, ran 3 commands", body: "No resumable run exists, so Codex creates durable coordinator state.", tag: ".sdd-runtime"},
      {meta: "Listed files, ran a command", body: "Fresh run created as rx-13603-mqiqyqd4 with approvals, artifacts, and event log.", tag: "run.json"},
      {meta: "Coordinator status", body: "Current phase is parked before requirements intake approval.", tag: "WAITING_FOR_REQUIREMENTS_INPUT"},
    ],
  },
  workflow: {
    chapter: "Gathering requirements",
    status: "APPROVAL_REQUIRED",
    prompt: "Start from requirements intake. Register durable artifacts. Stop for approvals.",
    branch: "codex/run-sdd-for-rx13603",
    rows: [
      {meta: "Source intake", body: "Jira and Confluence intent are preserved as the run source of truth.", tag: "source truth"},
      {meta: "Approval boundary", body: "Codex stops at the required supplementary-artifact approval.", tag: "approval"},
      {meta: "Next action", body: "Continue only after the team approves the pending input.", tag: "blocked safely"},
    ],
  },
  benefits: {
    chapter: "Evidence summary",
    status: "TRACEABLE",
    prompt: "Finish with lifecycle update and evidence summary.",
    branch: "codex/run-sdd-for-rx13603",
    rows: [
      {meta: "Artifacts", body: "Requirements, design, test plan, implementation slices, and validation stay linked.", tag: "evidence"},
      {meta: "Visibility", body: "The dashboard can be regenerated from durable run state.", tag: "dashboard"},
      {meta: "Resume", body: "A later Codex session can pick up from the recorded blocker and next action.", tag: "resumable"},
    ],
  },
  "developer-experience": {
    chapter: "Codex guided run",
    status: "READY_TO_RESUME",
    prompt: "Create TDD unit tests first, then fan out approved implementation slices.",
    branch: "codex/run-sdd-for-rx13603",
    rows: [
      {meta: "Prompt interpreted", body: "Codex maps the request to the SDD coordinator workflow.", tag: "coordinator"},
      {meta: "Gate respected", body: "Implementation waits until the plan has human approval.", tag: "approval"},
      {meta: "Validation queued", body: "Playwright proof runs after implementation and closes the evidence loop.", tag: "Playwright"},
    ],
  },
};

const fallbackProof = proofByScene.solution;
const tinyText = {fontSize: 16, lineHeight: 1.2, fontWeight: 700, letterSpacing: 0};

export const ProductUIMockup = ({shot}: ProductionShotProps) => {
  const {progress, enter} = useShotMotion();
  const highlight = interpolate(progress, [0.25, 0.55], [0, 1], clamp);
  const proof = proofByScene[shot.sceneId] ?? fallbackProof;

  return (
    <AbsoluteFill style={{padding: "86px 118px"}}>
      <div style={{...panelStyle, overflow: "hidden", transform: `scale(${0.965 + enter * 0.035})`, minHeight: 800}}>
        <div style={{height: 58, background: "#EEF3F8", display: "flex", alignItems: "center", gap: 10, padding: "0 22px"}}>
          <span style={{width: 12, height: 12, borderRadius: 99, background: theme.colors.red}} />
          <span style={{width: 12, height: 12, borderRadius: 99, background: theme.colors.gold}} />
          <span style={{width: 12, height: 12, borderRadius: 99, background: theme.colors.teal}} />
          <span style={{...theme.typography.small, marginLeft: 18, color: theme.colors.ink, fontWeight: 760}}>Run SDD for RX-13603</span>
          <span style={{...theme.typography.small, marginLeft: "auto", color: theme.colors.muted}}>Codex coordinator</span>
        </div>
        <div style={{display: "grid", gridTemplateColumns: "1fr 360px", minHeight: 740}}>
          <div style={{padding: 36, borderRight: "1px solid rgba(175,192,214,0.45)", display: "flex", flexDirection: "column", gap: 18}}>
            <div style={{border: "1px solid rgba(175,192,214,0.45)", borderRadius: 16, padding: 18, background: "rgba(255,255,255,0.8)"}}>
              <SmallLabel>Prompt</SmallLabel>
              <div style={{...theme.typography.small, color: theme.colors.ink, fontWeight: 760, lineHeight: 1.35}}>
                {proof.prompt}
              </div>
            </div>
            <div style={{display: "grid", gap: 14}}>
              {proof.rows.map((row, index) => {
                const opacity = interpolate(progress, [0.12 + index * 0.13, 0.28 + index * 0.13], [0.35, 1], clamp);
                const isActive = index === 2;
                return (
                  <div
                    key={`${row.meta}-${row.tag}`}
                    style={{
                      opacity,
                      border: isActive ? `2px solid rgba(77,141,255,${0.28 + highlight * 0.42})` : "1px solid rgba(175,192,214,0.38)",
                      background: isActive ? `rgba(77,141,255,${0.08 + highlight * 0.12})` : "rgba(246,248,251,0.86)",
                      borderRadius: 16,
                      padding: "15px 18px",
                    }}
                  >
                    <div style={{...tinyText, color: theme.colors.muted, marginBottom: 8}}>{row.meta}</div>
                    <div style={{...theme.typography.small, color: theme.colors.ink, lineHeight: 1.34}}>{row.body}</div>
                    {row.tag ? (
                      <div style={{
                        display: "inline-block",
                        marginTop: 10,
                        padding: "5px 9px",
                        borderRadius: 8,
                        background: "rgba(21,31,48,0.08)",
                        color: theme.colors.ink,
                        fontFamily: theme.typography.mono,
                        fontSize: 17,
                      }}>
                        {row.tag}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
            <div style={{marginTop: "auto", display: "flex", alignItems: "center", gap: 14}}>
              <div style={{flex: 1, border: "1px solid rgba(175,192,214,0.45)", borderRadius: 18, padding: "16px 18px", color: theme.colors.muted, ...theme.typography.small}}>
                Ask for follow-up changes
              </div>
              <div style={{padding: "12px 16px", borderRadius: 14, background: `rgba(77,141,255,${0.18 + highlight * 0.16})`, color: theme.colors.accent, ...theme.typography.small, fontWeight: 760}}>
                Approve for me
              </div>
            </div>
          </div>
          <div style={{padding: 32, background: "rgba(246,248,251,0.62)"}}>
            <div style={{borderRadius: 22, background: "rgba(255,255,255,0.96)", border: "1px solid rgba(175,192,214,0.45)", padding: 24, boxShadow: "0 16px 42px rgba(21,31,48,0.08)"}}>
              <SmallLabel>Environment</SmallLabel>
              {["Changes", "Local", proof.branch, "Commit or push"].map((label, index) => (
                <div key={label} style={{display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18}}>
                  <span style={{...theme.typography.small, color: index === 2 ? theme.colors.ink : theme.colors.muted}}>{label}</span>
                  {index === 0 ? <span style={{...tinyText, color: theme.colors.teal}}>+46k -12k</span> : null}
                </div>
              ))}
              <div style={{height: 1, background: "rgba(175,192,214,0.35)", margin: "22px 0"}} />
              <SmallLabel>Status</SmallLabel>
              <div style={{fontFamily: theme.typography.mono, fontSize: 19, lineHeight: 1.35, color: theme.colors.ink, padding: 14, borderRadius: 12, background: `rgba(20,184,166,${0.08 + highlight * 0.1})`}}>
                {proof.status}
              </div>
              <div style={{height: 1, background: "rgba(175,192,214,0.35)", margin: "22px 0"}} />
              <SmallLabel>Chapter</SmallLabel>
              <div style={{...theme.typography.body, color: theme.colors.ink, fontWeight: 820, lineHeight: 1.12}}>
                {proof.chapter}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
