import { createScene } from './scene.ts';
import { createControls } from './controls.ts';
import { ParticleSystem } from './particles/ParticleSystem.ts';
import { spawnBigBang, spawnRange } from './particles/spawner.ts';
import { Integrator } from './physics/integrator.ts';
import { updateColors } from './rendering/colors.ts';
import { Overlay } from './ui/overlay.ts';
import { PARTICLE_COUNT } from './config.ts';

const { scene, camera, composer, renderer } = createScene();
const controls = createControls(camera, renderer);

const ps = new ParticleSystem(PARTICLE_COUNT);
spawnBigBang(ps);
updateColors(ps);
ps.syncToGPU();
scene.add(ps.points);

const integrator = new Integrator();

const overlay = new Overlay(PARTICLE_COUNT, (newCount: number) => {
  const oldCount = ps.count;
  ps.resize(newCount);
  if (newCount > oldCount) {
    spawnRange(ps, oldCount, newCount);
  }
  updateColors(ps);
  ps.syncToGPU();
  overlay.setParticleCount(newCount);
});

let lastTime = performance.now();

function animate() {
  requestAnimationFrame(animate);

  const now = performance.now();
  const frameDt = Math.min((now - lastTime) / 1000, 0.1);
  lastTime = now;

  integrator.step(ps, frameDt);
  updateColors(ps);
  ps.syncToGPU();

  // Slow drift toward the origin
  camera.position.multiplyScalar(1 - 0.002 * frameDt);

  controls.update();
  composer.render();
  overlay.update();
}

animate();
