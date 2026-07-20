import type {CSSProperties, ReactNode} from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
} from "remotion";
import {
  EngineeringIcon,
  type EngineeringIconName,
} from "../../../../assets/icons/EngineeringIcons";
import {clamp} from "../../../../utils/animation";
import {
  ShowcaseBrandProvider,
  oracleAssets,
} from "../sdd-orchestrator/brand";

type WorkflowQuestion = {
  number: string;
  question: string;
  implementation: string;
};

type EvidenceTone = "red" | "green" | "blue" | "gold";

type EvidenceFocusRegion = {
  id: string;
  label: string;
  tone: EvidenceTone;
  x: number;
  y: number;
  width: number;
  height: number;
};

type EvidenceAsset = {
  staticFile: string;
  sourceUrl: string;
  sourceLabel: string;
  caption: string;
  naturalWidth: number;
  naturalHeight: number;
  sha256: string;
  focusRegions: EvidenceFocusRegion[];
};

export type PharmacyWorkflowLightScene = {
  id: string;
  startSeconds: number;
  durationSeconds: number;
  intendedDurationSeconds: number;
  narration: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  problem?: string;
  missing?: string;
  goal?: string;
  file?: string;
  code?: string[];
  gap?: string;
  facts?: string[];
  outcomes?: string[];
  questions?: WorkflowQuestion[];
  behaviors?: string[];
  load?: string;
  checks?: string[];
  error?: string;
  stages?: string[];
  credit?: string;
  production?: string;
  sources?: string;
  evidence?: EvidenceAsset;
};

export type PharmacyWorkflowLightManifest = {
  fps: number;
  width: number;
  height: number;
  narrativeDurationSeconds: number;
  totalDurationSeconds: number;
  scenes: PharmacyWorkflowLightScene[];
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
  scene: PharmacyWorkflowLightScene;
  fps: number;
  durationInFrames: number;
  sceneIndex: number;
};

const p = {
  canvas: "#F1EFED",
  canvas2: "#FAF9F7",
  surface: "#FFFFFF",
  ink: "#161513",
  bark: "#312D2A",
  muted: "#697778",
  line: "#D7D1CC",
  lineStrong: "#A9A39D",
  red: "#C74634",
  redSoft: "#F8E2DE",
  redDeep: "#8F2E22",
  green: "#4E7E5B",
  greenSoft: "#E3EEE6",
  blue: "#3F718D",
  blueSoft: "#E6F0F5",
  gold: "#B46E0B",
  goldSoft: "#FFF0D2",
  violet: "#725695",
  violetSoft: "#EFE9F6",
  code: "#28302F",
  codeMuted: "#B9C6C3",
};

const shadow = "0 22px 54px rgba(49,45,42,0.12)";

const inSpring = (frame: number, fps: number, delay = 0) =>
  spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: {damping: 24, stiffness: 120, mass: 0.82},
  });

const reveal = (frame: number, start = 0, duration = 16) =>
  interpolate(frame, [start, start + duration], [0, 1], clamp);

