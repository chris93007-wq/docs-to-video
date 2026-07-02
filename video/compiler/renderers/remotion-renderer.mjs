import {execFileSync} from "node:child_process";
import path from "node:path";
import {artifactPath, writeJson} from "../artifacts.mjs";
import {projectRoot} from "../utils.mjs";
import {RendererAdapter} from "./renderer-adapter.mjs";
import {buildRenderManifest} from "./render-manifest.mjs";

export const generatedManifestPath = path.join(
  projectRoot,
  "src",
  "compiler",
  "generated",
  "render-manifest.json",
);

export const writeRemotionGeneratedManifest = (manifest) => {
  writeJson(generatedManifestPath, manifest);
};

export const renderRemotionMp4 = () => {
  execFileSync("npm", ["run", "render:compiler"], {
    cwd: projectRoot,
    stdio: "inherit",
    env: {
      ...process.env,
      DOC_VIDEO_NARRATION: "compiler",
    },
  });
};

export class RemotionRenderer extends RendererAdapter {
  constructor() {
    super("remotion");
  }

  async render(inputs, {artifactDir, renderMp4 = false, writeGenerated = true} = {}) {
    const manifest = buildRenderManifest({
      renderer: this.name,
      ...inputs,
    });

    if (artifactDir) {
      writeJson(artifactPath(artifactDir, "render"), manifest);
    }

    if (writeGenerated) {
      writeRemotionGeneratedManifest(manifest);
    }

    if (renderMp4) {
      renderRemotionMp4();
    }

    return manifest;
  }
}
