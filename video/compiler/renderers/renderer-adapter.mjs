export class RendererAdapter {
  constructor(name) {
    this.name = name;
  }

  async render() {
    throw new Error(`${this.name} renderer has not implemented render()`);
  }
}
