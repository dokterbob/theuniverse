import type { ParticleSystem } from './ParticleSystem.ts';
import { SPAWN_RADIUS, SPAWN_VELOCITY, MIN_MASS, MAX_MASS } from '../config.ts';

/** Box-Muller transform for gaussian random numbers */
function gaussianRandom(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// Salpeter IMF: dN/dM ∝ M^(-2.35), inverse CDF constants
const ALPHA1 = -1.35; // α + 1 where α = -2.35
const M_LO_A = Math.pow(MIN_MASS, ALPHA1);
const M_HI_A = Math.pow(MAX_MASS, ALPHA1);

export function spawnRange(ps: ParticleSystem, from: number, to: number) {
  const { positions, velocities, masses, sizes } = ps;

  for (let i = from; i < to; i++) {
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

    // Salpeter IMF: dN/dM ∝ M^(-2.35), sampled via inverse CDF
    masses[i] = Math.pow(M_LO_A + Math.random() * (M_HI_A - M_LO_A), 1 / ALPHA1);
    sizes[i] = 0.1 + masses[i] * 0.08;
  }
}

export function spawnBigBang(ps: ParticleSystem) {
  spawnRange(ps, 0, ps.count);
}
