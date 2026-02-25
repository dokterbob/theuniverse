/**
 * Web Worker for O(N²) brute-force gravity computation.
 * Runs off the main thread so rendering stays smooth at 60fps.
 *
 * Uses transferable ArrayBuffers for zero-copy message passing.
 */

interface GravityRequest {
  positions: Float32Array;
  masses: Float32Array;
  count: number;
  G: number;
  eps2: number;
}

self.onmessage = (e: MessageEvent<GravityRequest>) => {
  const { positions, masses, count, G, eps2 } = e.data;

  const accelerations = new Float32Array(count * 3);

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

      const fj = f * masses[j];
      accelerations[i3] += fj * dx;
      accelerations[i3 + 1] += fj * dy;
      accelerations[i3 + 2] += fj * dz;

      const fi = f * mi;
      accelerations[j3] -= fi * dx;
      accelerations[j3 + 1] -= fi * dy;
      accelerations[j3 + 2] -= fi * dz;
    }
  }

  // Transfer all buffers back to main thread (zero-copy)
  self.postMessage(
    { accelerations, positions, masses },
    { transfer: [accelerations.buffer, positions.buffer, masses.buffer] },
  );
};
