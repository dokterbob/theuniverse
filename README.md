# The Universe

A browser-based astrophysical particle simulation where a universe emerges from nothing.

Particles burst into existence, gravity pulls them into clusters, and stars ignite — all rendered in real-time with bloom post-processing. Every reload is a unique universe born from different initial conditions.

## Running

```bash
pnpm install
pnpm dev
```

## Controls

- **Click + drag** — orbit the camera
- **Scroll** — zoom in/out
- **F** — fullscreen
- **ESC** — exit fullscreen

## How it works

2,000 particles spawn in a gaussian cluster near the origin with radial outward velocities — a big bang. Brute-force N-body gravity (O(N²) with softening) pulls them back together. Velocity-Verlet integration keeps the physics stable so clusters form and persist rather than exploding numerically.

Particles are colored by velocity: slow particles glow warm red-orange, fast ones shift to blue-white. A single `THREE.Points` draw call with custom shaders and additive blending feeds into an UnrealBloomPass for the cinematic glow. The camera drifts slowly toward the origin, pulling you deeper into the universe.

Time runs at 1/200th speed so you can watch the bang unfold.

## Tech

TypeScript, Three.js, Vite. Struct-of-Arrays typed array buffers for cache-friendly, zero-GC physics. No textures — the soft particle glow is pure `smoothstep` math in the fragment shader.

## Future

Star formation via density detection. Stellar death and supernovae. Particle trails. Sound. Shareable universe seeds.

---

*Built by a human and [Claude](https://claude.ai), staring into the void together.*
