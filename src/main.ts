import { createScene } from './scene.ts';
import { createControls } from './controls.ts';
import { ParticleSystem } from './particles/ParticleSystem.ts';
import { spawnBigBang } from './particles/spawner.ts';
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
const overlay = new Overlay(PARTICLE_COUNT);

let lastTime = performance.now();

function animate() {
  requestAnimationFrame(animate);

  const now = performance.now();
  const frameDt = Math.min((now - lastTime) / 1000, 0.1);
  lastTime = now;

  integrator.step(ps, frameDt);
  updateColors(ps);
  ps.syncToGPU();

  controls.update();
  composer.render();
  overlay.update();
}

animate();
