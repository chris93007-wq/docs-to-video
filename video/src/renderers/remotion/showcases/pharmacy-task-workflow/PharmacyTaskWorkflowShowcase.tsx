import type {CSSProperties, ReactNode} from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
} from "remotion";
import {EngineeringIcon, type EngineeringIconName} from "../../../../assets/icons/EngineeringIcons";
import {clamp} from "../../../../utils/animation";
import {ShowcaseBrandProvider, oracleAssets} from "../sdd-orchestrator/brand";

export type PharmacyWorkflowScene = {
  id: string;
  startSeconds: number;
  durationSeconds: number;
  intendedDurationSeconds: number;
  narration: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  cues?: string[];
  writers?: string[];
  risks?: string[];
  loadStates?: string[];
  readinessChecks?: string[];
  submissionStates?: string[];
  benefits?: string[];
  patientGroups?: string[];
  identityChecks?: string[];
  submitChecks?: string[];
  failureOutcome?: string;
  outcomes?: string[];
};

export type PharmacyWorkflowManifest = {
  fps: number;
  width: number;
  height: number;
  narrativeDurationSeconds: number;
  totalDurationSeconds: number;
  scenes: PharmacyWorkflowScene[];
  narrationAudio: {
    segments: Array<{
      sceneId: string;
      staticFile: string;
      startSeconds: number;
      audioDurationSeconds: number;
    }>;
  };
  endSlate: {
    staticFile: string;
    durationSeconds: number;
  };
};

type SceneProps = {
  scene: PharmacyWorkflowScene;
  fps: number;
  durationInFrames: number;
  sceneIndex: number;
};

const palette = {
  black: "#0E100F",
  panel: "#191C1A",
  panelRaised: "#222622",
  cream: "#F1EFED",
  white: "#FFFFFF",
  muted: "#B9B4AF",
  line: "#3A403B",
  lineSoft: "rgba(241,239,237,0.14)",
  red: "#C74634",
  redBright: "#F17463",
  redSoft: "#F8E2DE",
  green: "#6FA67B",
  greenBright: "#8FC79A",
  greenSoft: "#E3EEE6",
  blue: "#67A7C7",
  blueBright: "#8BC8E5",
  gold: "#F1B13F",
  violet: "#A98AE5",
};

const enter = (frame: number, fps: number, delay = 0) =>
  spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: {damping: 22, stiffness: 105, mass: 0.8},
  });

const reveal = (frame: number, start = 0, duration = 16) =>
  interpolate(frame, [start, start + duration], [0, 1], clamp);

