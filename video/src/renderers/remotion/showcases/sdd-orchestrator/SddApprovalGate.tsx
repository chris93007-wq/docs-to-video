import type { ReactNode } from "react";
import { interpolate } from "remotion";
import { EngineeringIcon, EngineeringIconName } from "../../../../assets/icons/EngineeringIcons";
import { clamp } from "../../../../utils/animation";
import content from "../../../../../content/sdd-orchestrator-launch-content.json";
import { colorForTone, useOracleBrand, useShowcaseTheme } from "./brand";
import { ShowcaseFrame, ShowcaseSceneProps, useSceneBeats } from "./shared";

type PerformanceBeat = {
  displayText: string;
  startSeconds: number;
  speechEndSeconds: number;
  endSeconds: number;
};

const sceneContent = content.scenes.problem;
const fallbackQuestionLabels = sceneContent.questions.map((question) => question.text);
const questionTopics = sceneContent.questions.map((question) => question.topic);

const questionOpacity = (
  seconds: number,
  beat: PerformanceBeat,
  isLast: boolean,
  sceneDurationSeconds: number,
) => {
  const fadeInStart = Math.max(0, beat.startSeconds - 0.16);
  const fadeInEnd = beat.startSeconds + 0.16;
  const fadeOutStart = isLast
    ? Math.max(beat.speechEndSeconds, sceneDurationSeconds - 0.7)
    : Math.max(beat.speechEndSeconds, beat.endSeconds - 0.18);
  const fadeOutEnd = isLast ? sceneDurationSeconds : beat.endSeconds + 0.08;
  return interpolate(
    seconds,
    [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd],
    [0, 1, 1, 0],
    clamp,
  );
};

const SkillOrderVisual = ({ frame }: { frame: number }) => {
  const theme = useShowcaseTheme();
  const isOracle = useOracleBrand();
  const skills = sceneContent.skillOrder;
  return (
    <div style={{ position: "relative", width: 640, height: 390 }}>
      <svg
        width="640"
        height="390"
        viewBox="0 0 640 390"
        style={{ position: "absolute", inset: 0 }}
      >
        <path
          d="M92 104 C234 22 262 316 410 194 S516 58 570 114"
          fill="none"
          stroke="rgba(255,255,255,0.28)"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M74 294 C206 154 314 330 522 252"
          fill="none"
          stroke={theme.colors.accent}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="12 16"
        />
      </svg>
      {skills.map((skill, index) => {
        const x = [18, 210, 410, 120, 372][index];
        const y = [42, 16, 98, 250, 260][index];
        const wobble = Math.sin((frame + index * 31) / 18) * 5;
        return (
          <div
            key={skill}
            style={{
              position: "absolute",
              left: x,
              top: y + wobble,
              minWidth: 150,
              padding: "16px 18px",
              borderRadius: 18,
              background: "rgba(255,255,255,0.96)",
              border: `2px solid ${index % 2 ? theme.colors.violet : theme.colors.accent}`,
              boxShadow: "0 16px 38px rgba(0,0,0,0.18)",
              ...theme.typography.label,
              color: theme.colors.ink,
              textAlign: "center",
            }}
          >
            {skill}
          </div>
        );
      })}
      <div
        style={{
          position: "absolute",
          left: 265,
          top: 152,
          width: 112,
          height: 112,
          borderRadius: 999,
          background: theme.colors.white,
          color: theme.colors.accent,
          display: "grid",
          placeItems: "center",
          ...theme.typography.hero,
          fontSize: 72,
          boxShadow: isOracle ? "0 20px 60px rgba(49,45,42,0.22)" : "0 20px 60px rgba(47,128,237,0.28)",
        }}
      >
        ?
      </div>
    </div>
  );
};

