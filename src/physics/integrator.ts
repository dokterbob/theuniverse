import type { ParticleSystem } from '../particles/ParticleSystem.ts';
import { computeGravity } from './gravity.ts';
import { DT, G, MAX_SUBSTEPS, SOFTENING, TIME_SCALE } from '../config.ts';

const SIM_DT = DT * TIME_SCALE;
const eps2 = SOFTENING * SOFTENING;

/**
 * Velocity-Verlet integration with fixed timestep and accumulator.
 *
 * The O(N²) gravity computation runs in a Web Worker. We accept 1-frame
 * latency on accelerations: this frame's Verlet step uses last frame's
 * gravity, while the worker computes the next set in parallel.
 *
 * Double-buffer flow per frame:
 *   1. If worker returned new accelerations → swap into currentAccelerations
 *   2. Run Verlet half-kicks + drift using currentAccelerations
 *   3. Send current positions+masses to worker → starts next gravity compute
 */
export class Integrator {
  private accumulator = 0;
  private initialized = false;

  private worker: Worker;
  private currentAccelerations: Float32Array | null = null;
  private workerBusy = false;

  // Reusable buffers for sending to the worker (returned via transfer)
  private sendPositions: Float32Array | null = null;
  private sendMasses: Float32Array | null = null;

  constructor() {
    this.worker = new Worker(
      new URL('./gravity.worker.ts', import.meta.url),
      { type: 'module' },
    );

    this.worker.onmessage = (e: MessageEvent) => {
      const { accelerations, positions, masses } = e.data;
      this.currentAccelerations = accelerations as Float32Array;
      // Reclaim transferred buffers for reuse next frame
      this.sendPositions = positions as Float32Array;
      this.sendMasses = masses as Float32Array;
      this.workerBusy = false;
    };
  }

  step(ps: ParticleSystem, frameDt: number) {
    this.accumulator += Math.min(frameDt, DT * MAX_SUBSTEPS);

    // First frame: compute gravity synchronously so we have valid accelerations
    if (!this.initialized) {
      computeGravity(ps);
      this.currentAccelerations = new Float32Array(ps.accelerations);
      this.initialized = true;
    }

    // Swap in latest accelerations from the worker (skip if size changed mid-flight)
    if (this.currentAccelerations && this.currentAccelerations.length === ps.accelerations.length) {
      ps.accelerations.set(this.currentAccelerations);
    }

    while (this.accumulator >= DT) {
      this.verletStep(ps, SIM_DT);
      this.accumulator -= DT;
    }

    // Dispatch next gravity computation to the worker
    this.dispatchWorker(ps);
  }

  private verletStep(ps: ParticleSystem, dt: number) {
    const { count, positions, velocities, accelerations } = ps;
    const halfDt = 0.5 * dt;

    // Half-kick + drift
    for (let i = 0; i < count * 3; i++) {
      velocities[i] += accelerations[i] * halfDt;
      positions[i] += velocities[i] * dt;
    }

    // Second half-kick uses the same accelerations (worker computes new ones async)
    for (let i = 0; i < count * 3; i++) {
      velocities[i] += accelerations[i] * halfDt;
    }
  }

  private dispatchWorker(ps: ParticleSystem) {
    if (this.workerBusy) return;

    const { count, positions, masses } = ps;

    // Allocate or reuse send buffers
    let posBuf = this.sendPositions;
    if (!posBuf || posBuf.length !== positions.length) {
      posBuf = new Float32Array(positions.length);
    }
    posBuf.set(positions);

    let massBuf = this.sendMasses;
    if (!massBuf || massBuf.length !== masses.length) {
      massBuf = new Float32Array(masses.length);
    }
    massBuf.set(masses);

    // Mark buffers as in-flight (they'll be transferred and become detached)
    this.sendPositions = null;
    this.sendMasses = null;
    this.workerBusy = true;

    this.worker.postMessage(
      { positions: posBuf, masses: massBuf, count, G, eps2 },
      { transfer: [posBuf.buffer, massBuf.buffer] },
    );
  }
}