const Rise = ({
  children,
  frame,
  fps,
  delay = 0,
  distance = 20,
  style,
}: {
  children: ReactNode;
  frame: number;
  fps: number;
  delay?: number;
  distance?: number;
  style?: CSSProperties;
}) => {
  const progress = inSpring(frame, fps, delay);
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

const IconBadge = ({
  icon,
  color,
  background,
  size = 54,
}: {
  icon: EngineeringIconName;
  color: string;
  background: string;
  size?: number;
}) => (
  <div
    style={{
      width: size + 26,
      height: size + 26,
      borderRadius: 18,
      background,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flex: "0 0 auto",
    }}
  >
    <EngineeringIcon name={icon} size={size} stroke={color} />
  </div>
);

const Pill = ({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "red" | "green" | "blue" | "gold";
}) => {
  const tones = {
    neutral: {background: p.canvas, color: p.bark, border: p.line},
    red: {background: p.redSoft, color: p.redDeep, border: "#E8B5AC"},
    green: {background: p.greenSoft, color: p.green, border: "#BBD3C0"},
    blue: {background: p.blueSoft, color: p.blue, border: "#BDD4DF"},
    gold: {background: p.goldSoft, color: p.gold, border: "#ECD3A3"},
  }[tone];
  return (
    <div
      style={{
        padding: "10px 17px",
        borderRadius: 999,
        background: tones.background,
        color: tones.color,
        border: `1px solid ${tones.border}`,
        fontSize: 18,
        fontWeight: 700,
        lineHeight: 1.1,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  );
};

const evidenceTones: Record<EvidenceTone, {color: string; soft: string; border: string}> = {
  red: {color: p.redDeep, soft: p.redSoft, border: "#D98476"},
  green: {color: p.green, soft: p.greenSoft, border: "#8FB89A"},
  blue: {color: p.blue, soft: p.blueSoft, border: "#8FB6C9"},
  gold: {color: p.gold, soft: p.goldSoft, border: "#D8B369"},
};

const EvidenceFocusCard = ({
  evidence,
  region,
  opacity,
}: {
  evidence: EvidenceAsset;
  region: EvidenceFocusRegion;
  opacity: number;
}) => {
  const viewportWidth = 1600;
  const viewportHeight = 510;
  const scale = Math.min(viewportWidth / region.width, viewportHeight / region.height);
  const cropWidth = region.width * scale;
  const cropHeight = region.height * scale;
  const cropLeft = (viewportWidth - cropWidth) / 2;
  const cropTop = (viewportHeight - cropHeight) / 2;
  const tone = evidenceTones[region.tone];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          width: viewportWidth,
          height: viewportHeight,
          borderRadius: 23,
          background: p.canvas2,
          border: `1px solid ${tone.border}`,
          boxShadow: shadow,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: cropLeft,
            top: cropTop,
            width: cropWidth,
            height: cropHeight,
            overflow: "hidden",
            background: "white",
          }}
        >
          <Img
            src={staticFile(evidence.staticFile)}
            style={{
              position: "absolute",
              left: -region.x * scale,
              top: -region.y * scale,
              width: evidence.naturalWidth * scale,
              height: evidence.naturalHeight * scale,
              maxWidth: "none",
            }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            left: 22,
            top: 20,
            padding: "10px 16px",
            borderRadius: 999,
            background: tone.soft,
            color: tone.color,
            border: `1px solid ${tone.border}`,
            fontSize: 18,
            fontWeight: 800,
            boxShadow: "0 6px 18px rgba(49,45,42,0.12)",
          }}
        >
          {region.label}
        </div>
      </div>
    </div>
  );
};

const EvidencePanel = ({
  evidence,
  frame,
  regionFrames,
}: {
  evidence: EvidenceAsset;
  frame: number;
  regionFrames: number;
}) => (
  <div style={{position: "relative", height: "100%", paddingBottom: 70}}>
    <div style={{position: "absolute", inset: "0 0 70px"}}>
      {evidence.focusRegions.map((region, index) => {
        const localFrame = frame - index * regionFrames;
        const enter = index === 0
          ? 1
          : interpolate(localFrame, [-14, 14], [0, 1], clamp);
        const exit = index === evidence.focusRegions.length - 1
          ? 1
          : interpolate(localFrame, [regionFrames - 14, regionFrames + 14], [1, 0], clamp);
        return (
          <EvidenceFocusCard
            key={region.id}
            evidence={evidence}
            region={region}
            opacity={enter * exit}
          />
        );
      })}
    </div>
    <div
      style={{
        position: "absolute",
        left: 74,
        right: 74,
        bottom: 10,
        height: 48,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 24,
        color: p.muted,
        fontSize: 16,
      }}
    >
      <span style={{fontWeight: 800, color: p.bark}}>{evidence.sourceLabel}</span>
      <span style={{textAlign: "right"}}>{evidence.caption}</span>
    </div>
  </div>
);

const SceneShell = ({
  scene,
  sceneIndex,
  children,
}: {
  scene: PharmacyWorkflowLightScene;
  sceneIndex: number;
  children: ReactNode;
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        background: p.canvas,
        color: p.ink,
        fontFamily: "Oracle Sans, Arial, sans-serif",
      }}
    >
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 88% 5%, rgba(199,70,52,0.09), transparent 29%), radial-gradient(circle at 8% 90%, rgba(92,146,109,0.09), transparent 30%), linear-gradient(135deg, #F1EFED 0%, #FAF9F7 54%, #FFFFFF 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.34,
          backgroundImage:
            "linear-gradient(rgba(169,163,157,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(169,163,157,0.10) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "linear-gradient(to bottom, black, transparent 93%)",
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
          opacity: 0.026,
          mixBlendMode: "multiply",
        }}
      />
      <Img
        src={oracleAssets.logo}
        style={{position: "absolute", right: 80, top: 45, width: 178, height: "auto", zIndex: 20}}
      />
      <div style={{position: "absolute", left: 86, top: 54, width: 1380, zIndex: 10}}>
        <div
          style={{
            fontSize: 17,
            letterSpacing: 2.6,
            fontWeight: 800,
            color: p.red,
            opacity: reveal(frame, 0, 12),
          }}
        >
          {scene.eyebrow}
        </div>
        <div
          style={{
            fontSize: 56,
            lineHeight: 1.03,
            letterSpacing: -1.7,
            fontWeight: 700,
            marginTop: 13,
            opacity: reveal(frame, 5, 15),
            transform: `translateY(${interpolate(reveal(frame, 5, 15), [0, 1], [14, 0], clamp)}px)`,
          }}
        >
          {scene.title}
        </div>
        <div
          style={{
            fontSize: 23,
            lineHeight: 1.35,
            color: p.muted,
            marginTop: 11,
            width: 1280,
            opacity: reveal(frame, 12, 18),
          }}
        >
          {scene.subtitle}
        </div>
      </div>
      <div style={{position: "absolute", left: 86, right: 86, top: 252, bottom: 76}}>{children}</div>
      <div
        style={{
          position: "absolute",
          left: 86,
          right: 86,
          bottom: 28,
          height: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: p.muted,
          fontSize: 14,
          letterSpacing: 0.5,
          zIndex: 30,
        }}
      >
        <div style={{display: "flex", alignItems: "center", gap: 11}}>
          <div style={{width: 26, height: 3, borderRadius: 2, background: p.red}} />
          <span>PHARMACY UI · TASK WORKFLOW READINESS</span>
        </div>
        <span>{String(sceneIndex + 1).padStart(2, "0")} / 07</span>
      </div>
    </AbsoluteFill>
  );
};

