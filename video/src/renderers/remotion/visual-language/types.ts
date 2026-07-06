import type {ReactNode} from "react";
import type {VisualPrimitiveName} from "../../../compiler/experience/goldenExperienceProfile";

export type VisualLanguageScene = {
  id: string;
  title: string;
  purpose: string;
  teachingPoint: string;
  durationSeconds: number;
  visual: {
    metaphor: string;
    visualPrimitive?: VisualPrimitiveName;
    visualType: string;
    layout: string;
    motionStyle?: string;
    density?: "medium" | "high";
    textDensity?: "low" | "medium";
    camera?: string;
    emphasis: string[];
    avoid: string[];
  };
  animation?: {
    camera?: string;
    transition?: string;
    transitionIn?: string;
    transitionOut?: string;
    primaryAnimatedObject?: string;
    secondaryAnimatedObjects?: string[];
    progressiveReveal?: Array<{
      label: string;
      startSeconds: number;
      durationSeconds: number;
    }>;
    focus?: string[];
    staticHoldSeconds?: number;
    requiresPathAnimation?: boolean;
    elements?: Array<{
      asset: string;
      animation: string;
      startSeconds: number;
      durationSeconds: number;
    }>;
  };
};

export type VisualPrimitiveProps = {
  scene: VisualLanguageScene;
  frame: number;
  fps: number;
  progress: number;
};

export type CameraRailProps = {
  scene: VisualLanguageScene;
  frame: number;
  fps: number;
  children: ReactNode;
};
