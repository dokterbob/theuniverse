export class Overlay {
  private el: HTMLElement;
  private frames = 0;
  private lastTime = performance.now();
  private fps = 0;
  private particleCount: number;
  private fadeTimer: ReturnType<typeof setTimeout> | null = null;
  private onResize: ((newCount: number) => void) | null = null;

  constructor(particleCount: number, onResize?: (newCount: number) => void) {
    this.particleCount = particleCount;
    this.onResize = onResize ?? null;
    this.el = document.getElementById('overlay')!;
    this.el.style.transition = 'opacity 0.5s';

    this.resetFadeTimer();

    window.addEventListener('keydown', (e) => {
      // Show overlay on any key press
      this.el.style.opacity = '1';
      this.resetFadeTimer();

      if (e.key === 'f' || e.key === 'F') {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
        } else {
          document.exitFullscreen();
        }
      }

      if (e.key === 'ArrowUp' && this.onResize) {
        this.onResize(this.particleCount + 1000);
      }
      if (e.key === 'ArrowDown' && this.onResize) {
        this.onResize(Math.max(1000, this.particleCount - 1000));
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

  private resetFadeTimer() {
    if (this.fadeTimer !== null) clearTimeout(this.fadeTimer);
    this.fadeTimer = setTimeout(() => {
      this.el.style.opacity = '0';
    }, 3000);
  }

  setParticleCount(count: number) {
    this.particleCount = count;
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