const ScreenMockup = ({frame, fps, scene}: {frame: number; fps: number; scene: PharmacyWorkflowLightScene}) => {
  const shift = inSpring(frame, fps, 54);
  return (
    <div
      style={{
        height: "100%",
        background: p.surface,
        border: `1px solid ${p.line}`,
        borderRadius: 24,
        boxShadow: shadow,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: 60,
          background: p.canvas2,
          borderBottom: `1px solid ${p.line}`,
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          gap: 9,
        }}
      >
        {[p.red, "#D7B04A", p.green].map((color) => (
          <div key={color} style={{width: 12, height: 12, borderRadius: 8, background: color}} />
        ))}
        <div style={{marginLeft: 14, color: p.bark, fontWeight: 700}}>Verify prescription</div>
      </div>
      <div style={{padding: "28px 30px"}}>
        <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18}}>
          {["Patient", "Medication", "Order", "Directions"].map((label, index) => (
            <div key={label}>
              <div style={{fontSize: 15, color: p.muted, fontWeight: 700, marginBottom: 8}}>{label}</div>
              <div
                style={{
                  height: 46,
                  borderRadius: 8,
                  border: `1px solid ${index === 2 ? "#E3B0A7" : p.line}`,
                  background: index === 2 ? p.redSoft : p.canvas2,
                }}
              />
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: 28,
            padding: "17px 19px",
            borderRadius: 12,
            background: p.redSoft,
            border: "1px solid #E4B0A6",
            display: "flex",
            alignItems: "center",
            gap: 15,
            opacity: interpolate(shift, [0, 1], [1, 0.22], clamp),
          }}
        >
          <EngineeringIcon name="timeline" size={34} stroke={p.red} />
          <div>
            <div style={{fontSize: 19, fontWeight: 700, color: p.redDeep}}>{scene.missing}</div>
            <div style={{fontSize: 15, color: p.redDeep, marginTop: 3}}>The form cannot prove it is complete yet.</div>
          </div>
        </div>
        <div
          style={{
            marginTop: 24,
            display: "flex",
            justifyContent: "flex-end",
            opacity: interpolate(shift, [0, 1], [1, 0.28], clamp),
          }}
        >
          <div
            style={{
              background: p.red,
              color: "white",
              borderRadius: 8,
              padding: "15px 42px",
              fontSize: 19,
              fontWeight: 700,
              boxShadow: "0 8px 18px rgba(199,70,52,0.22)",
            }}
          >
            Verify
          </div>
        </div>
      </div>
    </div>
  );
};

const BigPictureScene = ({scene, fps}: SceneProps) => {
  const frame = useCurrentFrame();
  const resolved = inSpring(frame, fps, 58);
  return (
    <SceneShell scene={scene} sceneIndex={0}>
      <div style={{display: "grid", gridTemplateColumns: "0.74fr 1.26fr", gap: 38, height: "100%"}}>
        <div style={{display: "flex", flexDirection: "column", justifyContent: "center", gap: 22}}>
          <Rise frame={frame} fps={fps} delay={20}>
            <div
              style={{
                padding: 26,
                borderRadius: 20,
                background: p.surface,
                border: `1px solid ${p.line}`,
                boxShadow: shadow,
              }}
            >
              <div style={{fontSize: 18, color: p.muted, fontWeight: 700}}>WHAT THE USER SEES</div>
              <div style={{fontSize: 34, fontWeight: 700, marginTop: 10}}>{scene.problem}</div>
              <div style={{display: "flex", gap: 11, alignItems: "center", marginTop: 20, color: p.redDeep}}>
                <EngineeringIcon name="timeline" size={34} stroke={p.red} />
                <span style={{fontSize: 20, fontWeight: 700}}>{scene.missing}</span>
              </div>
            </div>
          </Rise>
          <Rise frame={frame} fps={fps} delay={54}>
            <div
              style={{
                padding: 24,
                borderRadius: 20,
                background: p.greenSoft,
                border: "1px solid #B9D2C0",
                display: "flex",
                gap: 18,
                alignItems: "center",
                opacity: resolved,
              }}
            >
              <IconBadge icon="shield" color={p.green} background="white" size={46} />
              <div>
                <div style={{fontSize: 16, letterSpacing: 1.5, fontWeight: 800, color: p.green}}>THE GOAL</div>
                <div style={{fontSize: 25, lineHeight: 1.2, fontWeight: 700, marginTop: 7}}>{scene.goal}</div>
              </div>
            </div>
          </Rise>
        </div>
        <Rise frame={frame} fps={fps} delay={29} distance={28} style={{height: "100%"}}>
          <ScreenMockup frame={frame} fps={fps} scene={scene} />
        </Rise>
      </div>
    </SceneShell>
  );
};

