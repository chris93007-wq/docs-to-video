import path from "node:path";
import {writeJson} from "../artifacts.mjs";
import {RendererAdapter} from "./renderer-adapter.mjs";
import {buildRenderManifest} from "./render-manifest.mjs";

export class MotionCanvasRenderer extends RendererAdapter {
  constructor() {
    super("motion-canvas");
  }

  async render(inputs, {artifactDir} = {}) {
    const manifest = buildRenderManifest({
      renderer: this.name,
      ...inputs,
    });

    if (artifactDir) {
      writeJson(path.join(artifactDir, "motion-canvas-render-manifest.json"), manifest);
    }

    return manifest;
  }
}
