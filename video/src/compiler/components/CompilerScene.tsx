import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";
import {theme} from "../../styles/theme";
import {clamp, fadeIn, fadeOut, rise} from "../../utils/animation";
import {
  CameraRail,
  SceneTransition,
  renderVisualPrimitive,
  type VisualLanguageScene,
} from "../../renderers/remotion/visual-language";
import {TechnicalGrid} from "../../renderers/remotion/visual-language/shared";

type RenderScene = typeof import("../generated/render-manifest.json")["scenes"][number];

const sceneOpacity = (frame: number, durationFrames: number) =>
  Math.min(fadeIn(frame, 0, 18), fadeOut(frame, durationFrames - 24, 24));

const shortSubtitle = (scene: RenderScene) => {
  const text = scene.teachingPoint.replace(/\[[^\]]+\]\([^)]+\)/g, "");
  return text.length > 142 ? `${text.slice(0, 139)}...` : text;
};

export const CompilerScene = ({scene, fps}: {scene: RenderScene; fps: number}) => {
  const frame = useCurrentFrame();
  const durationFrames = scene.durationSeconds * fps;
  const progress = interpolate(frame, [0, durationFrames * 0.78], [0, 1], clamp);
  const typedScene = scene as VisualLanguageScene;
  const subtitleWidth = scene.id === "hook" ? 560 : 760;

  return (
    <AbsoluteFill
      style={{
        background: theme.gradients.page,
        color: theme.colors.ink,
        fontFamily: theme.typography.family,
        overflow: "hidden",
      }}
    >
      <TechnicalGrid />
      <div style={{position: "absolute", inset: 0, opacity: sceneOpacity(frame, durationFrames)}}>
        <CameraRail scene={typedScene} frame={frame} fps={fps}>
          <div
            style={{
              position: "absolute",
              top: 76,
              left: 96,
              width: 820,
              zIndex: 4,
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
                transform: `translateY(${rise(frame, 0, 18, 24)}px)`,
                maxWidth: 830,
              }}
            >
              {scene.title}
            </div>
            <div
              style={{
                ...theme.typography.body,
                color: theme.colors.muted,
                width: subtitleWidth,
                marginTop: 22,
              }}
            >
              {shortSubtitle(scene)}
            </div>
          </div>

          {renderVisualPrimitive({
            scene: typedScene,
            frame,
            fps,
            progress,
          })}
        </CameraRail>
      </div>
      <SceneTransition frame={frame} durationFrames={durationFrames} />
    </AbsoluteFill>
  );
};
