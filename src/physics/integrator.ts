import type { ParticleSystem } from '../particles/ParticleSystem.ts';
import { computeGravity } from './gravity.ts';
import { DT, MAX_SUBSTEPS, TIME_SCALE } from '../config.ts';

const SIM_DT = DT * TIME_SCALE;

/**
 * Velocity-Verlet integration with fixed timestep and accumulator.
 * Symplectic — conserves energy, produces stable clusters.
 * TIME_SCALE shrinks simulation dt so the bang unfolds in slow motion,
 * while the accumulator still runs at wall-clock rate (~1 substep/frame).
 */
export class Integrator {
  private accumulator = 0;
  private initialized = false;

  step(ps: ParticleSystem, frameDt: number) {
    this.accumulator += Math.min(frameDt, DT * MAX_SUBSTEPS);

    // First frame: compute initial accelerations
    if (!this.initialized) {
      computeGravity(ps);
      this.initialized = true;
    }

    while (this.accumulator >= DT) {
      this.verletStep(ps, SIM_DT);
      this.accumulator -= DT;
    }
  }

  private verletStep(ps: ParticleSystem, dt: number) {
    const { count, positions, velocities, accelerations } = ps;
    const halfDt = 0.5 * dt;

    // Half-kick: v += 0.5 * a * dt
    // Drift: x += v * dt
    for (let i = 0; i < count * 3; i++) {
      velocities[i] += accelerations[i] * halfDt;
      positions[i] += velocities[i] * dt;
    }

    // Recompute accelerations at new positions
    computeGravity(ps);

    // Half-kick again
    for (let i = 0; i < count * 3; i++) {
      velocities[i] += accelerations[i] * halfDt;
    }
  }
}