const ConcreteExampleScene = ({scene, fps, durationInFrames}: SceneProps) => {
  const frame = useCurrentFrame();
  const code = scene.code ?? [];
  const evidenceStart = Math.min(Math.round(fps * 13), durationInFrames - Math.round(fps * 8));
  const legacyOpacity = scene.evidence
    ? interpolate(frame, [evidenceStart - 18, evidenceStart + 18], [1, 0], clamp)
    : 1;
  const evidenceOpacity = scene.evidence
    ? interpolate(frame, [evidenceStart - 12, evidenceStart + 18], [0, 1], clamp)
    : 0;
  return (
    <SceneShell scene={scene} sceneIndex={1}>
      <div style={{position: "relative", height: "100%"}}>
      <div style={{position: "absolute", inset: 0, display: "grid", gridTemplateColumns: "1.16fr 0.84fr", gap: 32, opacity: legacyOpacity}}>
        <Rise frame={frame} fps={fps} delay={18} style={{height: "100%"}}>
          <div
            style={{
              height: "100%",
              borderRadius: 22,
              background: p.code,
              color: "white",
              overflow: "hidden",
              boxShadow: shadow,
              border: "1px solid #4B5755",
            }}
          >
            <div
              style={{
                height: 58,
                borderBottom: "1px solid #52605D",
                padding: "0 24px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                color: p.codeMuted,
                fontSize: 16,
              }}
            >
              <EngineeringIcon name="code" size={29} stroke={p.codeMuted} />
              <span>{scene.file}</span>
            </div>
            <div style={{padding: "25px 28px", fontFamily: "SFMono-Regular, Consolas, monospace"}}>
              {code.map((line, index) => {
                const highlighted = index >= code.length - 2;
                return (
                  <div
                    key={`${line}-${index}`}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "38px 1fr",
                      minHeight: 48,
                      alignItems: "center",
                      margin: "1px 0",
                      padding: "0 12px 0 0",
                      borderRadius: 8,
                      background: highlighted ? "rgba(199,70,52,0.28)" : "transparent",
                      borderLeft: highlighted ? `4px solid ${p.red}` : "4px solid transparent",
                      opacity: reveal(frame, 24 + index * 4, 12),
                    }}
                  >
                    <span style={{color: "#7F918D", fontSize: 14, textAlign: "center"}}>{index + 1}</span>
                    <span style={{fontSize: 19, color: highlighted ? "#FFE5E0" : "#EDF3F1", whiteSpace: "pre"}}>
                      {line || " "}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </Rise>
        <div style={{display: "flex", flexDirection: "column", justifyContent: "center", gap: 19}}>
          <Rise frame={frame} fps={fps} delay={42}>
            <div style={{padding: 23, borderRadius: 18, background: p.greenSoft, border: "1px solid #BBD3C0"}}>
              <div style={{display: "flex", alignItems: "center", gap: 13}}>
                <EngineeringIcon name="check" size={36} stroke={p.green} />
                <span style={{fontSize: 18, fontWeight: 800, color: p.green}}>WHAT THE RULE KNOWS</span>
              </div>
              <div style={{fontSize: 24, lineHeight: 1.3, fontWeight: 700, marginTop: 14}}>Loading is false. A dispense ID is selected.</div>
            </div>
          </Rise>
          <Rise frame={frame} fps={fps} delay={62}>
            <div style={{padding: 23, borderRadius: 18, background: p.redSoft, border: "1px solid #E5B3AA"}}>
              <div style={{display: "flex", alignItems: "center", gap: 13}}>
                <EngineeringIcon name="shield" size={36} stroke={p.red} />
                <span style={{fontSize: 18, fontWeight: 800, color: p.redDeep}}>WHAT IT DOES NOT KNOW</span>
              </div>
              <div style={{fontSize: 24, lineHeight: 1.3, fontWeight: 700, marginTop: 14}}>{scene.gap}</div>
            </div>
          </Rise>
        </div>
      </div>
      {scene.evidence ? (
        <div style={{position: "absolute", inset: 0, opacity: evidenceOpacity}}>
          <EvidencePanel
            evidence={scene.evidence}
            frame={frame - evidenceStart}
            regionFrames={(durationInFrames - evidenceStart) / scene.evidence.focusRegions.length}
          />
        </div>
      ) : null}
      </div>
    </SceneShell>
  );
};

const RootCauseScene = ({scene, fps}: SceneProps) => {
  const frame = useCurrentFrame();
  const facts = scene.facts ?? [];
  const colors = [p.green, p.blue, p.red, p.gold];
  const softs = [p.greenSoft, p.blueSoft, p.redSoft, p.goldSoft];
  return (
    <SceneShell scene={scene} sceneIndex={2}>
      <div style={{height: "100%", position: "relative"}}>
        <div style={{display: "grid", gridTemplateColumns: "1fr 240px 1fr", alignItems: "center", height: 480}}>
          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16}}>
            {facts.map((fact, index) => (
              <Rise key={fact} frame={frame} fps={fps} delay={18 + index * 10}>
                <div
                  style={{
                    height: 125,
                    borderRadius: 18,
                    background: p.surface,
                    border: `1px solid ${p.line}`,
                    boxShadow: "0 10px 26px rgba(49,45,42,0.08)",
                    padding: 19,
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <div style={{width: 13, height: 58, borderRadius: 8, background: colors[index]}} />
                  <div style={{fontSize: 22, lineHeight: 1.2, fontWeight: 700}}>{fact}</div>
                </div>
              </Rise>
            ))}
          </div>
          <div style={{position: "relative", height: 320}}>
            {facts.map((fact, index) => (
              <div
                key={fact}
                style={{
                  position: "absolute",
                  left: 12,
                  top: 45 + index * 66,
                  width: 210,
                  height: 2,
                  background: colors[index],
                  transformOrigin: "left center",
                  transform: `scaleX(${reveal(frame, 52 + index * 6, 18)}) rotate(${index < 2 ? 9 - index * 6 : -3 - (index - 2) * 6}deg)`,
                }}
              />
            ))}
            <div
              style={{
                position: "absolute",
                left: 70,
                top: 108,
                width: 108,
                height: 108,
                borderRadius: 54,
                background: p.bark,
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: shadow,
                opacity: reveal(frame, 54, 16),
              }}
            >
              <EngineeringIcon name="browser" size={58} stroke="white" />
            </div>
          </div>
          <Rise frame={frame} fps={fps} delay={65}>
            <div style={{borderRadius: 22, background: p.surface, border: `1px solid ${p.line}`, boxShadow: shadow, padding: 28}}>
              <div style={{fontSize: 17, letterSpacing: 1.5, color: p.red, fontWeight: 800}}>ONE SCREEN · CONFLICTING STORY</div>
              <div style={{fontSize: 33, lineHeight: 1.15, fontWeight: 700, marginTop: 12}}>There is no authoritative answer to “ready?”</div>
              <div style={{display: "flex", flexWrap: "wrap", gap: 11, marginTop: 25}}>
                {(scene.outcomes ?? []).map((outcome) => <Pill key={outcome} tone="red">{outcome}</Pill>)}
              </div>
            </div>
          </Rise>
        </div>
        <Rise frame={frame} fps={fps} delay={85}>
          <div
            style={{
              marginTop: 18,
              borderRadius: 18,
              background: p.goldSoft,
              border: "1px solid #E9C98C",
              padding: "20px 28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 15,
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            <EngineeringIcon name="branch" size={38} stroke={p.gold} />
            The issue is ownership—not the state library.
          </div>
        </Rise>
      </div>
    </SceneShell>
  );
};

const OneOwnerScene = ({scene, fps, durationInFrames}: SceneProps) => {
  const frame = useCurrentFrame();
  const questions = scene.questions ?? [];
  const colors = [p.blue, p.green, p.violet];
  const softs = [p.blueSoft, p.greenSoft, p.violetSoft];
  const icons: EngineeringIconName[] = ["database", "shield", "play"];
  const evidenceStart = Math.round(fps * 6);
  const evidenceEnd = durationInFrames - Math.round(fps * 5);
  const evidenceOpacity = scene.evidence
    ? interpolate(
      frame,
      [evidenceStart - 16, evidenceStart + 16, evidenceEnd - 16, evidenceEnd + 16],
      [0, 1, 1, 0],
      clamp,
    )
    : 0;
  return (
    <SceneShell scene={scene} sceneIndex={3}>
      <div style={{position: "relative", height: "100%"}}>
      <div style={{position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", opacity: 1 - evidenceOpacity}}>
        <Rise frame={frame} fps={fps} delay={18}>
          <div
            style={{
              height: 128,
              borderRadius: 22,
              background: p.bark,
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 24,
              boxShadow: shadow,
            }}
          >
            <IconBadge icon="browser" color={p.red} background="white" size={54} />
            <div>
              <div style={{fontSize: 17, letterSpacing: 2, color: "#D9D2CC", fontWeight: 800}}>ONE OWNER FOR THE OPEN TASK</div>
              <div style={{fontSize: 35, fontWeight: 700, marginTop: 7}}>A single, consistent answer for the screen.</div>
            </div>
          </div>
        </Rise>
        <div style={{display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22, marginTop: 24}}>
          {questions.map((question, index) => (
            <Rise key={question.number} frame={frame} fps={fps} delay={34 + index * 12}>
              <div
                style={{
                  height: 250,
                  borderRadius: 20,
                  background: p.surface,
                  border: `1px solid ${p.line}`,
                  boxShadow: "0 12px 30px rgba(49,45,42,0.09)",
                  padding: 25,
                  position: "relative",
                }}
              >
                <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 23,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: softs[index],
                      color: colors[index],
                      fontSize: 22,
                      fontWeight: 800,
                    }}
                  >
                    {question.number}
                  </div>
                  <EngineeringIcon name={icons[index]} size={42} stroke={colors[index]} />
                </div>
                <div style={{fontSize: 27, lineHeight: 1.18, fontWeight: 700, marginTop: 20}}>{question.question}</div>
                <div
                  style={{
                    position: "absolute",
                    left: 25,
                    bottom: 21,
                    color: colors[index],
                    fontSize: 16,
                    fontWeight: 700,
                    fontFamily: "SFMono-Regular, Consolas, monospace",
                  }}
                >
                  {question.implementation}
                </div>
              </div>
            </Rise>
          ))}
        </div>
        <Rise frame={frame} fps={fps} delay={78}>
          <div style={{display: "flex", justifyContent: "center", gap: 16, marginTop: 24}}>
            {(scene.behaviors ?? []).map((behavior, index) => (
              <Pill key={behavior} tone={index === 0 ? "green" : index === 1 ? "blue" : "gold"}>{behavior}</Pill>
            ))}
          </div>
        </Rise>
      </div>
      {scene.evidence ? (
        <div style={{position: "absolute", inset: 0, opacity: evidenceOpacity}}>
          <EvidencePanel
            evidence={scene.evidence}
            frame={frame - evidenceStart}
            regionFrames={(evidenceEnd - evidenceStart) / scene.evidence.focusRegions.length}
          />
        </div>
      ) : null}
      </div>
    </SceneShell>
  );
};

const CheckRow = ({label, active, color = p.green}: {label: string; active: boolean; color?: string}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "14px 16px",
      borderRadius: 12,
      background: active ? p.greenSoft : p.canvas2,
      border: `1px solid ${active ? "#BBD3C0" : p.line}`,
      color: active ? p.ink : p.muted,
    }}
  >
    <EngineeringIcon name="check" size={30} stroke={active ? color : p.lineStrong} />
    <span style={{fontSize: 19, fontWeight: 700}}>{label}</span>
  </div>
);

const VerifyScene = ({scene, fps}: SceneProps) => {
  const frame = useCurrentFrame();
  const checks = scene.checks ?? [];
  const progress = Math.floor(interpolate(frame, [38, 104], [0, checks.length + 0.99], clamp));
  const allReady = progress >= checks.length;
  return (
    <SceneShell scene={scene} sceneIndex={4}>
      <div style={{display: "grid", gridTemplateColumns: "0.86fr 1.14fr", gap: 30, height: "100%"}}>
        <Rise frame={frame} fps={fps} delay={18} style={{height: "100%"}}>
          <div style={{height: "100%", borderRadius: 22, background: p.surface, border: `1px solid ${p.line}`, boxShadow: shadow, padding: 27}}>
            <div style={{display: "flex", alignItems: "center", gap: 17}}>
              <IconBadge icon="database" color={p.blue} background={p.blueSoft} size={48} />
              <div>
                <div style={{fontSize: 16, color: p.blue, fontWeight: 800, letterSpacing: 1.3}}>RENDERING GATE</div>
                <div style={{fontSize: 27, fontWeight: 700, marginTop: 5}}>{scene.load}</div>
              </div>
            </div>
            <div style={{margin: "27px 0", height: 2, background: p.line}} />
            <div style={{fontSize: 17, color: p.muted, fontWeight: 700}}>WHEN THIS IS TRUE</div>
            <div style={{fontSize: 31, lineHeight: 1.2, fontWeight: 700, marginTop: 10}}>The form may render.</div>
            <div style={{padding: "20px 21px", borderRadius: 15, background: p.goldSoft, border: "1px solid #E7C685", marginTop: 24}}>
              <div style={{display: "flex", alignItems: "center", gap: 12, color: p.gold}}>
                <EngineeringIcon name="gate" size={36} stroke={p.gold} />
                <span style={{fontSize: 17, fontWeight: 800}}>NOT THE SAME AS ACTION READY</span>
              </div>
              <div style={{fontSize: 21, lineHeight: 1.28, fontWeight: 700, marginTop: 10}}>Verify remains disabled until every workflow check passes.</div>
            </div>
            <div style={{padding: "17px 19px", borderRadius: 14, background: p.redSoft, border: "1px solid #E5B3AA", marginTop: 20, color: p.redDeep, fontSize: 18, fontWeight: 700}}>
              {scene.error}
            </div>
          </div>
        </Rise>
        <Rise frame={frame} fps={fps} delay={28} style={{height: "100%"}}>
          <div style={{height: "100%", borderRadius: 22, background: p.surface, border: `1px solid ${p.line}`, boxShadow: shadow, padding: 27, display: "flex", flexDirection: "column"}}>
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
              <div>
                <div style={{fontSize: 16, color: p.green, fontWeight: 800, letterSpacing: 1.3}}>ACTION GATE</div>
                <div style={{fontSize: 29, fontWeight: 700, marginTop: 5}}>Can Verify work now?</div>
              </div>
              <Pill tone={allReady ? "green" : "neutral"}>{allReady ? "READY" : "CHECKING"}</Pill>
            </div>
            <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13, marginTop: 25}}>
              {checks.map((check, index) => <CheckRow key={check} label={check} active={index < progress} />)}
            </div>
            <div style={{flex: 1}} />
            <div
              style={{
                alignSelf: "flex-end",
                minWidth: 260,
                padding: "17px 34px",
                borderRadius: 9,
                background: allReady ? p.red : "#D9D5D1",
                color: allReady ? "white" : p.muted,
                fontSize: 22,
                fontWeight: 700,
                textAlign: "center",
                boxShadow: allReady ? "0 9px 22px rgba(199,70,52,0.22)" : "none",
                transition: "none",
              }}
            >
              Verify
            </div>
          </div>
        </Rise>
      </div>
    </SceneShell>
  );
};

