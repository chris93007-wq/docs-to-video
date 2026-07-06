export const testNarrationSynthesize = async (_text, {targetDurationSeconds, pauseSeconds = 0} = {}) => {
  const sampleRate = 24000;
  const durationSeconds = Math.max(0.1, Number(targetDurationSeconds ?? 1) - pauseSeconds);
  return {
    samples: new Float32Array(Math.round(durationSeconds * sampleRate)),
    sampleRate,
  };
};
