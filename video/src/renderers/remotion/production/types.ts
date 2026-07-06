export type ProductionShot = {
  shotId: string;
  sceneId: string;
  title: string;
  purpose: string;
  teachingPoint: string;
  shotRole: string;
  durationSeconds: number;
  visualIntent: string;
  framing: string;
  camera: string;
  onScreenText: string[];
  visual: {
    visualPrimitive?: string;
    metaphor?: string;
    visualType?: string;
    layout?: string;
    camera?: string;
    emphasis?: string[];
    avoid?: string[];
  };
  media?: {
    mediaType: string;
    rationale?: string;
  };
  animation?: {
    primaryMotion?: string;
    secondaryMotion?: string[];
    cameraMove?: string;
    staticHoldSeconds?: number;
    animatedElements?: string[];
  };
  decision?: {
    transition: string;
    pacingRole: string;
    captionBehavior: string;
    soundCue: string;
  };
};

export type ProductionShotProps = {
  shot: ProductionShot;
};
