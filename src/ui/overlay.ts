export class Overlay {
  private el: HTMLElement;
  private frames = 0;
  private lastTime = performance.now();
  private fps = 0;
  private particleCount: number;

  constructor(particleCount: number) {
    this.particleCount = particleCount;
    this.el = document.getElementById('overlay')!;
  }

  update() {
    this.frames++;
    const now = performance.now();
    const elapsed = now - this.lastTime;

    if (elapsed >= 500) {
      this.fps = Math.round((this.frames * 1000) / elapsed);
      this.frames = 0;
      this.lastTime = now;
      this.el.textContent = `${this.particleCount} particles | ${this.fps} fps`;
    }
  }
}
