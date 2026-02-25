export class Overlay {
  private el: HTMLElement;
  private frames = 0;
  private lastTime = performance.now();
  private fps = 0;
  private particleCount: number;

  constructor(particleCount: number) {
    this.particleCount = particleCount;
    this.el = document.getElementById('overlay')!;

    // Fullscreen toggle
    window.addEventListener('keydown', (e) => {
      if (e.key === 'f' || e.key === 'F') {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
        } else {
          document.exitFullscreen();
        }
      }
    });

    // Fade out hint after 5 seconds
    const hint = document.getElementById('hint');
    if (hint) {
      setTimeout(() => {
        hint.style.opacity = '0';
        setTimeout(() => hint.remove(), 1000);
      }, 5000);
    }
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
