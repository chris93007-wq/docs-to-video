import {performance} from "node:perf_hooks";

const labelFor = {
  parse: "Parsed document",
  semantic: "Built semantic model",
  story: "Generated story",
  visual: "Planned visuals",
  assets: "Planned assets",
  narration: "Generated narration",
  animation: "Planned animation",
  render: "Render manifest complete",
};

export class CompilerLogger {
  constructor({silent = false} = {}) {
    this.silent = silent;
  }

  async stage(stageName, fn) {
    const start = performance.now();
    const result = await fn();
    const elapsed = Math.round(performance.now() - start);
    if (!this.silent) {
      const cached = result?.cached ? " cached" : "";
      process.stdout.write(`✓ ${labelFor[stageName] ?? stageName}${cached} (${elapsed}ms)\n`);
    }
    return result;
  }

  info(message) {
    if (!this.silent) {
      process.stdout.write(`${message}\n`);
    }
  }
}
