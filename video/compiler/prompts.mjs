import {readFileSync} from "node:fs";
import path from "node:path";
import {hashText, projectRoot} from "./utils.mjs";

const promptFiles = {
  semantic: "semantic.prompt.md",
  story: "story.prompt.md",
  visual: "visual.prompt.md",
  shots: "shots.prompt.md",
  media: "media-mix.prompt.md",
  "media-mix": "media-mix.prompt.md",
  assets: "asset.prompt.md",
  narration: "narration.prompt.md",
  animation: "animation.prompt.md",
  edl: "edit.prompt.md",
  edit: "edit.prompt.md",
};

export const promptPathForStage = (stageName) => {
  const fileName = promptFiles[stageName];
  if (!fileName) {
    throw new Error(`No prompt registered for stage: ${stageName}`);
  }
  return path.join(projectRoot, "prompts", fileName);
};

export const loadPrompt = (stageName) => {
  const filePath = promptPathForStage(stageName);
  const content = readFileSync(filePath, "utf8");
  const explicitVersion = content.match(/^Prompt-Version:\s*(.+)$/m)?.[1]?.trim();

  return {
    stageName,
    filePath,
    content,
    version: explicitVersion ? `${explicitVersion}:${hashText(content).slice(0, 12)}` : hashText(content),
  };
};
