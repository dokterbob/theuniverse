import type { ParticleSystem } from '../particles/ParticleSystem.ts';
import { G, SOFTENING } from '../config.ts';

const eps2 = SOFTENING * SOFTENING;

/**
 * Brute-force O(N^2) gravity with Newton's 3rd law optimization.
 * Each pair computed once, force applied symmetrically.
 */
export function computeGravity(ps: ParticleSystem) {
  const { count, positions, accelerations, masses } = ps;

  // Zero accelerations
  accelerations.fill(0);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const xi = positions[i3];
    const yi = positions[i3 + 1];
    const zi = positions[i3 + 2];
    const mi = masses[i];

    for (let j = i + 1; j < count; j++) {
      const j3 = j * 3;
      const dx = positions[j3] - xi;
      const dy = positions[j3 + 1] - yi;
      const dz = positions[j3 + 2] - zi;

      const distSq = dx * dx + dy * dy + dz * dz + eps2;
      const invDist = 1 / Math.sqrt(distSq);
      const invDist3 = invDist * invDist * invDist;
      const f = G * invDist3;

      // Force on i from j (scaled by mj)
      const fj = f * masses[j];
      accelerations[i3] += fj * dx;
      accelerations[i3 + 1] += fj * dy;
      accelerations[i3 + 2] += fj * dz;

      // Force on j from i (Newton's 3rd, scaled by mi)
      const fi = f * mi;
      accelerations[j3] -= fi * dx;
      accelerations[j3 + 1] -= fi * dy;
      accelerations[j3 + 2] -= fi * dz;
    }
  }
}
