import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";
import {theme} from "../../styles/theme";
import {clamp, fadeIn, rise} from "../../utils/animation";

type RenderScene = typeof import("../generated/render-manifest.json")["scenes"][number];

const colors = [
  theme.colors.accent,
  theme.colors.teal,
  theme.colors.violet,
  theme.colors.gold,
  theme.colors.red,
];

const nodesForScene = (scene: RenderScene) => {
  const emphasis = scene.visual.emphasis.length > 0 ? scene.visual.emphasis : [scene.teachingPoint];
  return emphasis.slice(0, 5).map((item, index) => ({
    label: item.length > 36 ? `${item.slice(0, 34)}...` : item,
    color: colors[index % colors.length],
  }));
};

const PipelineVisual = ({scene, progress}: {scene: RenderScene; progress: number}) => {
  const nodes = nodesForScene(scene);
  const railWidth = 1050;

  return (
    <div style={{position: "absolute", left: 720, top: 380, width: railWidth, height: 250}}>
      <div
        style={{
          position: "absolute",
          top: 92,
          left: 0,
          width: `${interpolate(progress, [0, 1], [0, railWidth], clamp)}px`,
          height: 8,
          borderRadius: 8,
          background: theme.gradients.accent,
        }}
      />
      {nodes.map((node, index) => {
        const reveal = interpolate(progress, [index / nodes.length, (index + 1) / nodes.length], [0, 1], clamp);
        return (
          <div
            key={node.label}
            style={{
              position: "absolute",
              left: `${index * (railWidth / Math.max(1, nodes.length - 1)) - 72}px`,
              top: 32,
              width: 144,
              height: 144,
              borderRadius: 8,
              background: theme.colors.surface,
              border: `3px solid ${node.color}`,
              opacity: reveal,
              transform: `scale(${interpolate(reveal, [0, 1], [0.86, 1], clamp)})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: 14,
              color: theme.colors.ink,
              ...theme.typography.small,
              fontWeight: 760,
              boxShadow: theme.shadow.soft,
            }}
          >
            {node.label}
          </div>
        );
      })}
    </div>
  );
};

const NetworkVisual = ({scene, progress}: {scene: RenderScene; progress: number}) => {
  const nodes = nodesForScene(scene);
  return (
    <div style={{position: "absolute", left: 760, top: 260, width: 920, height: 520}}>
      {nodes.map((node, index) => {
        const angle = (Math.PI * 2 * index) / Math.max(nodes.length, 1);
        const x = 420 + Math.cos(angle) * 300;
        const y = 230 + Math.sin(angle) * 170;
        const reveal = interpolate(progress, [index * 0.12, index * 0.12 + 0.3], [0, 1], clamp);
        return (
          <div
            key={node.label}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 180,
              minHeight: 92,
              borderRadius: 8,
              background: theme.colors.surface,
              border: `3px solid ${node.color}`,
              opacity: reveal,
              transform: `translate(-50%, -50%) scale(${interpolate(reveal, [0, 1], [0.9, 1], clamp)})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: 16,
              ...theme.typography.small,
              fontWeight: 760,
              boxShadow: theme.shadow.soft,
            }}
          >
            {node.label}
          </div>
        );
      })}
      <div
        style={{
          position: "absolute",
          left: 420,
          top: 230,
          width: 230,
          height: 230,
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
          background: theme.gradients.accent,
          color: theme.colors.white,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: 24,
          ...theme.typography.body,
          fontWeight: 800,
          opacity: progress,
        }}
      >
        {scene.visual.visualType}
      </div>
    </div>
  );
};

const visualKind = (scene: RenderScene) =>
  ["pipeline", "checkpoint-gate", "timeline", "lanes", "chain"].includes(scene.visual.visualType)
    ? "pipeline"
    : "network";

export const CompilerScene = ({scene, fps}: {scene: RenderScene; fps: number}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, scene.durationSeconds * fps * 0.78], [0, 1], clamp);

  return (
    <AbsoluteFill
      style={{
        background: theme.gradients.page,
        color: theme.colors.ink,
        fontFamily: theme.typography.family,
        overflow: "hidden",
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(175,192,214,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(175,192,214,0.18) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          opacity: 0.34,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 96,
          top: 86,
          width: 560,
          opacity: fadeIn(frame, 0, 18),
        }}
      >
        <div
          style={{
            ...theme.typography.label,
            color: theme.colors.accent,
            textTransform: "uppercase",
            marginBottom: 20,
          }}
        >
          {scene.purpose}
        </div>
        <div
          style={{
            ...theme.typography.h1,
            fontSize: 72,
            lineHeight: 0.96,
            transform: `translateY(${rise(frame, 0, 24, 28)}px)`,
          }}
        >
          {scene.title}
        </div>
        <div
          style={{
            ...theme.typography.body,
            color: theme.colors.muted,
            marginTop: 28,
            lineHeight: 1.35,
          }}
        >
          {scene.teachingPoint}
        </div>
        <div
          style={{
            marginTop: 34,
            paddingTop: 24,
            borderTop: `2px solid ${theme.colors.line}`,
            ...theme.typography.small,
            color: theme.colors.inkSoft,
            lineHeight: 1.45,
          }}
        >
          {scene.visual.metaphor}
        </div>
      </div>
      {visualKind(scene) === "pipeline" ? (
        <PipelineVisual scene={scene} progress={progress} />
      ) : (
        <NetworkVisual scene={scene} progress={progress} />
      )}
    </AbsoluteFill>
  );
};
