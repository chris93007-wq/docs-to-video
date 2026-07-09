export type TddMediaValue =
  | string
  | {
      staticFile?: string;
      path?: string;
      source?: string;
      crop?: string;
      sourceFile?: string;
      timecode?: string;
    };

export type TddJestManifest = {
  fps: number;
  width: number;
  height: number;
  totalDurationSeconds: number;
  narrationAudio: {
    segments: Array<{
      sceneId: string;
      startSeconds: number;
      audioDurationSeconds: number;
      staticFile: string;
    }>;
  };
  endSlate: {
    durationSeconds: number;
    staticFile: string;
  };
  media?: Partial<{
    redPrompt: TddMediaValue;
    greenDiff: TddMediaValue;
    refactorEvidence: TddMediaValue;
    dashboardOverview: TddMediaValue;
    dashboardFindings: TddMediaValue;
    dashboardFeatures: TddMediaValue;
  }>;
};

export type TddSceneProps = {
  fps: number;
  durationInFrames: number;
  manifest: TddJestManifest;
};

export const mediaSource = (value: TddMediaValue | undefined) => {
  if (typeof value === "string") {
    return value;
  }
  return value?.staticFile ?? value?.path ?? value?.source;
};