const Rise = ({
  children,
  frame,
  fps,
  delay = 0,
  distance = 22,
  style,
}: {
  children: ReactNode;
  frame: number;
  fps: number;
  delay?: number;
  distance?: number;
  style?: CSSProperties;
}) => {
  const progress = enter(frame, fps, delay);
  return (
    <div
      style={{
        opacity: progress,
        transform: `translateY(${interpolate(progress, [0, 1], [distance, 0], clamp)}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const SceneShell = ({
  scene,
  sceneIndex,
  children,
  compactHeader = false,
}: {
  scene: PharmacyWorkflowScene;
  sceneIndex: number;
  children: ReactNode;
  compactHeader?: boolean;
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        background: palette.black,
        color: palette.cream,
        fontFamily: "Oracle Sans, Arial, sans-serif",
      }}
    >
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 82% 12%, rgba(199,70,52,0.16), transparent 31%), radial-gradient(circle at 12% 88%, rgba(111,166,123,0.13), transparent 34%), linear-gradient(145deg, #0E100F 0%, #171A17 48%, #0B0D0C 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.085,
          backgroundImage:
            "linear-gradient(rgba(241,239,237,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(241,239,237,0.15) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "linear-gradient(to bottom, black, transparent 92%)",
        }}
      />
      <Img
        src={oracleAssets.texture}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0.035,
          mixBlendMode: "screen",
        }}
      />
      <Img
        src={oracleAssets.logo}
        style={{position: "absolute", right: 78, top: 48, width: 184, height: "auto", zIndex: 20}}
      />
      {!compactHeader ? (
        <div style={{position: "absolute", left: 90, top: 58, width: 1250, zIndex: 10}}>
          <div
            style={{
              fontSize: 17,
              letterSpacing: 2.5,
              fontWeight: 700,
              color: palette.gold,
              opacity: reveal(frame, 0, 12),
            }}
          >
            {scene.eyebrow}
          </div>
          <div
            style={{
              fontSize: 62,
              lineHeight: 1.02,
              letterSpacing: -1.5,
              fontWeight: 700,
              marginTop: 14,
              opacity: reveal(frame, 6, 16),
              transform: `translateY(${interpolate(reveal(frame, 6, 16), [0, 1], [16, 0], clamp)}px)`,
            }}
          >
            {scene.title}
          </div>
          <div
            style={{
              fontSize: 25,
              lineHeight: 1.35,
              color: palette.muted,
              marginTop: 14,
              width: 1120,
              opacity: reveal(frame, 14, 18),
            }}
          >
            {scene.subtitle}
          </div>
        </div>
      ) : null}
      <div
        style={{
          position: "absolute",
          left: 82,
          right: 82,
          bottom: 38,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 20,
        }}
      >
        <div style={{display: "flex", alignItems: "center", gap: 12}}>
          <div style={{width: 28, height: 3, borderRadius: 99, background: palette.red}} />
          <span style={{fontSize: 15, letterSpacing: 1.7, fontWeight: 700, color: "rgba(241,239,237,0.58)"}}>
            PHARMACY TASK WORKFLOW ARCHITECTURE
          </span>
        </div>
        <div style={{fontSize: 15, letterSpacing: 1.4, color: "rgba(241,239,237,0.42)"}}>
          {String(sceneIndex + 1).padStart(2, "0")} / 07
        </div>
      </div>
      {children}
    </AbsoluteFill>
  );
};

const Card = ({
  children,
  accent = palette.line,
  style,
}: {
  children: ReactNode;
  accent?: string;
  style?: CSSProperties;
}) => (
  <div
    style={{
      borderRadius: 22,
      border: `1px solid ${accent}`,
      background: "linear-gradient(145deg, rgba(34,38,34,0.98), rgba(20,23,21,0.98))",
      boxShadow: "0 28px 80px rgba(0,0,0,0.28)",
      overflow: "hidden",
      ...style,
    }}
  >
    {children}
  </div>
);

const IconBadge = ({icon, color, size = 50}: {icon: EngineeringIconName; color: string; size?: number}) => (
  <div
    style={{
      width: size + 24,
      height: size + 24,
      display: "grid",
      placeItems: "center",
      borderRadius: 18,
      border: `1px solid ${color}80`,
      background: `${color}1F`,
      flex: "0 0 auto",
    }}
  >
    <EngineeringIcon name={icon} size={size} stroke={color} />
  </div>
);

const Chip = ({
  label,
  color = palette.muted,
  strong = false,
}: {
  label: string;
  color?: string;
  strong?: boolean;
}) => (
  <div
    style={{
      padding: "8px 13px",
      borderRadius: 999,
      border: `1px solid ${color}66`,
      background: `${color}${strong ? "2B" : "16"}`,
      color: strong ? palette.white : color,
      fontSize: 16,
      lineHeight: 1,
      fontWeight: strong ? 700 : 600,
      whiteSpace: "nowrap",
    }}
  >
    {label}
  </div>
);

const FlowArrow = ({
  progress,
  color = palette.greenBright,
  width = 120,
}: {
  progress: number;
  color?: string;
  width?: number;
}) => (
  <div style={{position: "relative", width, height: 28, flex: `0 0 ${width}px`}}>
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 12,
        width: Math.max(0, (width - 14) * progress),
        height: 3,
        borderRadius: 99,
        background: color,
        boxShadow: `0 0 18px ${color}55`,
      }}
    />
    <div
      style={{
        position: "absolute",
        right: 0,
        top: 6,
        width: 0,
        height: 0,
        borderTop: "8px solid transparent",
        borderBottom: "8px solid transparent",
        borderLeft: `13px solid ${color}`,
        opacity: progress,
      }}
    />
  </div>
);

const CheckRow = ({label, color = palette.greenBright}: {label: string; color?: string}) => (
  <div style={{display: "flex", alignItems: "center", gap: 13, fontSize: 20, color: palette.cream}}>
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: 99,
        display: "grid",
        placeItems: "center",
        background: `${color}24`,
        border: `1px solid ${color}80`,
        color,
        fontSize: 17,
        fontWeight: 800,
      }}
    >
      ✓
    </div>
    <span>{label}</span>
  </div>
);

const CodeLabel = ({children, color = palette.greenBright}: {children: ReactNode; color?: string}) => (
  <span
    style={{
      fontFamily: "SFMono-Regular, Menlo, Consolas, monospace",
      fontSize: 18,
      color,
      letterSpacing: -0.3,
    }}
  >
    {children}
  </span>
);

const IntroScene = ({scene, fps, sceneIndex}: SceneProps) => {
  const frame = useCurrentFrame();
  const titleIn = enter(frame, fps, 4);
  const orbitProgress = interpolate(frame, [fps * 0.8, fps * 4.5], [0, 1], clamp);
  const workflows = [
    {label: scene.cues?.[0] ?? "Pick Up", x: 300, color: palette.greenBright, icon: "worker" as const},
    {label: scene.cues?.[1] ?? "Verify", x: 790, color: palette.blueBright, icon: "shield" as const},
    {label: scene.cues?.[2] ?? "Fill / Dispense", x: 1280, color: palette.gold, icon: "database" as const},
  ];
  return (
    <SceneShell scene={scene} sceneIndex={sceneIndex} compactHeader>
      <div style={{position: "absolute", left: 180, right: 180, top: 140, textAlign: "center", zIndex: 4}}>
        <div style={{fontSize: 18, letterSpacing: 2.8, color: palette.gold, fontWeight: 700, opacity: reveal(frame, 0, 14)}}>
          {scene.eyebrow}
        </div>
        <div
          style={{
            fontSize: 84,
            lineHeight: 0.98,
            letterSpacing: -2.4,
            fontWeight: 750,
            marginTop: 26,
            opacity: titleIn,
            transform: `translateY(${interpolate(titleIn, [0, 1], [24, 0], clamp)}px)`,
          }}
        >
          From scattered state to
          <br />
          <span style={{color: palette.greenBright}}>authoritative task workflows</span>
        </div>
        <div style={{fontSize: 29, color: palette.muted, marginTop: 25, opacity: reveal(frame, 18, 18)}}>
          {scene.subtitle}
        </div>
      </div>
      <div style={{position: "absolute", left: 250, right: 250, top: 665, height: 210}}>
        <div style={{position: "absolute", left: 150, right: 150, top: 69, height: 3, background: palette.lineSoft}}>
          <div style={{width: `${orbitProgress * 100}%`, height: "100%", background: `linear-gradient(90deg, ${palette.greenBright}, ${palette.blueBright}, ${palette.gold})`}} />
        </div>
        {workflows.map((workflow, index) => (
          <Rise key={workflow.label} frame={frame} fps={fps} delay={fps * (0.75 + index * 0.35)} style={{position: "absolute", left: workflow.x - 250, top: 0, width: 390}}>
            <Card accent={`${workflow.color}70`} style={{height: 142, display: "flex", alignItems: "center", gap: 22, padding: "0 28px"}}>
              <IconBadge icon={workflow.icon} color={workflow.color} size={44} />
              <div>
                <div style={{fontSize: 24, fontWeight: 700}}>{workflow.label}</div>
                <div style={{fontSize: 17, color: palette.muted, marginTop: 7}}>task-specific rules</div>
              </div>
            </Card>
          </Rise>
        ))}
      </div>
    </SceneShell>
  );
};

const LegacyProblemScene = ({scene, fps, sceneIndex}: SceneProps) => {
  const frame = useCurrentFrame();
  const writers = scene.writers ?? [];
  const risks = scene.risks ?? [];
  const flow = interpolate(frame, [fps * 1.4, fps * 5.2], [0, 1], clamp);
  return (
    <SceneShell scene={scene} sceneIndex={sceneIndex}>
      <div style={{position: "absolute", left: 88, right: 88, top: 330, bottom: 96, display: "flex", alignItems: "center"}}>
        <Rise frame={frame} fps={fps} delay={fps * 0.6} style={{width: 240}}>
          <Card accent={`${palette.muted}66`} style={{height: 240, padding: 28, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center"}}>
            <IconBadge icon="document" color={palette.muted} size={52} />
            <div style={{fontSize: 25, fontWeight: 700, marginTop: 18}}>Task selected</div>
            <div style={{fontSize: 17, color: palette.muted, marginTop: 8}}>one user intent</div>
          </Card>
        </Rise>
        <FlowArrow progress={flow} color={palette.redBright} width={110} />
        <Rise frame={frame} fps={fps} delay={fps * 1.05} style={{width: 660}}>
          <Card accent={`${palette.red}88`} style={{height: 510, padding: 28}}>
            <div style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
              <div>
                <div style={{fontSize: 17, color: palette.redBright, letterSpacing: 1.7, fontWeight: 700}}>DISTRIBUTED OWNERSHIP</div>
                <div style={{fontSize: 29, fontWeight: 700, marginTop: 8}}>Six writers update independently</div>
              </div>
              <div style={{fontSize: 54, color: palette.redBright, fontWeight: 800}}>6×</div>
            </div>
            <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 30}}>
              {writers.map((writer, index) => (
                <div
                  key={writer}
                  style={{
                    opacity: reveal(frame, fps * 1.25 + index * 6, 12),
                    borderRadius: 15,
                    padding: "17px 18px",
                    border: `1px solid ${palette.red}55`,
                    background: "rgba(199,70,52,0.09)",
                    fontSize: 20,
                    display: "flex",
                    alignItems: "center",
                    gap: 11,
                  }}
                >
                  <span style={{width: 9, height: 9, borderRadius: 99, background: palette.redBright, boxShadow: `0 0 12px ${palette.redBright}`}} />
                  {writer}
                </div>
              ))}
            </div>
            <div style={{marginTop: 28, borderTop: `1px solid ${palette.lineSoft}`, paddingTop: 23, fontSize: 21, color: palette.muted}}>
              The UI can render <span style={{color: palette.redBright, fontWeight: 700}}>between updates</span>.
            </div>
          </Card>
        </Rise>
        <FlowArrow progress={flow} color={palette.redBright} width={110} />
        <Rise frame={frame} fps={fps} delay={fps * 1.55} style={{flex: 1}}>
          <Card accent={`${palette.redBright}88`} style={{height: 510, padding: 28}}>
            <div style={{display: "flex", alignItems: "center", gap: 17}}>
              <IconBadge icon="browser" color={palette.redBright} size={44} />
              <div>
                <div style={{fontSize: 17, color: palette.muted}}>WHAT THE USER CAN SEE</div>
                <div style={{fontSize: 29, fontWeight: 700, marginTop: 6}}>A half-loaded workflow</div>
              </div>
            </div>
            <div style={{display: "grid", gap: 13, marginTop: 29}}>
              {risks.map((risk, index) => (
                <div
                  key={risk}
                  style={{
                    opacity: reveal(frame, fps * 2 + index * 7, 14),
                    borderRadius: 14,
                    border: `1px solid ${palette.red}52`,
                    background: index % 2 === 0 ? "rgba(199,70,52,0.15)" : "rgba(199,70,52,0.07)",
                    padding: "16px 18px",
                    display: "flex",
                    alignItems: "center",
                    gap: 13,
                    fontSize: 20,
                  }}
                >
                  <span style={{fontSize: 24, color: palette.redBright}}>×</span>
                  {risk}
                </div>
              ))}
            </div>
          </Card>
        </Rise>
      </div>
    </SceneShell>
  );
};

const NewSolutionScene = ({scene, fps, sceneIndex}: SceneProps) => {
  const frame = useCurrentFrame();
  const loadStates = scene.loadStates ?? [];
  const readinessChecks = scene.readinessChecks ?? [];
  const submissionStates = scene.submissionStates ?? [];
  const benefits = scene.benefits ?? [];
  const flow = interpolate(frame, [fps * 1, fps * 4.5], [0, 1], clamp);
  const rails = [
    {
      label: "1 · DATA LIFECYCLE",
      code: "AsyncLoadState<TaskData>",
      color: palette.greenBright,
      chips: loadStates,
      icon: "database" as const,
    },
    {
      label: "2 · TASK READINESS",
      code: "canPerformTaskSignal",
      color: palette.blueBright,
      chips: readinessChecks,
      icon: "gate" as const,
    },
    {
      label: "3 · SUBMISSION LIFECYCLE",
      code: "submissionStateSignal",
      color: palette.gold,
      chips: submissionStates,
      icon: "play" as const,
    },
  ];
  return (
    <SceneShell scene={scene} sceneIndex={sceneIndex}>
      <div style={{position: "absolute", left: 88, right: 88, top: 320, bottom: 102, display: "flex", alignItems: "center"}}>
        <Rise frame={frame} fps={fps} delay={fps * 0.55} style={{width: 360}}>
          <Card accent={`${palette.greenBright}80`} style={{height: 524, padding: 30}}>
            <div style={{display: "flex", alignItems: "center", gap: 17}}>
              <IconBadge icon="worker" color={palette.greenBright} size={46} />
              <div>
                <div style={{fontSize: 17, color: palette.greenBright, letterSpacing: 1.5, fontWeight: 700}}>ONE OWNER</div>
                <div style={{fontSize: 28, lineHeight: 1.08, fontWeight: 700, marginTop: 7}}>Instance-scoped WorkflowStore</div>
              </div>
            </div>
            <div style={{marginTop: 31, display: "grid", gap: 14}}>
              {benefits.map((benefit, index) => (
                <div key={benefit} style={{opacity: reveal(frame, fps * 1.1 + index * 7, 14)}}>
                  <CheckRow label={benefit} />
                </div>
              ))}
            </div>
            <div style={{marginTop: 30, padding: "17px 18px", borderRadius: 14, background: "rgba(143,199,154,0.10)", border: `1px solid ${palette.greenBright}44`, fontSize: 18, color: palette.muted, lineHeight: 1.4}}>
              Related values commit <span style={{color: palette.greenBright, fontWeight: 700}}>atomically</span>.
            </div>
          </Card>
        </Rise>
        <FlowArrow progress={flow} width={110} />
        <div style={{flex: 1, display: "grid", gap: 17}}>
          {rails.map((rail, index) => (
            <Rise key={rail.label} frame={frame} fps={fps} delay={fps * (0.9 + index * 0.35)}>
              <Card accent={`${rail.color}66`} style={{height: 154, padding: "22px 26px", display: "flex", alignItems: "center", gap: 22}}>
                <IconBadge icon={rail.icon} color={rail.color} size={40} />
                <div style={{width: 310}}>
                  <div style={{fontSize: 15, letterSpacing: 1.6, color: rail.color, fontWeight: 700}}>{rail.label}</div>
                  <div style={{marginTop: 10}}><CodeLabel color={rail.color}>{rail.code}</CodeLabel></div>
                </div>
                <div style={{flex: 1, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center"}}>
                  {rail.chips.map((chip, chipIndex) => (
                    <div key={chip} style={{opacity: reveal(frame, fps * (1.4 + index * 0.35) + chipIndex * 4, 10)}}>
                      <Chip label={chip} color={rail.color} strong={chip === "ready" || chip === "authoritative data" || chip === "success"} />
                    </div>
                  ))}
                </div>
              </Card>
            </Rise>
          ))}
        </div>
      </div>
    </SceneShell>
  );
};

const PickupProofScene = ({scene, fps, sceneIndex}: SceneProps) => {
  const frame = useCurrentFrame();
  const patientGroups = scene.patientGroups ?? [];
  const identityChecks = scene.identityChecks ?? [];
  const submitChecks = scene.submitChecks ?? [];
  const flow = interpolate(frame, [fps * 1.15, fps * 4.2], [0, 1], clamp);
  return (
    <SceneShell scene={scene} sceneIndex={sceneIndex}>
      <div style={{position: "absolute", left: 88, right: 88, top: 332, bottom: 105, display: "flex", alignItems: "center"}}>
        <Rise frame={frame} fps={fps} delay={fps * 0.55} style={{width: 385}}>
          <Card accent={`${palette.blueBright}66`} style={{height: 500, padding: 27}}>
            <div style={{fontSize: 16, letterSpacing: 1.7, color: palette.blueBright, fontWeight: 700}}>STABLE PATIENT GROUPS</div>
            <div style={{display: "grid", gap: 15, marginTop: 25}}>
              {patientGroups.map((group, index) => {
                const active = index === 0;
                return (
                  <div
                    key={group}
                    style={{
                      opacity: reveal(frame, fps * 0.9 + index * 8, 14),
                      borderRadius: 16,
                      border: `1px solid ${active ? palette.greenBright : palette.line}`,
                      background: active ? "rgba(143,199,154,0.12)" : "rgba(255,255,255,0.025)",
                      padding: "18px 19px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{display: "flex", alignItems: "center", gap: 13}}>
                      <span style={{width: 11, height: 11, borderRadius: 99, background: active ? palette.greenBright : palette.muted}} />
                      <span style={{fontSize: 21, fontWeight: active ? 700 : 500}}>{group}</span>
                    </div>
                    <Chip label={active ? "loading → ready" : "not_started"} color={active ? palette.greenBright : palette.muted} />
                  </div>
                );
              })}
            </div>
            <div style={{marginTop: 25, fontSize: 18, color: palette.muted, lineHeight: 1.45}}>
              The active patient loads atomically. Later groups load only when needed.
            </div>
          </Card>
        </Rise>
        <FlowArrow progress={flow} width={100} />
        <Rise frame={frame} fps={fps} delay={fps * 1} style={{width: 440}}>
          <Card accent={`${palette.greenBright}80`} style={{height: 500, padding: 27}}>
            <div style={{display: "flex", alignItems: "center", gap: 16}}>
              <IconBadge icon="database" color={palette.greenBright} size={42} />
              <div>
                <div style={{fontSize: 16, color: palette.greenBright, letterSpacing: 1.6, fontWeight: 700}}>AUTHORITATIVE RESPONSE</div>
                <div style={{fontSize: 25, fontWeight: 700, marginTop: 5}}>PickupTaskWorkflowStore</div>
              </div>
            </div>
            <div style={{marginTop: 28, display: "flex", gap: 10, flexWrap: "wrap"}}>
              {["loading", "ready", "empty", "error"].map((state, index) => (
                <div key={state} style={{opacity: reveal(frame, fps * 1.25 + index * 5, 12)}}>
                  <Chip label={state} color={state === "ready" ? palette.greenBright : state === "error" ? palette.redBright : palette.muted} strong={state === "ready"} />
                </div>
              ))}
            </div>
            <div style={{fontSize: 16, color: palette.muted, marginTop: 30, letterSpacing: 1.4}}>IDENTITY CHECKS</div>
            <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13, marginTop: 16}}>
              {identityChecks.map((check, index) => (
                <div key={check} style={{opacity: reveal(frame, fps * 1.8 + index * 5, 12)}}>
                  <CheckRow label={check} />
                </div>
              ))}
            </div>
            <div style={{marginTop: 28, padding: "16px 18px", borderRadius: 14, border: `1px solid ${palette.red}44`, background: "rgba(199,70,52,0.08)", color: palette.muted, fontSize: 17}}>
              Drawer close / replacement invalidates late results.
            </div>
          </Card>
        </Rise>
        <FlowArrow progress={flow} width={100} />
        <Rise frame={frame} fps={fps} delay={fps * 1.45} style={{flex: 1}}>
          <Card accent={`${palette.gold}72`} style={{height: 500, padding: 27}}>
            <div style={{display: "flex", alignItems: "center", gap: 16}}>
              <IconBadge icon="gate" color={palette.gold} size={42} />
              <div>
                <div style={{fontSize: 16, color: palette.gold, letterSpacing: 1.6, fontWeight: 700}}>COMPUTED GATE</div>
                <div style={{fontSize: 25, fontWeight: 700, marginTop: 5}}>canSubmitSignal</div>
              </div>
            </div>
            <div style={{display: "grid", gap: 16, marginTop: 30}}>
              {submitChecks.map((check, index) => (
                <div key={check} style={{opacity: reveal(frame, fps * 1.85 + index * 7, 14)}}>
                  <CheckRow label={check} color={palette.gold} />
                </div>
              ))}
            </div>
            <div style={{marginTop: 36, padding: "21px 22px", borderRadius: 16, background: "rgba(143,199,154,0.14)", border: `1px solid ${palette.greenBright}88`, textAlign: "center"}}>
              <div style={{fontSize: 16, color: palette.greenBright, letterSpacing: 1.7, fontWeight: 700}}>ONLY THEN</div>
              <div style={{fontSize: 28, fontWeight: 800, marginTop: 8}}>Submit enabled</div>
            </div>
          </Card>
        </Rise>
      </div>
    </SceneShell>
  );
};

const VerifyScene = ({scene, fps, sceneIndex}: SceneProps) => {
  const frame = useCurrentFrame();
  const checks = scene.readinessChecks ?? [];
  const flow = interpolate(frame, [fps * 1.1, fps * 4.5], [0, 1], clamp);
  return (
    <SceneShell scene={scene} sceneIndex={sceneIndex}>
      <div style={{position: "absolute", left: 96, right: 96, top: 345, height: 480, display: "flex", alignItems: "center"}}>
        <Rise frame={frame} fps={fps} delay={fps * 0.5} style={{width: 360}}>
          <Card accent={`${palette.greenBright}70`} style={{height: 430, padding: 27}}>
            <div style={{display: "flex", gap: 16, alignItems: "center"}}>
              <IconBadge icon="worker" color={palette.greenBright} size={42} />
              <div>
                <div style={{fontSize: 16, color: palette.greenBright, fontWeight: 700, letterSpacing: 1.5}}>PER OPEN TAB</div>
                <div style={{fontSize: 21, fontWeight: 700, marginTop: 5}}>PharmacyDetailStore</div>
              </div>
            </div>
            <div style={{marginTop: 31, fontSize: 18, color: palette.muted}}>One atomic resource:</div>
            <div style={{marginTop: 12}}><CodeLabel>actionDetailsLoadStateSignal</CodeLabel></div>
            <div style={{display: "flex", flexWrap: "wrap", gap: 9, marginTop: 23}}>
              {["loading", "ready", "empty", "error"].map((state, index) => (
                <div key={state} style={{opacity: reveal(frame, fps * 1 + index * 5, 12)}}>
                  <Chip label={state} color={state === "ready" ? palette.greenBright : state === "error" ? palette.redBright : palette.muted} strong={state === "ready"} />
                </div>
              ))}
            </div>
            <div style={{marginTop: 34, padding: "17px 18px", borderRadius: 14, background: "rgba(103,167,199,0.10)", border: `1px solid ${palette.blueBright}44`, fontSize: 18, lineHeight: 1.4}}>
              Ready means the <strong>form can render</strong>.
            </div>
          </Card>
        </Rise>
        <FlowArrow progress={flow} color={palette.blueBright} width={120} />
        <Rise frame={frame} fps={fps} delay={fps * 0.95} style={{width: 560}}>
          <Card accent={`${palette.blueBright}80`} style={{height: 430, padding: 27}}>
            <div style={{display: "flex", alignItems: "center", gap: 16}}>
              <IconBadge icon="shield" color={palette.blueBright} size={42} />
              <div>
                <div style={{fontSize: 16, color: palette.blueBright, letterSpacing: 1.5, fontWeight: 700}}>VERIFY POLICY</div>
                <div style={{fontSize: 27, fontWeight: 700, marginTop: 5}}>canVerifySignal</div>
              </div>
            </div>
            <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 30}}>
              {checks.map((check, index) => (
                <div key={check} style={{opacity: reveal(frame, fps * 1.4 + index * 6, 14)}}>
                  <CheckRow label={check} color={palette.blueBright} />
                </div>
              ))}
            </div>
            <div style={{marginTop: 38, padding: "17px 19px", borderRadius: 14, background: "rgba(139,200,229,0.10)", border: `1px solid ${palette.blueBright}55`, fontSize: 19, color: palette.muted}}>
              Actionable means the <strong style={{color: palette.blueBright}}>whole Verify contract</strong> is safe.
            </div>
          </Card>
        </Rise>
        <FlowArrow progress={flow} color={palette.greenBright} width={120} />
        <Rise frame={frame} fps={fps} delay={fps * 1.45} style={{flex: 1}}>
          <div style={{display: "grid", gap: 18}}>
            <Card accent={`${palette.greenBright}88`} style={{height: 185, padding: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center"}}>
              <div style={{fontSize: 16, color: palette.greenBright, letterSpacing: 1.6, fontWeight: 700}}>ALL CHECKS TRUE</div>
              <div style={{fontSize: 31, fontWeight: 800, marginTop: 9}}>Verify enabled</div>
            </Card>
            <Card accent={`${palette.redBright}66`} style={{height: 185, padding: 24, display: "flex", alignItems: "center", gap: 18}}>
              <IconBadge icon="timeline" color={palette.redBright} size={38} />
              <div>
                <div style={{fontSize: 21, fontWeight: 700}}>Failure resolves</div>
                <div style={{fontSize: 17, color: palette.muted, lineHeight: 1.4, marginTop: 7}}>{scene.failureOutcome}</div>
              </div>
            </Card>
          </div>
        </Rise>
      </div>
    </SceneShell>
  );
};

const FillDispenseScene = ({scene, fps, sceneIndex}: SceneProps) => {
  const frame = useCurrentFrame();
  const checks = scene.readinessChecks ?? [];
  const flow = interpolate(frame, [fps * 1, fps * 4.8], [0, 1], clamp);
  const dataStages = [
    {
      label: "1 · ACTION DETAILS",
      code: "actionDetailsLoadState",
      detail: "action + patient identities",
      color: palette.greenBright,
      icon: "document" as const,
    },
    {
      label: "2 · DISPENSE SUMMARY",
      code: "medicationDispenseLoadState",
      detail: "authoritative dispense data",
      color: palette.violet,
      icon: "database" as const,
    },
  ];
  return (
    <SceneShell scene={scene} sceneIndex={sceneIndex}>
      <div style={{position: "absolute", left: 84, right: 84, top: 340, height: 465, display: "flex", alignItems: "center"}}>
        {dataStages.map((stage, index) => (
          <div key={stage.label} style={{display: "flex", alignItems: "center"}}>
            <Rise frame={frame} fps={fps} delay={fps * (0.5 + index * 0.45)} style={{width: 390}}>
              <Card accent={`${stage.color}70`} style={{height: 420, padding: 27}}>
                <div style={{display: "flex", alignItems: "center", gap: 15}}>
                  <IconBadge icon={stage.icon} color={stage.color} size={40} />
                  <div style={{fontSize: 16, letterSpacing: 1.5, color: stage.color, fontWeight: 700}}>{stage.label}</div>
                </div>
                <div style={{marginTop: 30}}><CodeLabel color={stage.color}>{stage.code}</CodeLabel></div>
                <div style={{fontSize: 19, color: palette.muted, marginTop: 12}}>{stage.detail}</div>
                <div style={{display: "flex", flexWrap: "wrap", gap: 9, marginTop: 29}}>
                  {["loading", "ready", "error"].map((state, stateIndex) => (
                    <div key={state} style={{opacity: reveal(frame, fps * (1.1 + index * 0.45) + stateIndex * 5, 12)}}>
                      <Chip label={state} color={state === "ready" ? stage.color : state === "error" ? palette.redBright : palette.muted} strong={state === "ready"} />
                    </div>
                  ))}
                </div>
                <div style={{marginTop: 33, padding: "17px 18px", borderRadius: 14, border: `1px solid ${stage.color}44`, background: `${stage.color}12`, fontSize: 18, lineHeight: 1.42}}>
                  {index === 0 ? "The second resource does not start from partial action details." : "The form does not become actionable from a partial summary."}
                </div>
              </Card>
            </Rise>
            <FlowArrow progress={flow} color={index === 0 ? palette.violet : palette.blueBright} width={86} />
          </div>
        ))}
        <Rise frame={frame} fps={fps} delay={fps * 1.4} style={{flex: 1}}>
          <Card accent={`${palette.blueBright}78`} style={{height: 420, padding: 27}}>
            <div style={{display: "flex", alignItems: "center", gap: 15}}>
              <IconBadge icon="gate" color={palette.blueBright} size={40} />
              <div>
                <div style={{fontSize: 16, color: palette.blueBright, letterSpacing: 1.5, fontWeight: 700}}>3 · FILL POLICY</div>
                <div style={{fontSize: 27, fontWeight: 700, marginTop: 5}}>canFillSignal</div>
              </div>
            </div>
            <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 27}}>
              {checks.map((check, index) => (
                <div key={check} style={{opacity: reveal(frame, fps * 1.7 + index * 6, 14)}}>
                  <CheckRow label={check} color={palette.blueBright} />
                </div>
              ))}
            </div>
            <div style={{marginTop: 29, padding: "17px 18px", borderRadius: 14, background: "rgba(199,70,52,0.09)", border: `1px solid ${palette.redBright}55`, fontSize: 17, color: palette.muted, lineHeight: 1.4}}>
              {scene.failureOutcome}
            </div>
            <div style={{marginTop: 17, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 18px", borderRadius: 14, background: "rgba(143,199,154,0.13)", border: `1px solid ${palette.greenBright}70`}}>
              <span style={{fontSize: 17, color: palette.greenBright, fontWeight: 700}}>ALL DATA + RULES READY</span>
              <span style={{fontSize: 24, fontWeight: 800}}>Fill enabled</span>
            </div>
          </Card>
        </Rise>
      </div>
    </SceneShell>
  );
};

const OutcomesScene = ({scene, fps, sceneIndex}: SceneProps) => {
  const frame = useCurrentFrame();
  const outcomes = scene.outcomes ?? [];
  const icons: EngineeringIconName[] = ["gate", "play", "shield", "browser"];
  const colors = [palette.greenBright, palette.blueBright, palette.gold, palette.violet];
  return (
    <SceneShell scene={scene} sceneIndex={sceneIndex}>
      <div style={{position: "absolute", left: 130, right: 130, top: 360, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 22}}>
        {outcomes.map((outcome, index) => (
          <Rise key={outcome} frame={frame} fps={fps} delay={fps * (0.55 + index * 0.25)}>
            <Card accent={`${colors[index]}70`} style={{height: 300, padding: 28, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center"}}>
              <IconBadge icon={icons[index]} color={colors[index]} size={52} />
              <div style={{fontSize: 26, lineHeight: 1.15, fontWeight: 750, marginTop: 25}}>{outcome}</div>
            </Card>
          </Rise>
        ))}
      </div>
      <Rise frame={frame} fps={fps} delay={fps * 1.8} style={{position: "absolute", left: 395, right: 395, top: 715}}>
        <div style={{borderRadius: 999, padding: "19px 30px", border: `1px solid ${palette.greenBright}66`, background: "rgba(143,199,154,0.11)", textAlign: "center", fontSize: 24, color: palette.cream}}>
          usable data <span style={{color: palette.muted}}>·</span> meaningful progress <span style={{color: palette.muted}}>·</span> clear recovery
        </div>
      </Rise>
    </SceneShell>
  );
};

const sceneComponents: Record<string, (props: SceneProps) => JSX.Element> = {
  introduction: IntroScene,
  "legacy-problem": LegacyProblemScene,
  "new-solution": NewSolutionScene,
  "pickup-proof": PickupProofScene,
  verify: VerifyScene,
  "fill-dispense": FillDispenseScene,
  outcomes: OutcomesScene,
};

const SceneCut = ({children, durationInFrames}: {children: ReactNode; durationInFrames: number}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, 8, Math.max(9, durationInFrames - 8), durationInFrames],
    [0, 1, 1, 0],
    clamp,
  );
  const scale = interpolate(frame, [0, durationInFrames], [1.006, 1], clamp);
  return (
    <AbsoluteFill style={{opacity, transform: `scale(${scale})`, transformOrigin: "center"}}>
      {children}
    </AbsoluteFill>
  );
};

export const PharmacyTaskWorkflowShowcase = ({manifest}: {manifest: PharmacyWorkflowManifest}) => (
  <ShowcaseBrandProvider mode="oracle-redwood">
    <AbsoluteFill style={{background: palette.black}}>
      {manifest.scenes.map((scene, sceneIndex) => {
        const Component = sceneComponents[scene.id];
        if (!Component) return null;
        const durationInFrames = Math.max(1, Math.round(scene.durationSeconds * manifest.fps));
        return (
          <Sequence
            key={scene.id}
            name={scene.id}
            from={Math.round(scene.startSeconds * manifest.fps)}
            durationInFrames={durationInFrames}
          >
            <SceneCut durationInFrames={durationInFrames}>
              <Component
                scene={scene}
                fps={manifest.fps}
                durationInFrames={durationInFrames}
                sceneIndex={sceneIndex}
              />
            </SceneCut>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  </ShowcaseBrandProvider>
);
