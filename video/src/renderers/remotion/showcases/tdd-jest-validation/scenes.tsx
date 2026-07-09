import type {ReactNode} from "react";
import {interpolate, useCurrentFrame} from "remotion";
import {EngineeringIcon} from "../../../../assets/icons/EngineeringIcons";
import {clamp} from "../../../../utils/animation";
import {tddContent} from "./content";
import {
  drift,
  enter,
  IconBadge,
  MediaPanel,
  Panel,
  reveal,
  SceneShell,
  tddPalette,
  TerminalPanel,
  toneColor,
} from "./shared";
import {mediaSource, type TddSceneProps} from "./types";

export const IntroWhatItIsScene = ({fps}: TddSceneProps) => {
  const frame = useCurrentFrame();
  const content = tddContent.intro;
  const titleIn = enter(frame, fps, 4);
  const flowProgress = interpolate(frame, [fps * 1.35, fps * 4.1], [0, 1], clamp);
  const nodes = [
    {x: 338, icon: "document" as const, color: tddPalette.gold},
    {x: 810, icon: "gate" as const, color: tddPalette.red},
    {x: 1282, icon: "code" as const, color: tddPalette.greenBright},
  ];

  return (
    <SceneShell showHeader={false}>
      <div style={{position: "absolute", left: 0, right: 0, top: 138, textAlign: "center", zIndex: 4}}>
        <div style={{fontSize: 17, letterSpacing: 2.5, color: tddPalette.gold, fontWeight: 700, opacity: reveal(frame, 0, 14)}}>
          {content.eyebrow}
        </div>
        <div
          style={{
            fontSize: 92,
            lineHeight: 0.98,
            letterSpacing: -2.3,
            fontWeight: 700,
            marginTop: 24,
            opacity: titleIn,
            transform: `translateY(${interpolate(titleIn, [0, 1], [20, 0], clamp)}px)`,
          }}
        >
          {content.title}
        </div>
        <div style={{fontSize: 32, lineHeight: 1.3, color: tddPalette.muted, marginTop: 27, opacity: reveal(frame, fps * 0.55, 18)}}>
          {content.promise}
        </div>
      </div>

      <div style={{position: "absolute", left: 270, right: 270, top: 586, height: 210}}>
        <div style={{position: "absolute", left: 162, right: 162, top: 67, height: 4, borderRadius: 99, background: "rgba(241,239,237,0.12)"}}>
          <div style={{height: "100%", width: `${flowProgress * 100}%`, borderRadius: 99, background: `linear-gradient(90deg, ${tddPalette.gold}, ${tddPalette.red}, ${tddPalette.greenBright})`}} />
        </div>
        {content.flow.map((step, index) => {
          const node = nodes[index];
          const appearance = enter(frame, fps, fps * (1.05 + index * 0.55));
          const reached = flowProgress >= index / 2;
          return (
            <div key={step.label} style={{position: "absolute", left: node.x - 270, top: 0, width: 300, textAlign: "center", opacity: appearance}}>
              <div
                style={{
                  width: 136,
                  height: 136,
                  borderRadius: 999,
                  margin: "0 auto",
                  display: "grid",
                  placeItems: "center",
                  background: reached ? `${node.color}24` : tddPalette.panel,
                  border: `2px solid ${node.color}`,
                  boxShadow: reached ? `0 18px 60px ${node.color}24` : "none",
                }}
              >
                <EngineeringIcon name={node.icon} size={61} stroke={node.color} />
              </div>
              <div style={{fontSize: 22, fontWeight: 700, marginTop: 16}}>{step.label}</div>
              <div style={{fontSize: 16, color: tddPalette.muted, marginTop: 6}}>{step.detail}</div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          left: 585,
          right: 585,
          top: 861,
          height: 56,
          borderRadius: 999,
          display: "grid",
          placeItems: "center",
          background: "rgba(241,239,237,0.055)",
          border: `1px solid ${tddPalette.line}`,
          color: tddPalette.cream,
          fontSize: 17,
          fontWeight: 700,
          letterSpacing: 1.15,
          opacity: reveal(frame, fps * 3.25, 16),
        }}
      >
        {content.placement}
      </div>
    </SceneShell>
  );
};

export const ProblemHookScene = ({fps}: TddSceneProps) => {
  const frame = useCurrentFrame();
  const content = tddContent.hook;
  const codeFirstIn = enter(frame, fps, fps * 1.0);
  const tddIn = enter(frame, fps, fps * 4.8);
  const gapIn = reveal(frame, fps * 12.2, fps * 0.75);
  const columns = [
    {
      key: "code-first",
      content: content.codeFirst,
      left: 88,
      color: tddPalette.red,
      icon: "code" as const,
      opacity: codeFirstIn,
      stepStart: 2.0,
    },
    {
      key: "tdd",
      content: content.tdd,
      left: 982,
      color: tddPalette.greenBright,
      icon: "gate" as const,
      opacity: tddIn,
      stepStart: 5.6,
    },
  ];

  return (
    <SceneShell eyebrow={content.eyebrow} title={content.title} subtitle={content.subtitle} headerWidth={1500}>
      <div style={{position: "absolute", left: 945, top: 350, width: 30, height: 455, display: "grid", placeItems: "center", opacity: reveal(frame, fps * 4.1, 18)}}>
        <div style={{width: 1, height: "100%", background: `linear-gradient(transparent, ${tddPalette.line}, transparent)`}} />
        <div style={{position: "absolute", width: 54, height: 54, borderRadius: 99, display: "grid", placeItems: "center", background: tddPalette.panelRaised, border: `1px solid ${tddPalette.line}`, color: tddPalette.muted, fontSize: 15, fontWeight: 900}}>VS</div>
      </div>

      {columns.map((column) => (
        <Panel
          key={column.key}
          accent={`${column.color}82`}
          style={{
            position: "absolute",
            left: column.left,
            top: 344,
            width: 850,
            height: 470,
            padding: "27px 28px",
            opacity: column.opacity,
            transform: `translateY(${interpolate(column.opacity, [0, 1], [24, 0], clamp)}px)`,
          }}
        >
          <div style={{display: "flex", alignItems: "center", gap: 17}}>
            <IconBadge icon={column.icon} color={column.color} size={34} />
            <div>
              <div style={{fontSize: 14, color: column.color, letterSpacing: 1.9, fontWeight: 900}}>{column.content.label}</div>
              <div style={{fontSize: 29, fontWeight: 700, marginTop: 5}}>{column.content.title}</div>
            </div>
          </div>

          <div style={{display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 26, marginTop: 28}}>
            {column.content.steps.map((step, index) => {
              const stepIn = reveal(frame, fps * (column.stepStart + index * 1.1), fps * 0.55);
              const last = index === column.content.steps.length - 1;
              return (
                <div key={step.title} style={{position: "relative", opacity: stepIn, transform: `translateX(${(1 - stepIn) * -14}px)`}}>
                  <div style={{height: 154, padding: "18px 17px", borderRadius: 17, background: `${column.color}${column.key === "tdd" ? "12" : "0C"}`, border: `1px solid ${column.color}58`}}>
                    <div style={{fontFamily: "SFMono-Regular, Menlo, monospace", fontSize: 13, color: column.color, fontWeight: 800}}>0{index + 1}</div>
                    <div style={{fontSize: 21, fontWeight: 700, marginTop: 12}}>{step.title}</div>
                    <div style={{fontSize: 16, lineHeight: 1.3, color: tddPalette.muted, marginTop: 8}}>{step.detail}</div>
                  </div>
                  {!last ? <div style={{position: "absolute", right: -23, top: 67, color: column.color, fontSize: 24, fontWeight: 900}}>→</div> : null}
                </div>
              );
            })}
          </div>

          <div style={{height: 58, borderRadius: 14, marginTop: 22, display: "flex", alignItems: "center", justifyContent: "center", background: `${column.color}16`, border: `1px solid ${column.color}70`, color: column.color, fontSize: 18, letterSpacing: 0.3, fontWeight: 800, opacity: reveal(frame, fps * (column.stepStart + 3.8), fps * 0.6)}}>
            {column.content.verdict}
          </div>
        </Panel>
      ))}

      <div style={{position: "absolute", left: 500, right: 500, top: 854, height: 92, borderRadius: 20, display: "grid", gridTemplateColumns: "250px 1fr", alignItems: "center", padding: "0 26px", background: "rgba(199,70,52,0.13)", border: `1px solid ${tddPalette.red}A0`, boxShadow: "0 24px 70px rgba(199,70,52,0.14)", opacity: gapIn, transform: `translateY(${(1 - gapIn) * 18}px)`}}>
        <div style={{fontSize: 15, letterSpacing: 1.6, color: tddPalette.red, fontWeight: 900}}>{content.gap.label}</div>
        <div style={{fontSize: 19, lineHeight: 1.3, color: tddPalette.cream, borderLeft: `1px solid ${tddPalette.red}55`, paddingLeft: 25}}>{content.gap.detail}</div>
      </div>
    </SceneShell>
  );
};

export const SddFitScene = ({fps}: TddSceneProps) => {
  const frame = useCurrentFrame();
  const content = tddContent.fit;
  const railStart = fps * 2.1;
  const railProgress = interpolate(frame, [railStart, fps * 12.5], [0, 1], clamp);
  const activeIndex = Math.min(content.phases.length - 1, Math.floor(railProgress * content.phases.length));

  return (
    <SceneShell eyebrow={content.eyebrow} title={content.title} subtitle={content.subtitle}>
      <Panel style={{position: "absolute", left: 86, right: 86, top: 338, height: 438, padding: "42px 38px"}} accent={tddPalette.line}>
        <div style={{position: "absolute", left: 108, right: 108, top: 186, height: 5, borderRadius: 99, background: "rgba(241,239,237,0.12)"}}>
          <div style={{width: `${railProgress * 100}%`, height: "100%", borderRadius: 99, background: `linear-gradient(90deg, ${tddPalette.gold}, ${tddPalette.red}, ${tddPalette.greenBright})`}} />
        </div>
        <div style={{display: "grid", gridTemplateColumns: `repeat(${content.phases.length}, 1fr)`, gap: 16, height: "100%", alignItems: "center"}}>
          {content.phases.map((phase, index) => {
            const isGate = index === 3;
            const isPassed = index <= activeIndex;
            const color = isGate ? tddPalette.red : index > 3 ? tddPalette.greenBright : tddPalette.gold;
            const appearance = enter(frame, fps, fps * (1.4 + index * 0.38));
            return (
              <div key={phase.label} style={{position: "relative", height: 250, opacity: appearance, transform: `translateY(${index % 2 === 0 ? -22 : 22}px)`}}>
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: 84,
                    width: isGate ? 94 : 72,
                    height: isGate ? 94 : 72,
                    borderRadius: 999,
                    transform: `translate(-50%, -50%) scale(${isGate ? 1 + Math.sin(frame * 0.05) * 0.025 : 1})`,
                    display: "grid",
                    placeItems: "center",
                    background: isPassed ? color : tddPalette.panelRaised,
                    border: `3px solid ${color}`,
                    color: isPassed ? tddPalette.black : color,
                    boxShadow: isGate ? `0 0 46px rgba(199,70,52,0.28)` : "0 16px 42px rgba(0,0,0,0.24)",
                    zIndex: 3,
                  }}
                >
                  <EngineeringIcon name={isGate ? "gate" : index === 5 ? "browser" : index === 4 ? "code" : "document"} size={isGate ? 48 : 38} stroke="currentColor" />
                </div>
                <div style={{position: "absolute", top: 153, left: 0, right: 0, textAlign: "center"}}>
                  <div style={{fontSize: isGate ? 24 : 21, fontWeight: 700, color: isGate ? tddPalette.white : tddPalette.cream}}>{phase.label}</div>
                  <div style={{fontSize: 16, color: isGate ? tddPalette.red : tddPalette.muted, marginTop: 8}}>{phase.detail}</div>
                  {isGate ? <div style={{fontSize: 13, color: tddPalette.gold, fontWeight: 700, letterSpacing: 1.2, marginTop: 10}}>PHASE 04</div> : null}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <div style={{position: "absolute", left: 410, right: 410, top: 822, height: 112, display: "grid", gridTemplateColumns: "1fr 78px 1fr", alignItems: "center", opacity: reveal(frame, fps * 11.5, fps * 0.8)}}>
        <div style={{height: "100%", borderRadius: 18, background: `${tddPalette.red}16`, border: `1px solid ${tddPalette.red}78`, display: "flex", alignItems: "center", justifyContent: "center", gap: 16}}>
          <EngineeringIcon name="code" size={42} stroke={tddPalette.red} />
          <div><strong style={{fontSize: 22}}>Jest</strong><div style={{fontSize: 16, color: tddPalette.muted, marginTop: 5}}>component and logic evidence</div></div>
        </div>
        <div style={{textAlign: "center", color: tddPalette.gold, fontSize: 28, fontWeight: 700}}>+</div>
        <div style={{height: "100%", borderRadius: 18, background: `${tddPalette.green}16`, border: `1px solid ${tddPalette.green}78`, display: "flex", alignItems: "center", justifyContent: "center", gap: 16}}>
          <EngineeringIcon name="browser" size={42} stroke={tddPalette.greenBright} />
          <div><strong style={{fontSize: 22}}>Playwright</strong><div style={{fontSize: 16, color: tddPalette.muted, marginTop: 5}}>browser and workflow evidence</div></div>
        </div>
      </div>
    </SceneShell>
  );
};

const FlowColumn = ({
  heading,
  items,
  color,
  icon,
  opacity,
}: {
  heading: string;
  items: readonly string[];
  color: string;
  icon: "document" | "check";
  opacity: number;
}) => (
  <Panel style={{height: 388, padding: 26, opacity, transform: `translateY(${interpolate(opacity, [0, 1], [20, 0], clamp)}px)`}} accent={`${color}75`}>
    <div style={{display: "flex", alignItems: "center", gap: 14}}>
      <IconBadge icon={icon} color={color} size={34} />
      <div style={{fontSize: 17, color, fontWeight: 700, letterSpacing: 1.5}}>{heading}</div>
    </div>
    <div style={{marginTop: 28, display: "grid", gap: 18}}>
      {items.map((item, index) => (
        <div key={item} style={{minHeight: 64, padding: "14px 16px", borderRadius: 14, background: "rgba(255,255,255,0.045)", border: `1px solid ${tddPalette.line}`, display: "flex", alignItems: "center", gap: 12}}>
          <span style={{fontFamily: "SFMono-Regular, Menlo, monospace", fontSize: 14, color}}>{String(index + 1).padStart(2, "0")}</span>
          <span style={{fontSize: 19, fontWeight: 600}}>{item}</span>
        </div>
      ))}
    </div>
  </Panel>
);

export const CapabilitiesScene = ({fps}: TddSceneProps) => {
  const frame = useCurrentFrame();
  const content = tddContent.capabilities;
  const gateIn = enter(frame, fps, fps * 2.9);
  return (
    <SceneShell eyebrow={content.eyebrow} title={content.title} subtitle={content.subtitle}>
      <div style={{position: "absolute", left: 90, right: 90, top: 338, display: "grid", gridTemplateColumns: "370px 1fr 370px", gap: 32}}>
        <FlowColumn heading="INPUTS" items={content.inputs} color={tddPalette.gold} icon="document" opacity={reveal(frame, fps * 1.2, fps * 0.6)} />

        <Panel
          accent={`${tddPalette.red}A0`}
          style={{
            height: 388,
            position: "relative",
            display: "grid",
            placeItems: "center",
            textAlign: "center",
            opacity: gateIn,
            transform: `scale(${0.91 + gateIn * 0.09})`,
            boxShadow: "0 30px 100px rgba(199,70,52,0.18)",
          }}
        >
          <div style={{position: "absolute", inset: 22, borderRadius: 18, border: `1px dashed ${tddPalette.red}55`}} />
          <div style={{position: "relative"}}>
            <IconBadge icon="gate" color={tddPalette.red} size={64} />
            <div style={{fontSize: 17, fontWeight: 700, letterSpacing: 1.7, color: tddPalette.red, marginTop: 20}}>COMPOSED VALIDATION</div>
            <div style={{fontSize: 32, lineHeight: 1.1, fontWeight: 700, marginTop: 10}}>Intent ↔ evidence ↔ code</div>
            <div style={{display: "flex", justifyContent: "center", gap: 9, marginTop: 24}}>
              {["map", "diff", "audit", "run"].map((step, index) => (
                <div key={step} style={{padding: "8px 11px", borderRadius: 999, background: index === 3 ? `${tddPalette.green}30` : "rgba(255,255,255,0.06)", border: `1px solid ${index === 3 ? tddPalette.green : tddPalette.line}`, color: index === 3 ? tddPalette.greenBright : tddPalette.muted, fontFamily: "SFMono-Regular, Menlo, monospace", fontSize: 14}}>{step}</div>
              ))}
            </div>
          </div>
        </Panel>

        <FlowColumn heading="EVIDENCE" items={content.outputs} color={tddPalette.greenBright} icon="check" opacity={reveal(frame, fps * 4.2, fps * 0.6)} />
      </div>

      <div style={{position: "absolute", left: 90, right: 90, top: 770, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 15}}>
        {content.signals.map((signal, index) => {
          const opacity = reveal(frame, fps * (6.4 + index * 0.72), fps * 0.5);
          return (
            <div key={signal.label} style={{height: 158, borderRadius: 18, padding: "20px 19px", background: index % 2 ? "rgba(241,177,63,0.075)" : "rgba(111,166,123,0.07)", border: `1px solid ${index % 2 ? `${tddPalette.gold}55` : `${tddPalette.green}55`}`, opacity, transform: `translateY(${interpolate(opacity, [0, 1], [22, 0], clamp)}px)`}}>
              <div style={{width: 30, height: 4, borderRadius: 99, background: index % 2 ? tddPalette.gold : tddPalette.greenBright}} />
              <div style={{fontSize: 21, fontWeight: 700, marginTop: 15}}>{signal.label}</div>
              <div style={{fontSize: 16, lineHeight: 1.3, color: tddPalette.muted, marginTop: 8}}>{signal.detail}</div>
            </div>
          );
        })}
      </div>
    </SceneShell>
  );
};

export const GettingStartedScene = ({fps}: TddSceneProps) => {
  const frame = useCurrentFrame();
  const content = tddContent.gettingStarted;
  const checkpoint = reveal(frame, fps * 15.4, fps * 0.75);
  return (
    <SceneShell eyebrow={content.eyebrow} title={content.title} subtitle={content.subtitle} headerWidth={1460}>
      <div style={{position: "absolute", left: 88, right: 88, top: 326, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px 28px"}}>
        {content.journey.map((item, index) => {
          const opacity = enter(frame, fps, fps * (1.2 + index * 1.7));
          const color = toneColor(item.tone);
          const endOfRow = index === 2 || index === 5;
          return (
            <div key={item.step} style={{position: "relative", opacity, transform: `translateY(${(1 - opacity) * 24}px)`}}>
              <Panel style={{height: 214, padding: "23px 26px"}} accent={`${color}70`}>
                <div style={{display: "flex", alignItems: "center", gap: 15}}>
                  <IconBadge icon={item.icon} color={color} size={31} />
                  <div>
                    <div style={{fontFamily: "SFMono-Regular, Menlo, monospace", fontSize: 13, fontWeight: 900, letterSpacing: 1.4, color}}>STEP {item.step}</div>
                    <div style={{fontSize: 25, fontWeight: 700, marginTop: 5}}>{item.title}</div>
                  </div>
                </div>
                <div style={{fontSize: 18, lineHeight: 1.36, color: tddPalette.muted, marginTop: 18, paddingRight: 10}}>{item.detail}</div>
                <div style={{position: "absolute", left: 26, right: 26, bottom: 18, height: 3, borderRadius: 99, background: `${color}25`}}>
                  <div style={{height: "100%", width: `${interpolate(frame, [fps * (2.1 + index * 1.7), fps * (3.2 + index * 1.7)], [0, 100], clamp)}%`, background: color, borderRadius: 99}} />
                </div>
              </Panel>
              {!endOfRow ? <div style={{position: "absolute", right: -23, top: 92, width: 20, textAlign: "center", color, fontSize: 23, fontWeight: 900}}>→</div> : null}
            </div>
          );
        })}
        <div style={{position: "absolute", left: 690, top: 217, width: 340, height: 38, borderRadius: 999, display: "grid", placeItems: "center", background: tddPalette.panelRaised, border: `1px solid ${tddPalette.gold}68`, color: tddPalette.gold, fontSize: 12, letterSpacing: 1.15, fontWeight: 900}}>
          APPROVED PLAN → TEST GENERATION
        </div>
      </div>

      <Panel
        accent={`${tddPalette.greenBright}88`}
        style={{
          position: "absolute",
          left: 330,
          right: 330,
          top: 824,
          height: 112,
          display: "grid",
          gridTemplateColumns: "86px 1fr 210px",
          alignItems: "center",
          padding: "0 26px",
          opacity: checkpoint,
          transform: `translateY(${(1 - checkpoint) * 22}px)`,
          boxShadow: "0 24px 80px rgba(111,166,123,0.14)",
        }}
      >
        <IconBadge icon="gate" color={tddPalette.greenBright} size={38} />
        <div>
          <div style={{fontSize: 14, fontWeight: 900, letterSpacing: 1.7, color: tddPalette.greenBright}}>PRE-IMPLEMENTATION CHECKPOINT</div>
          <div style={{fontSize: 20, lineHeight: 1.32, marginTop: 7}}>{content.checkpoint}</div>
        </div>
        <div style={{height: 50, borderRadius: 999, display: "grid", placeItems: "center", background: `${tddPalette.greenBright}20`, border: `1px solid ${tddPalette.greenBright}80`, color: tddPalette.greenBright, fontSize: 14, letterSpacing: 1.1, fontWeight: 900}}>GATE READY → CODE</div>
      </Panel>
    </SceneShell>
  );
};

const EvidenceFallback = ({example}: {example: "sample" | "change" | "gate"}) => {
  const fallbackLines = {
    sample: ["local behavior: reproduced", "Jest test: added first", "expected failure: confirmed"],
    change: ["unmapped behavior: surfaced", "potential gap: review required", "scope expansion: paused"],
    gate: ["browser workflow: identified", "unit boundary: preserved", "Playwright: follows implementation"],
  } as const;
  return (
    <div style={{position: "absolute", inset: 0}}>
      <TerminalPanel title="jest-validation-evidence" lines={fallbackLines[example]} compact />
    </div>
  );
};

export const RedGreenRefactorScene = ({fps, manifest}: TddSceneProps) => {
  const frame = useCurrentFrame();
  const content = tddContent.cycle;
  const introPhase = Math.min(2, Math.floor(frame / (fps * 1.1)));
  const activePhase = frame < fps * 3.3
    ? introPhase
    : frame < fps * 9.3
      ? 0
      : frame < fps * 13.05
        ? 1
        : 2;
  const methodologyOpacity = interpolate(frame, [fps * 12.8, fps * 14.15], [1, 0], clamp);
  const validatorOpacity = reveal(frame, fps * 13.05, fps * 0.8);
  const activeExample = frame < fps * 26.35 ? 0 : frame < fps * 30.3 ? 1 : 2;
  const phaseColors = [tddPalette.red, tddPalette.greenBright, tddPalette.gold];
  const defaultMedia = {
    redPrompt: "media/tdd-jest-validation/red-prompt.png",
    greenDiff: "media/tdd-jest-validation/green-diff.png",
    refactorEvidence: "media/tdd-jest-validation/refactor-evidence.png",
  } as const;
  const activeBranch = content.validator.branches[activeExample];
  const activeMedia = mediaSource(manifest.media?.[activeBranch.mediaKey]) ?? defaultMedia[activeBranch.mediaKey];

  return (
    <SceneShell showHeader={false}>
      <div style={{position: "absolute", inset: 0, opacity: methodologyOpacity}}>
        <div style={{position: "absolute", left: 92, top: 70}}>
          <div style={{fontSize: 17, letterSpacing: 2.3, color: tddPalette.gold, fontWeight: 700}}>{content.methodology.eyebrow}</div>
          <div style={{fontSize: 66, lineHeight: 1, fontWeight: 700, letterSpacing: -1.3, marginTop: 14}}>{content.methodology.title}</div>
          <div style={{fontSize: 24, color: tddPalette.muted, marginTop: 16}}>{content.methodology.subtitle}</div>
        </div>

        <div style={{position: "absolute", left: 92, right: 92, top: 320, height: 460, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28}}>
          {content.phases.map((phase, index) => {
            const color = phaseColors[index];
            const active = index === activePhase;
            return (
              <Panel key={phase.id} accent={`${color}${active ? "C8" : "48"}`} style={{height: 430, padding: "34px 34px", opacity: active ? 1 : 0.38, transform: `scale(${active ? 1 : 0.97})`, boxShadow: active ? `0 28px 90px ${color}20` : "none"}}>
                <div style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                  <div style={{width: 82, height: 82, borderRadius: 99, display: "grid", placeItems: "center", background: `${color}22`, border: `2px solid ${color}`, color, fontSize: 18, letterSpacing: 1.6, fontWeight: 900}}>{phase.label}</div>
                  <div style={{fontFamily: "SFMono-Regular, Menlo, monospace", fontSize: 14, color, fontWeight: 800}}>0{index + 1}</div>
                </div>
                <div style={{fontSize: 31, lineHeight: 1.1, fontWeight: 700, marginTop: 28}}>{phase.kicker}</div>
                <div style={{fontSize: 19, lineHeight: 1.38, color: tddPalette.muted, marginTop: 15}}>{phase.detail}</div>
                <div style={{height: 1, background: tddPalette.line, margin: "25px 0 18px"}} />
                <div style={{display: "grid", gap: 10}}>
                  {phase.behaviors.slice(0, 2).map((behavior) => (
                    <div key={behavior} style={{display: "flex", alignItems: "center", gap: 11, fontSize: 17, color: tddPalette.cream}}>
                      <span style={{width: 8, height: 8, borderRadius: 99, background: color}} />{behavior}
                    </div>
                  ))}
                </div>
              </Panel>
            );
          })}
        </div>

        <div style={{position: "absolute", left: 640, right: 640, top: 820, height: 66, borderRadius: 999, display: "grid", placeItems: "center", background: "rgba(255,255,255,0.045)", border: `1px solid ${tddPalette.line}`, color: tddPalette.muted, fontSize: 15, letterSpacing: 1.3, fontWeight: 800}}>
          {content.methodology.repeat.toUpperCase()}
        </div>
        <div style={{position: "absolute", right: 94, bottom: 42, fontSize: 14, color: tddPalette.muted, letterSpacing: 1.15}}>
          {content.methodology.sourceLabel}
        </div>
      </div>

      <div style={{position: "absolute", inset: 0, opacity: validatorOpacity}}>
        <div style={{position: "absolute", left: 92, top: 56}}>
          <div style={{fontSize: 16, letterSpacing: 2.2, color: tddPalette.gold, fontWeight: 800}}>{content.validator.eyebrow}</div>
          <div style={{fontSize: 55, lineHeight: 1.02, fontWeight: 700, letterSpacing: -1.2, marginTop: 12}}>{content.validator.statement}</div>
        </div>
        <div style={{position: "absolute", right: 300, top: 76, display: "flex", gap: 8}}>
          {["RED", "GREEN", "REFACTOR", "REPEAT"].map((label, index) => {
            const color = [tddPalette.red, tddPalette.greenBright, tddPalette.gold, tddPalette.cream][index];
            return <div key={label} style={{padding: "10px 14px", borderRadius: 999, background: `${color}12`, border: `1px solid ${color}60`, color, fontSize: 13, fontWeight: 900, letterSpacing: 1.1}}>{label}</div>;
          })}
        </div>

        <div style={{position: "absolute", left: 88, right: 88, top: 190, height: 148, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22}}>
          {content.validator.discovery.map((item, index) => {
            const color = toneColor(item.tone);
            const itemIn = reveal(frame, fps * (7.2 + index * 1.15), fps * 0.55);
            return (
              <Panel key={item.label} accent={`${color}68`} style={{height: 132, padding: "20px 22px", display: "grid", gridTemplateColumns: "70px 1fr", alignItems: "center", gap: 14, opacity: itemIn, transform: `translateX(${(1 - itemIn) * -16}px)`}}>
                <IconBadge icon={item.icon} color={color} size={31} />
                <div>
                  <div style={{fontSize: 22, fontWeight: 700}}>{item.label}</div>
                  <div style={{fontSize: 16, lineHeight: 1.3, color: tddPalette.muted, marginTop: 7}}>{item.detail}</div>
                </div>
                {index < 2 ? <div style={{position: "absolute", right: -20, top: 50, color, fontSize: 23, fontWeight: 900, zIndex: 4}}>→</div> : null}
              </Panel>
            );
          })}
        </div>

        <div style={{position: "absolute", left: 88, top: 362, width: 1038, height: 468}}>
          <div style={{fontSize: 13, color: tddPalette.red, letterSpacing: 1.55, fontWeight: 900, marginBottom: 13}}>WHEN LOCAL TESTING SURFACES NEW BEHAVIOR</div>
          <div style={{display: "grid", gap: 13}}>
            {content.validator.branches.map((branch, index) => {
              const color = toneColor(branch.tone);
              const active = index === activeExample;
              const branchIn = reveal(frame, fps * (11.8 + index * 1.15), fps * 0.55);
              return (
                <Panel key={branch.id} accent={`${color}${active ? "B8" : "40"}`} style={{height: 126, padding: "18px 21px", display: "grid", gridTemplateColumns: "310px 1fr", alignItems: "center", opacity: branchIn * (active ? 1 : 0.5), transform: `translateX(${(1 - branchIn) * -18}px) scale(${active ? 1 : 0.985})`, boxShadow: active ? `0 18px 52px ${color}18` : "none"}}>
                  <div style={{borderRight: `1px solid ${tddPalette.line}`, paddingRight: 18}}>
                    <div style={{fontSize: 13, letterSpacing: 1.25, color, fontWeight: 900}}>{branch.label}</div>
                    <div style={{display: "flex", gap: 6, marginTop: 12}}>
                      {branch.guardrails.map((guardrail) => <span key={guardrail} style={{padding: "5px 8px", borderRadius: 999, background: `${color}14`, border: `1px solid ${color}48`, color, fontSize: 11, fontWeight: 800}}>{guardrail}</span>)}
                    </div>
                  </div>
                  <div style={{fontSize: 21, lineHeight: 1.35, fontWeight: active ? 700 : 500, paddingLeft: 24}}>{branch.detail}</div>
                </Panel>
              );
            })}
          </div>
        </div>

        <div style={{position: "absolute", left: 1170, right: 88, top: 362, height: 468, opacity: enter(frame, fps, fps * 11.5)}}>
          <MediaPanel
            source={activeMedia}
            label={content.validator.evidenceLabel}
            fallback={<EvidenceFallback example={activeBranch.id} />}
            objectPosition={activeExample === 0 ? "50% 10%" : activeExample === 1 ? "50% 44%" : "left center"}
            mediaStyle={activeExample === 0
              ? {width: "170%", height: "170%", left: "-23%", top: "-2%"}
              : activeExample === 2
                ? {width: "200%", height: "100%", left: 0, top: 0}
                : undefined}
          />
          <div style={{position: "absolute", left: 18, right: 18, bottom: 18, minHeight: 70, borderRadius: 14, display: "flex", alignItems: "center", padding: "14px 18px", background: "rgba(16,18,16,0.92)", border: `1px solid ${toneColor(activeBranch.tone)}88`, color: tddPalette.cream, fontSize: 17, lineHeight: 1.3, fontWeight: 650}}>
            {activeBranch.detail}
          </div>
        </div>

        <Panel accent={`${tddPalette.greenBright}70`} style={{position: "absolute", left: 260, right: 260, top: 866, height: 82, display: "flex", alignItems: "center", justifyContent: "center", gap: 19, opacity: reveal(frame, fps * 27.8, fps * 0.7)}}>
          <EngineeringIcon name="branch" size={36} stroke={tddPalette.greenBright} />
          <div style={{fontSize: 21, fontWeight: 700}}>{content.validator.note}</div>
        </Panel>
      </div>
    </SceneShell>
  );
};

const DashboardFallback = ({active}: {active: number}) => {
  const views = [
    "Feature Readiness",
    "Implementation Unit Spec Coverage",
    "NFR & Backport Review",
  ];
  const rows = [
    active === 0
      ? ["Requirements mapped", "evidence linked", "ready"]
      : active === 1
        ? ["Planned source path", "spec path linked", "ready"]
        : ["NFR applicability", "decision recorded", "ready"],
    active === 0
      ? ["Unit Test Target Plan", "reviewed", "ready"]
      : active === 1
        ? ["Requirement IDs", "mapping needed", "review"]
        : ["Potential gaps", "review required", "review"],
    active === 0
      ? ["Jest TDD baseline", "captured", "ready"]
      : active === 1
        ? ["Assertion evidence", "preserved", "ready"]
        : ["Backport candidates", "scope held", "ready"],
    active === 0
      ? ["Composed gate", "blockers visible", "review"]
      : active === 1
        ? ["Implementation drift", "changed paths checked", "ready"]
        : ["NFR-only tests", "traceability review", "review"],
  ];
  return (
    <div style={{position: "absolute", inset: 0, padding: "70px 34px 30px", background: "#F4F1EE", color: tddPalette.ink}}>
      <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
        <div><div style={{fontSize: 15, letterSpacing: 1.5, fontWeight: 700, color: tddPalette.red}}>JEST UNIT TEST DASHBOARD</div><div style={{fontSize: 29, fontWeight: 700, marginTop: 5}}>{views[active]}</div></div>
        <div style={{padding: "10px 14px", borderRadius: 999, color: tddPalette.green, background: tddPalette.greenSoft, fontSize: 15, fontWeight: 800}}>GATE SIGNALS</div>
      </div>
      <div style={{display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 19}}>
        {views.map((view, index) => (
          <div key={view} style={{minHeight: 58, borderRadius: 10, background: active === index ? tddPalette.ink : tddPalette.white, border: `1px solid ${active === index ? tddPalette.ink : "#D7D1CC"}`, padding: "10px 12px", display: "flex", alignItems: "center"}}>
            <div style={{fontSize: 13, lineHeight: 1.2, fontWeight: 700, color: active === index ? tddPalette.white : "#6B6661"}}>{view}</div>
          </div>
        ))}
      </div>
      <div style={{marginTop: 18, borderRadius: 14, overflow: "hidden", border: "1px solid #D7D1CC", background: tddPalette.white}}>
        {rows.map((row, index) => (
          <div key={row[0]} style={{height: 61, display: "grid", gridTemplateColumns: "1.3fr 1fr 110px", alignItems: "center", padding: "0 18px", borderBottom: index === rows.length - 1 ? "none" : "1px solid #E7E1DC", fontSize: 16}}>
            <strong>{row[0]}</strong><span style={{color: "#6B6661"}}>{row[1]}</span><span style={{justifySelf: "end", padding: "6px 9px", borderRadius: 999, background: row[2] === "ready" ? tddPalette.greenSoft : tddPalette.goldSoft, color: row[2] === "ready" ? "#487253" : "#7B5818", fontSize: 13, fontWeight: 800}}>{row[2].toUpperCase()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const DashboardScene = ({fps}: TddSceneProps) => {
  const frame = useCurrentFrame();
  const content = tddContent.dashboard;
  const cycleFrames = fps * 5.45;
  const active = Math.min(2, Math.floor(Math.max(0, frame - fps * 1.1) / cycleFrames));
  const mediaLabels = ["FEATURE READINESS", "IMPLEMENTATION UNIT SPEC COVERAGE", "NFR & BACKPORT REVIEW"];
  const questionGroups = [content.questions.slice(0, 2), content.questions.slice(2, 4), content.questions.slice(4, 6)];

  return (
    <SceneShell eyebrow={content.eyebrow} title={content.title} subtitle={content.subtitle} headerWidth={980}>
      <div style={{position: "absolute", left: 90, top: 355, width: 540, height: 565}}>
        <div style={{fontSize: 16, color: tddPalette.gold, letterSpacing: 1.6, fontWeight: 700}}>QUESTIONS THIS VIEW CAN ANSWER</div>
        <div style={{display: "grid", gap: 17, marginTop: 22}}>
          {content.questions.map((question, index) => {
            const group = Math.floor(index / 2);
            const isActive = group === active;
            const opacity = reveal(frame, fps * (0.9 + index * 0.28), fps * 0.45);
            return (
              <div key={question} style={{height: 66, borderRadius: 16, display: "flex", alignItems: "center", gap: 14, padding: "0 17px", background: isActive ? `${tddPalette.red}18` : "rgba(255,255,255,0.035)", border: `1px solid ${isActive ? `${tddPalette.red}99` : tddPalette.line}`, color: isActive ? tddPalette.white : tddPalette.muted, opacity, transform: `translateX(${(1 - opacity) * -18}px)`}}>
                <div style={{width: 31, height: 31, borderRadius: 99, display: "grid", placeItems: "center", background: isActive ? tddPalette.red : tddPalette.panelRaised, color: isActive ? tddPalette.white : tddPalette.muted, fontWeight: 800}}>?</div>
                <div style={{fontSize: 19, fontWeight: isActive ? 700 : 500}}>{question}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{position: "absolute", left: 680, right: 78, top: 296, height: 650, opacity: enter(frame, fps, fps * 1.1), transform: `translateY(${drift(frame, 4, 0.018)}px)`}}>
        <MediaPanel label={`DASHBOARD · ${mediaLabels[active]}`} fallback={<DashboardFallback active={active} />} objectPosition="50% 20%" />
        <div style={{position: "absolute", left: 26, right: 26, bottom: 22, height: 66, borderRadius: 14, background: "rgba(16,18,16,0.91)", border: `1px solid ${tddPalette.lineSoft}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 22px"}}>
          <div style={{fontSize: 18, color: tddPalette.cream, fontWeight: 600}}>{questionGroups[active].join("  ·  ")}</div>
          <div style={{display: "flex", gap: 7}}>{[0, 1, 2].map((index) => <span key={index} style={{width: index === active ? 24 : 8, height: 8, borderRadius: 99, background: index === active ? tddPalette.red : tddPalette.line}} />)}</div>
        </div>
      </div>
    </SceneShell>
  );
};

const UsageExample = ({example, active}: {example: (typeof tddContent.usage.examples)[number]; active: boolean}) => (
  <div style={{position: "absolute", inset: 0, opacity: active ? 1 : 0}}>
    <TerminalPanel title={example.title} lines={example.lines} accent={example.label === "CODEX" ? tddPalette.red : example.label === "CLI" ? tddPalette.greenBright : tddPalette.gold} />
  </div>
);

export const UsageCtaScene = ({fps}: TddSceneProps) => {
  const frame = useCurrentFrame();
  const content = tddContent.usage;
  const ctaStart = fps * 9.8;
  const cta = reveal(frame, ctaStart, fps * 0.8);
  const activeTab = Math.min(2, Math.floor(frame / (fps * 3.2)));
  return (
    <SceneShell eyebrow={content.eyebrow} title={content.title} headerWidth={1100}>
      <div style={{position: "absolute", left: 128, right: 128, top: 286, height: 620, opacity: 1 - cta}}>
        <div style={{height: 70, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12}}>
          {content.examples.map((example, index) => {
            const active = index === activeTab;
            const color = index === 0 ? tddPalette.red : index === 1 ? tddPalette.greenBright : tddPalette.gold;
            return (
              <div key={example.label} style={{borderRadius: "16px 16px 0 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, background: active ? `${color}22` : "rgba(255,255,255,0.035)", border: `1px solid ${active ? color : tddPalette.line}`, color: active ? tddPalette.white : tddPalette.muted}}>
                <EngineeringIcon name={index === 0 ? "worker" : index === 1 ? "terminal" : "timeline"} size={34} stroke={active ? color : tddPalette.muted} />
                <span style={{fontSize: 18, fontWeight: 800, letterSpacing: 1.6}}>{example.label}</span>
              </div>
            );
          })}
        </div>
        <div style={{position: "absolute", left: 0, right: 0, top: 86, bottom: 0}}>
          {content.examples.map((example, index) => <UsageExample key={example.label} example={example} active={index === activeTab} />)}
        </div>
      </div>

      <div style={{position: "absolute", inset: 0, display: "grid", placeItems: "center", opacity: cta, transform: `scale(${interpolate(cta, [0, 1], [0.94, 1], clamp)})`}}>
        <div style={{width: 1420, textAlign: "center"}}>
          <div style={{display: "flex", justifyContent: "center", gap: 14, marginBottom: 34}}>
            {[
              {icon: "play", color: tddPalette.red, label: "USE IT"},
              {icon: "check", color: tddPalette.greenBright, label: "STRESS-TEST"},
              {icon: "branch", color: tddPalette.gold, label: "CONTRIBUTE"},
            ].map((item) => (
              <div key={item.label} style={{width: 190, height: 72, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: `${item.color}16`, border: `1px solid ${item.color}88`, color: item.color, fontSize: 15, fontWeight: 800, letterSpacing: 1.4}}>
                <EngineeringIcon name={item.icon as "play" | "check" | "branch"} size={30} stroke={item.color} />{item.label}
              </div>
            ))}
          </div>
          <div style={{fontSize: 72, lineHeight: 1, letterSpacing: -1.5, fontWeight: 700}}>{content.cta}</div>
          <div style={{fontSize: 26, lineHeight: 1.35, color: tddPalette.muted, margin: "28px auto 0", width: 1040}}>{content.ctaDetail}</div>
          <div style={{width: 180, height: 7, borderRadius: 99, background: `linear-gradient(90deg, ${tddPalette.red}, ${tddPalette.gold}, ${tddPalette.greenBright})`, margin: "42px auto 0"}} />
        </div>
      </div>
    </SceneShell>
  );
};

export type TddSceneComponent = (props: TddSceneProps) => ReactNode;

export const tddSceneComponents = {
  introduction: IntroWhatItIsScene,
  "problem-hook": ProblemHookScene,
  "sdd-fit": SddFitScene,
  capabilities: CapabilitiesScene,
  "getting-started": GettingStartedScene,
  "red-green-refactor": RedGreenRefactorScene,
  dashboard: DashboardScene,
  "usage-cta": UsageCtaScene,
} as const;
