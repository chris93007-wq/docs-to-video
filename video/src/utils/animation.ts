import {Easing, interpolate, spring} from "remotion";

const DEFAULT_FPS = 30;

export const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

export const sceneProgress = (frame: number, durationFrames: number) =>
  interpolate(frame, [0, durationFrames], [0, 1], clamp);

export const fadeIn = (frame: number, start = 0, duration = 24) =>
  interpolate(frame, [start, start + duration], [0, 1], clamp);

export const fadeOut = (frame: number, start: number, duration = 24) =>
  interpolate(frame, [start, start + duration], [1, 0], clamp);

export const rise = (frame: number, start = 0, distance = 24, duration = 28) =>
  interpolate(frame, [start, start + duration], [distance, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

export const drawStroke = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [1, 0], clamp);

export const softSpring = (frame: number, delay = 0) =>
  spring({
    frame: Math.max(0, frame - delay),
    fps: DEFAULT_FPS,
    config: {
      damping: 18,
      stiffness: 90,
      mass: 0.9,
    },
  });

export const scaleIn = (frame: number, delay = 0) =>
  interpolate(softSpring(frame, delay), [0, 1], [0.92, 1], clamp);

export const sequenceOpacity = (frame: number, index: number, gap = 12) =>
  fadeIn(frame, index * gap, 18);
