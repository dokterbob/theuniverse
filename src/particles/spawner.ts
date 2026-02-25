import type { ParticleSystem } from './ParticleSystem.ts';
import { SPAWN_RADIUS, SPAWN_VELOCITY, MIN_MASS, MAX_MASS } from '../config.ts';

/** Box-Muller transform for gaussian random numbers */
function gaussianRandom(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

export function spawnBigBang(ps: ParticleSystem) {
  const { count, positions, velocities, masses, sizes } = ps;

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    // Gaussian cluster near origin
    const x = gaussianRandom() * SPAWN_RADIUS;
    const y = gaussianRandom() * SPAWN_RADIUS;
    const z = gaussianRandom() * SPAWN_RADIUS;
    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;

    // Radial outward velocity
    const dist = Math.sqrt(x * x + y * y + z * z) || 0.001;
    const speed = SPAWN_VELOCITY * (0.5 + Math.random() * 0.5);
    velocities[i3] = (x / dist) * speed;
    velocities[i3 + 1] = (y / dist) * speed;
    velocities[i3 + 2] = (z / dist) * speed;

    // Random mass
    masses[i] = MIN_MASS + Math.random() * (MAX_MASS - MIN_MASS);
    sizes[i] = 0.1 + masses[i] * 0.08;
  }
}
