import type { ParticleSystem } from '../particles/ParticleSystem.ts';

// Spectral-class star colors (O through M), saturated for visual impact.
// Real sRGB values from stellar spectra (Harre 2021 / Vendian) with
// saturation boosted ~2.5x in HSL to make hue differences pop.
// Velocity maps to temperature: fast = hot O/B (blue), slow = cool K/M (orange).
const COLOR_STOPS = [
  { speed: 0,  r: 1.000, g: 0.620, b: 0.000 },  // M — orange
  { speed: 5,  r: 1.000, g: 0.700, b: 0.318 },  // K — orange-yellow
  { speed: 10, r: 1.000, g: 0.922, b: 0.836 },  // G — warm white
  { speed: 15, r: 0.929, g: 0.922, b: 1.000 },  // F — near-white (cool)
  { speed: 25, r: 0.584, g: 0.686, b: 1.000 },  // A — blue-white
  { speed: 35, r: 0.337, g: 0.498, b: 1.000 },  // B — blue
  { speed: 45, r: 0.220, g: 0.388, b: 1.000 },  // O — deep blue
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