const FillDispenseScene = ({scene, fps}: SceneProps) => {
  const frame = useCurrentFrame();
  const stages = scene.stages ?? [];
  const checks = scene.checks ?? [];
  const activeStage = Math.floor(interpolate(frame, [28, 88], [0, stages.length + 0.99], clamp));
  const checkProgress = Math.floor(interpolate(frame, [84, 140], [0, checks.length + 0.99], clamp));
  return (
    <SceneShell scene={scene} sceneIndex={5}>
      <div style={{height: "100%", display: "flex", flexDirection: "column"}}>
        <div style={{display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 58, position: "relative"}}>
          <div style={{position: "absolute", left: "16%", right: "16%", top: 67, height: 3, background: p.line}} />
          <div
            style={{
              position: "absolute",
              left: "16%",
              width: `${Math.min(activeStage / Math.max(1, stages.length - 1), 1) * 68}%`,
              top: 67,
              height: 3,
              background: p.green,
            }}
          />
          {stages.map((stage, index) => {
            const active = index < activeStage;
            return (
              <Rise key={stage} frame={frame} fps={fps} delay={18 + index * 11}>
                <div style={{position: "relative", textAlign: "center"}}>
                  <div
                    style={{
                      width: 82,
                      height: 82,
                      borderRadius: 42,
                      margin: "0 auto",
                      background: active ? p.green : p.surface,
                      border: `3px solid ${active ? p.green : p.line}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      zIndex: 2,
                      boxShadow: "0 9px 24px rgba(49,45,42,0.10)",
                    }}
                  >
                    <EngineeringIcon name={index === 0 ? "database" : index === 1 ? "document" : "shield"} size={43} stroke={active ? "white" : p.muted} />
                  </div>
                  <div style={{fontSize: 24, fontWeight: 700, marginTop: 14}}>{stage}</div>
                  <div style={{fontSize: 16, color: active ? p.green : p.muted, fontWeight: 700, marginTop: 5}}>{active ? "READY" : "WAITING"}</div>
                </div>
              </Rise>
            );
          })}
        </div>
        <div style={{display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 28, marginTop: 30, flex: 1}}>
          <Rise frame={frame} fps={fps} delay={65} style={{height: "100%"}}>
            <div style={{height: "100%", borderRadius: 20, background: p.surface, border: `1px solid ${p.line}`, boxShadow: shadow, padding: 24}}>
              <div style={{fontSize: 17, letterSpacing: 1.4, color: p.green, fontWeight: 800}}>THEN APPLY THE BUSINESS RULES</div>
              <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 18}}>
                {checks.map((check, index) => <CheckRow key={check} label={check} active={index < checkProgress} />)}
              </div>
            </div>
          </Rise>
          <Rise frame={frame} fps={fps} delay={92} style={{height: "100%"}}>
            <div style={{height: "100%", borderRadius: 20, background: p.redSoft, border: "1px solid #E5B3AA", padding: 25, display: "flex", flexDirection: "column", justifyContent: "center"}}>
              <div style={{display: "flex", alignItems: "center", gap: 14}}>
                <IconBadge icon="gate" color={p.red} background="white" size={43} />
                <div style={{fontSize: 17, letterSpacing: 1.3, color: p.redDeep, fontWeight: 800}}>VISIBLE NOT-READY STATE</div>
              </div>
              <div style={{fontSize: 27, lineHeight: 1.25, fontWeight: 700, marginTop: 18}}>{scene.error}</div>
              <div style={{fontSize: 18, lineHeight: 1.35, color: p.redDeep, marginTop: 12}}>The UI explains what is missing instead of accepting a dead click.</div>
            </div>
          </Rise>
        </div>
      </div>
    </SceneShell>
  );
};

const OutcomeScene = ({scene, fps}: SceneProps) => {
  const frame = useCurrentFrame();
  const icons: EngineeringIconName[] = ["gate", "play", "shield"];
  const colors = [p.blue, p.green, p.red];
  const softs = [p.blueSoft, p.greenSoft, p.redSoft];
  return (
    <SceneShell scene={scene} sceneIndex={6}>
      <div style={{height: "100%", display: "flex", flexDirection: "column"}}>
        <div style={{display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 23}}>
          {(scene.outcomes ?? []).map((outcome, index) => (
            <Rise key={outcome} frame={frame} fps={fps} delay={18 + index * 13}>
              <div style={{height: 190, borderRadius: 21, background: p.surface, border: `1px solid ${p.line}`, boxShadow: shadow, padding: 27, display: "flex", alignItems: "center", gap: 22}}>
                <IconBadge icon={icons[index]} color={colors[index]} background={softs[index]} size={50} />
                <div>
                  <div style={{fontSize: 16, letterSpacing: 1.2, fontWeight: 800, color: colors[index]}}>OUTCOME {index + 1}</div>
                  <div style={{fontSize: 30, lineHeight: 1.17, fontWeight: 700, marginTop: 10}}>{outcome}</div>
                </div>
              </div>
            </Rise>
          ))}
        </div>
        <Rise frame={frame} fps={fps} delay={62} style={{flex: 1, display: "flex"}}>
          <div
            style={{
              flex: 1,
              marginTop: 26,
              borderRadius: 22,
              background: p.bark,
              color: "white",
              display: "grid",
              gridTemplateColumns: "1.25fr 0.75fr",
              alignItems: "center",
              padding: "31px 40px",
              boxShadow: shadow,
            }}
          >
            <div>
              <div style={{fontSize: 17, letterSpacing: 2, color: "#D6CDC7", fontWeight: 800}}>THE OPERATING RULE</div>
              <div style={{fontSize: 39, lineHeight: 1.14, fontWeight: 700, marginTop: 12}}>Loading, ready, or recoverable.<br /><span style={{color: "#F07A69"}}>Never half ready.</span></div>
            </div>
            <div style={{borderLeft: "1px solid #5D5753", paddingLeft: 36}}>
              <div style={{fontSize: 19, lineHeight: 1.4, fontWeight: 700}}>{scene.credit}</div>
              <div style={{fontSize: 17, color: "#C8C1BC", marginTop: 9}}>{scene.production}</div>
              <div style={{fontSize: 15, color: "#AAA19B", marginTop: 17, lineHeight: 1.35}}>{scene.sources}</div>
            </div>
          </div>
        </Rise>
      </div>
    </SceneShell>
  );
};

const sceneComponents: Record<string, (props: SceneProps) => JSX.Element> = {
  "big-picture": BigPictureScene,
  "concrete-example": ConcreteExampleScene,
  "root-cause": RootCauseScene,
  "one-owner": OneOwnerScene,
  verify: VerifyScene,
  "fill-dispense": FillDispenseScene,
  outcome: OutcomeScene,
};

const SceneCut = ({children, durationInFrames}: {children: ReactNode; durationInFrames: number}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, 9, Math.max(10, durationInFrames - 10), durationInFrames],
    [0, 1, 1, 0],
    clamp,
  );
  return <AbsoluteFill style={{opacity}}>{children}</AbsoluteFill>;
};

export const PharmacyTaskWorkflowLightShowcase = ({manifest}: {manifest: PharmacyWorkflowLightManifest}) => (
  <ShowcaseBrandProvider mode="oracle-redwood">
    <AbsoluteFill style={{background: p.canvas}}>
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