const ArtifactReadinessVisual = () => {
  const theme = useShowcaseTheme();
  const inputs = sceneContent.artifactReadiness.inputs.map((input) => ({
    ...input,
    icon: input.icon as EngineeringIconName,
    color: colorForTone(theme, input.tone),
  }));

  return (
    <div style={{ position: "relative", width: 640, height: 390 }}>
      <svg
        width="640"
        height="390"
        viewBox="0 0 640 390"
        style={{ position: "absolute", inset: 0 }}
      >
        {[84, 194, 304].map((y) => (
          <path
            key={y}
            d={`M278 ${y} C330 ${y} 330 195 386 195`}
            fill="none"
            stroke="rgba(255,255,255,0.32)"
            strokeWidth="5"
            strokeLinecap="round"
          />
        ))}
      </svg>
      {inputs.map((input, index) => (
        <div
          key={input.label}
          style={{
            position: "absolute",
            left: 24,
            top: 34 + index * 110,
            width: 264,
            height: 94,
            boxSizing: "border-box",
            borderRadius: 20,
            background: theme.colors.white,
            border: `2px solid ${input.color}`,
            boxShadow: "0 16px 44px rgba(0,0,0,0.16)",
            padding: "16px 18px",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <EngineeringIcon name={input.icon} stroke={input.color} size={46} />
          <div>
            <div style={{ ...theme.typography.label, color: theme.colors.ink }}>
              {input.label}
            </div>
            <div
              style={{
                ...theme.typography.small,
                color: theme.colors.muted,
                marginTop: 4,
              }}
            >
              {input.detail}
            </div>
          </div>
        </div>
      ))}
      <div
        style={{
          position: "absolute",
          right: 18,
          top: 52,
          width: 238,
          height: 286,
          boxSizing: "border-box",
          borderRadius: 28,
          background:
            "linear-gradient(155deg, rgba(229,164,23,0.98), rgba(247,199,94,0.88))",
          color: theme.colors.white,
          border: "2px solid rgba(255,255,255,0.68)",
          boxShadow: "0 26px 70px rgba(229,164,23,0.3)",
          padding: 22,
        }}
      >
        <div
          style={{
            ...theme.typography.small,
            color: "rgba(255,255,255,0.78)",
            textTransform: "uppercase",
            letterSpacing: 1.2,
          }}
        >
          {sceneContent.artifactReadiness.eyebrow}
        </div>
        <div
          style={{
            ...theme.typography.h2,
            fontSize: 30,
            lineHeight: 1.02,
            color: theme.colors.white,
            marginTop: 10,
          }}
        >
          {sceneContent.artifactReadiness.question}
        </div>
        <div style={{ display: "grid", gap: 6, marginTop: 14 }}>
          {sceneContent.artifactReadiness.checklist.map((label) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                ...theme.typography.small,
                color: theme.colors.white,
              }}
            >
              <EngineeringIcon
                name="check"
                stroke={theme.colors.white}
                size={24}
              />{" "}
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AlignmentVisual = ({ frame }: { frame: number }) => {
  const theme = useShowcaseTheme();
  const isOracle = useOracleBrand();
  const pulse = 0.72 + Math.sin(frame / 9) * 0.16;
  const rows = sceneContent.alignment.rows;
  const sides = sceneContent.alignment.sides.map((side, index) => ({
    ...side,
    left: [18, 390][index],
    icon: side.icon as EngineeringIconName,
    color: colorForTone(theme, side.tone),
  }));
  return (
    <div style={{ position: "relative", width: 640, height: 390 }}>
      <svg
        width="640"
        height="390"
        viewBox="0 0 640 390"
        style={{ position: "absolute", inset: 0 }}
      >
        {rows.map((_, index) => {
          const y = 150 + index * 68;
          return (
            <path
              key={y}
              d={`M250 ${y} C286 ${y} 352 ${y} 390 ${y}`}
              fill="none"
              stroke={theme.colors.violet}
              strokeOpacity={pulse}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray="10 12"
            />
          );
        })}
      </svg>
      {sides.map((side) => (
        <div
          key={side.title}
          style={{
            position: "absolute",
            left: side.left,
            top: 40,
            width: 232,
            height: 310,
            boxSizing: "border-box",
            borderRadius: 24,
            background: theme.colors.white,
            border: `2px solid ${side.color}`,
            boxShadow: "0 20px 56px rgba(0,0,0,0.17)",
            padding: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <EngineeringIcon name={side.icon} stroke={side.color} size={44} />
            <div>
              <div
                style={{ ...theme.typography.label, color: theme.colors.ink }}
              >
                {side.title}
              </div>
              <div
                style={{
                  ...theme.typography.small,
                  color: theme.colors.muted,
                  marginTop: 2,
                }}
              >
                {side.subtitle}
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
            {rows.map((label) => (
              <div
                key={label}
                style={{
                  height: 42,
                  borderRadius: 14,
                  background:
                    side.color === theme.colors.accent
                      ? isOracle ? "rgba(199,70,52,0.09)" : "rgba(47,128,237,0.09)"
                      : isOracle ? "rgba(222,176,104,0.13)" : "rgba(111,76,214,0.09)",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 14px",
                  ...theme.typography.small,
                  color: theme.colors.ink,
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      ))}
      <div
        style={{
          position: "absolute",
          left: 278,
          top: 55,
          width: 86,
          height: 86,
          borderRadius: 999,
          background: theme.colors.violet,
          color: theme.colors.white,
          display: "grid",
          placeItems: "center",
          boxShadow: `0 0 0 ${10 + pulse * 7}px ${isOracle ? "rgba(222,176,104,0.18)" : "rgba(111,76,214,0.14)"}`,
        }}
      >
        <EngineeringIcon name="check" stroke={theme.colors.white} size={52} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 260,
          top: 152,
          width: 122,
          height: 48,
          borderRadius: theme.radius.pill,
          background: theme.colors.violet,
          color: theme.colors.white,
          display: "grid",
          placeItems: "center",
          ...theme.typography.label,
        }}
      >
        {sceneContent.alignment.callout}
      </div>
    </div>
  );
};

const LifecycleVisual = () => {
  const theme = useShowcaseTheme();
  const nodes = sceneContent.lifecycle.nodes;
  return (
    <div style={{ position: "relative", width: 640, height: 390 }}>
      <div
        style={{
          position: "absolute",
          left: 54,
          top: 184,
          width: 530,
          height: 8,
          borderRadius: 99,
          background: "rgba(255,255,255,0.28)",
        }}
      />
      {nodes.map((node, index) => (
        <div
          key={node}
          style={{
            position: "absolute",
            left: 32 + index * 104,
            top: index % 2 ? 206 : 96,
            width: 82,
            height: 82,
            borderRadius: 999,
            background: index < 2 ? theme.colors.teal : theme.colors.white,
            border: `4px solid ${index < 2 ? theme.colors.teal : theme.colors.accent}`,
            color: index < 2 ? theme.colors.white : theme.colors.ink,
            display: "grid",
            placeItems: "center",
            textAlign: "center",
            ...theme.typography.small,
            fontWeight: 780,
            boxShadow: "0 16px 42px rgba(0,0,0,0.16)",
          }}
        >
          {node}
        </div>
      ))}
      <div
        style={{
          position: "absolute",
          left: 240,
          top: 130,
          width: 148,
          height: 148,
          borderRadius: 999,
          background: theme.colors.gold,
          color: theme.colors.white,
          border: "8px solid rgba(255,255,255,0.92)",
          display: "grid",
          placeItems: "center",
          ...theme.typography.hero,
          fontSize: 70,
          boxShadow: "0 24px 70px rgba(229,164,23,0.34)",
        }}
      >
        ?
      </div>
      <div
        style={{
          position: "absolute",
          left: 198,
          bottom: 24,
          width: 240,
          textAlign: "center",
          ...theme.typography.label,
          color: theme.colors.white,
        }}
      >
        {sceneContent.lifecycle.footer}
      </div>
    </div>
  );
};

const ScopeVisual = () => {
  const theme = useShowcaseTheme();
  const isOracle = useOracleBrand();
  return (
  <div style={{ position: "relative", width: 640, height: 390 }}>
    <div
      style={{
        position: "absolute",
        left: 46,
        top: 36,
        right: 46,
        bottom: 36,
        borderRadius: 28,
        border: `4px dashed ${theme.colors.violet}`,
        background: isOracle ? "rgba(222,176,104,0.12)" : "rgba(111,76,214,0.1)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: 72,
        top: 74,
        width: 214,
        height: 126,
        boxSizing: "border-box",
        borderRadius: 20,
        background: theme.colors.white,
        border: `2px solid ${theme.colors.violet}`,
        padding: 18,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <EngineeringIcon
          name="confluence"
          stroke={theme.colors.violet}
          size={44}
        />
        <div style={{ ...theme.typography.label, color: theme.colors.ink }}>
          {sceneContent.scope.approvedLabel}
        </div>
      </div>
      <div
        style={{
          ...theme.typography.small,
          color: theme.colors.muted,
          marginTop: 8,
        }}
      >
        {sceneContent.scope.approvedDetail}
      </div>
    </div>
    <div
      style={{
        position: "absolute",
        right: 74,
        top: 70,
        width: 224,
        height: 126,
        boxSizing: "border-box",
        borderRadius: 20,
        background: theme.colors.white,
        border: `2px solid ${theme.colors.red}`,
        padding: 18,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <EngineeringIcon name="code" stroke={theme.colors.red} size={44} />
        <div style={{ ...theme.typography.label, color: theme.colors.ink }}>
          {sceneContent.scope.changedLabel}
        </div>
      </div>
      <div
        style={{
          ...theme.typography.small,
          color: theme.colors.red,
          marginTop: 8,
        }}
      >
        {sceneContent.scope.changedDetail}
      </div>
    </div>
    <svg
      width="640"
      height="390"
      viewBox="0 0 640 390"
      style={{ position: "absolute", inset: 0 }}
    >
      <path
        d="M286 132 C324 82 354 82 396 132"
        fill="none"
        stroke={theme.colors.gold}
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="m380 112 20 20-24 14"
        fill="none"
        stroke={theme.colors.gold}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M150 250 C276 320 408 320 510 250"
        fill="none"
        stroke={theme.colors.teal}
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray="12 14"
      />
    </svg>
    <div
      style={{
        position: "absolute",
        left: 188,
        bottom: 42,
        width: 264,
        height: 74,
        borderRadius: theme.radius.pill,
        background: theme.colors.teal,
        color: theme.colors.white,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        ...theme.typography.label,
        boxShadow: isOracle ? "0 20px 54px rgba(49,45,42,0.22)" : "0 20px 54px rgba(0,168,142,0.28)",
      }}
    >
      <EngineeringIcon name="shield" stroke={theme.colors.white} size={44} />{" "}
      {sceneContent.scope.result}
    </div>
  </div>
  );
};

const questionVisuals: Array<(frame: number) => ReactNode> = [
  (frame) => <SkillOrderVisual frame={frame} />,
  () => <ArtifactReadinessVisual />,
  (frame) => <AlignmentVisual frame={frame} />,
  () => <LifecycleVisual />,
  () => <ScopeVisual />,
];

export const SddApprovalGate = (props: ShowcaseSceneProps) => {
  const theme = useShowcaseTheme();
  const isOracle = useOracleBrand();
  const visualAccent = [
    theme.colors.accent,
    theme.colors.gold,
    theme.colors.violet,
    theme.colors.teal,
    theme.colors.red,
  ];
  const { frame } = useSceneBeats(props);
  const seconds = frame / props.fps;
  const performanceSegments =
    (
      props.scene.narration as unknown as {
        performanceSegments?: PerformanceBeat[];
      }
    )?.performanceSegments ?? [];
  const questionBeats = performanceSegments.filter((segment) =>
    segment.displayText.includes("?"),
  );
  const questionLabels =
    questionBeats.length > 0
      ? questionBeats.map((segment) => segment.displayText)
      : fallbackQuestionLabels;
  const firstQuestionStart = questionBeats[0]?.startSeconds ?? 4;
  const introOpacity = interpolate(
    seconds,
    [0, 0.4, Math.max(0.6, firstQuestionStart - 0.35), firstQuestionStart],
    [0, 1, 1, 0],
    clamp,
  );

  return (
    <ShowcaseFrame eyebrow={sceneContent.eyebrow} title={props.scene.title}>
      <div
        style={{
          position: "absolute",
          left: 94,
          right: 94,
          top: 312,
          bottom: 70,
          borderRadius: 38,
          background: theme.gradients.dark,
          color: theme.colors.white,
          boxShadow: "0 34px 120px rgba(21,27,43,0.26)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: isOracle
              ? "radial-gradient(circle at 78% 28%, rgba(222,176,104,0.18), transparent 38%), radial-gradient(circle at 22% 78%, rgba(92,146,109,0.18), transparent 40%)"
              : "radial-gradient(circle at 78% 28%, rgba(47,128,237,0.24), transparent 38%), radial-gradient(circle at 22% 78%, rgba(111,76,214,0.2), transparent 40%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 40,
            right: 40,
            top: 34,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <EngineeringIcon name="jira" stroke={isOracle ? theme.colors.violet : "#8FD8FF"} size={46} />
            <div>
              <div style={{ ...theme.typography.label, color: isOracle ? theme.colors.violet : "#8FD8FF" }}>
                {content.feature.key}
              </div>
              <div
                style={{
                  ...theme.typography.small,
                  color: isOracle ? "#D9DDDA" : "#B7C7DD",
                  marginTop: 3,
                }}
              >
                {content.feature.status}
              </div>
            </div>
          </div>
          <div
            style={{
              ...theme.typography.label,
              color: isOracle ? "#D9DDDA" : "#B7C7DD",
              textTransform: "uppercase",
            }}
          >
            {sceneContent.headerLabel}
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: 70,
            right: 70,
            top: 146,
            bottom: 100,
            opacity: introOpacity,
            display: "grid",
            placeItems: "center",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                ...theme.typography.hero,
                fontSize: 76,
                color: theme.colors.white,
              }}
            >
              {sceneContent.introHeadline.map((line) => <div key={line}>{line}</div>)}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 18,
                marginTop: 34,
              }}
            >
              {questionTopics.map(
                (label, index) => (
                  <div
                    key={label}
                    style={{
                      padding: "14px 20px",
                      borderRadius: theme.radius.pill,
                      background: "rgba(255,255,255,0.12)",
                      border: `1px solid ${visualAccent[index]}`,
                      color: theme.colors.white,
                      ...theme.typography.label,
                    }}
                  >
                    {label} ?
                  </div>
                ),
              )}
            </div>
          </div>
        </div>

        {questionLabels.map((label, index) => {
          const beat = questionBeats[index];
          if (!beat) {
            return null;
          }
          const opacity = questionOpacity(
            seconds,
            beat,
            index === questionLabels.length - 1,
            props.scene.durationSeconds,
          );
          if (opacity <= 0.001) {
            return null;
          }
          const enter = interpolate(opacity, [0, 1], [34, 0], clamp);
          return (
            <div
              key={label}
              style={{
                position: "absolute",
                left: 62,
                right: 62,
                top: 126,
                bottom: 92,
                display: "grid",
                gridTemplateColumns: "0.88fr 1.12fr",
                gap: 34,
                alignItems: "center",
                opacity,
                transform: `translateY(${enter}px)`,
              }}
            >
              <div style={{ paddingRight: 18 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    marginBottom: 24,
                  }}
                >
                  <div
                    style={{
                      width: 54,
                      height: 54,
                      borderRadius: 999,
                      background: visualAccent[index],
                      color: theme.colors.white,
                      display: "grid",
                      placeItems: "center",
                      ...theme.typography.h2,
                      fontSize: 26,
                    }}
                  >
                    {index + 1}
                  </div>
                  <div
                    style={{
                      ...theme.typography.label,
                      color: visualAccent[index],
                      textTransform: "uppercase",
                    }}
                  >
                    {questionTopics[index]}
                  </div>
                </div>
                <div
                  style={{
                    ...theme.typography.hero,
                    fontSize: index === 4 ? 58 : 66,
                    lineHeight: 1.03,
                    color: theme.colors.white,
                  }}
                >
                  {label}
                </div>
              </div>
              <div
                style={{
                  height: 430,
                  borderRadius: 30,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  display: "grid",
                  placeItems: "center",
                  overflow: "hidden",
                }}
              >
                {(
                  questionVisuals[index] ??
                  questionVisuals[questionVisuals.length - 1]
                )(frame)}
              </div>
            </div>
          );
        })}

        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 32,
            display: "flex",
            justifyContent: "center",
            gap: 12,
          }}
        >
          {questionLabels.map((_, index) => {
            const beat = questionBeats[index];
            const active =
              beat &&
              seconds >= beat.startSeconds &&
              seconds <=
                (index === questionLabels.length - 1
                  ? props.scene.durationSeconds
                  : beat.endSeconds);
            return (
              <div
                key={index}
                style={{
                  width: active ? 54 : 12,
                  height: 12,
                  borderRadius: 99,
                  background: active
                    ? visualAccent[index]
                    : "rgba(255,255,255,0.24)",
                  transition: "none",
                }}
              />
            );
          })}
        </div>
      </div>
    </ShowcaseFrame>
  );
};
