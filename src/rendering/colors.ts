import type { ParticleSystem } from '../particles/ParticleSystem.ts';

// Precomputed color stops for velocity-based coloring
// Slow (low KE) = warm red/orange, Fast = blue-white
const COLOR_STOPS = [
  { speed: 0, r: 1.0, g: 0.3, b: 0.1 },   // deep red-orange
  { speed: 5, r: 1.0, g: 0.6, b: 0.2 },   // orange
  { speed: 10, r: 1.0, g: 0.9, b: 0.5 },   // yellow-white
  { speed: 20, r: 0.6, g: 0.8, b: 1.0 },   // blue-white
  { speed: 40, r: 0.4, g: 0.6, b: 1.0 },   // blue
];

function lerpColor(speed: number): [number, number, number] {
  // Clamp to range
  if (speed <= COLOR_STOPS[0].speed) {
    const s = COLOR_STOPS[0];
    return [s.r, s.g, s.b];
  }
  for (let i = 1; i < COLOR_STOPS.length; i++) {
    if (speed <= COLOR_STOPS[i].speed) {
      const a = COLOR_STOPS[i - 1];
      const b = COLOR_STOPS[i];
      const t = (speed - a.speed) / (b.speed - a.speed);
      return [
        a.r + (b.r - a.r) * t,
        a.g + (b.g - a.g) * t,
        a.b + (b.b - a.b) * t,
      ];
    }
  }
  const last = COLOR_STOPS[COLOR_STOPS.length - 1];
  return [last.r, last.g, last.b];
}

export function updateColors(ps: ParticleSystem) {
  const { count, velocities, colors } = ps;

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const vx = velocities[i3];
    const vy = velocities[i3 + 1];
    const vz = velocities[i3 + 2];
    const speed = Math.sqrt(vx * vx + vy * vy + vz * vz);

    const [r, g, b] = lerpColor(speed);
    colors[i3] = r;
    colors[i3 + 1] = g;
    colors[i3 + 2] = b;
  }
}
