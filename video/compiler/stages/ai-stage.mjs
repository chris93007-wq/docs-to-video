import {loadPrompt} from "../prompts.mjs";
import {assertValidArtifact, artifactSchemas} from "../schemas.mjs";

export const runAiOrFallback = async ({
  stageName,
  artifactName = stageName,
  input,
  aiClient,
  fallback,
}) => {
  const prompt = loadPrompt(stageName);

  if (aiClient?.enabled) {
    try {
      const output = await aiClient.generateJson({
        stageName,
        prompt: prompt.content,
        schema: artifactSchemas[artifactName],
        input,
      });
      return assertValidArtifact(artifactName, output);
    } catch (error) {
      if (process.env.DOC_VIDEO_REQUIRE_AI === "1") {
        throw error;
      }
      process.stderr.write(
        `AI ${stageName} stage failed; using deterministic fallback. ${error.message}\n`,
      );
    }
  }

  return assertValidArtifact(artifactName, await fallback());
};
