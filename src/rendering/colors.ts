import type { ParticleSystem } from '../particles/ParticleSystem.ts';
import { T_MIN, T_MAX, KE_REF } from '../config.ts';

/**
 * Attempt at blackbody temperature → sRGB via Tanner Helland's analytic fit
 * to the Planck locus (valid ~1000–40000 K).
 */
function blackbodyRGB(kelvin: number): [number, number, number] {
  const temp = kelvin / 100;
  let r: number, g: number, b: number;

  // Red
  if (temp <= 66) {
    r = 255;
  } else {
    r = 329.698727446 * Math.pow(temp - 60, -0.1332047592);
  }

  // Green
  if (temp <= 66) {
    g = 99.4708025861 * Math.log(temp) - 161.1195681661;
  } else {
    g = 288.1221695283 * Math.pow(temp - 60, -0.0755148492);
  }

  // Blue
  if (temp >= 66) {
    b = 255;
  } else if (temp <= 19) {
    b = 0;
  } else {
    b = 138.5177312231 * Math.log(temp - 10) - 305.0447927307;
  }

  return [
    Math.min(Math.max(r, 0), 255) / 255,
    Math.min(Math.max(g, 0), 255) / 255,
    Math.min(Math.max(b, 0), 255) / 255,
  ];
}

export function updateColors(ps: ParticleSystem) {
  const { count, velocities, masses, colors } = ps;
  const tRange = T_MAX - T_MIN;

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const vx = velocities[i3];
    const vy = velocities[i3 + 1];
    const vz = velocities[i3 + 2];
    const speedSq = vx * vx + vy * vy + vz * vz;

    const ke = 0.5 * masses[i] * speedSq;
    const t = Math.min(ke / KE_REF, 1);
    const kelvin = T_MIN + tRange * t;

    const [r, g, b] = blackbodyRGB(kelvin);
    colors[i3] = r;
    colors[i3 + 1] = g;
    colors[i3 + 2] = b;
  }
}
