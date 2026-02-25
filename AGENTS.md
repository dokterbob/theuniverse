# AGENTS.md — The Universe

## Project Overview

A real-time N-body gravitational particle simulation visualizing a "big bang" expanding into galaxy-like clusters. 2,000 particles interact via brute-force Newtonian gravity, rendered with Three.js and additive-blend bloom.

## Tech Stack

- **Language:** TypeScript (strict)
- **Bundler:** Vite 7 (ESM, `type: "module"`)
- **Rendering:** Three.js 0.183 — custom vertex/fragment shaders, UnrealBloomPass post-processing
- **Physics:** Velocity-Verlet integrator, O(N²) gravity in a Web Worker
- **Package manager:** pnpm

## Directory Structure

```
src/
├── main.ts                     Entry point — animate loop, scene setup
├── config.ts                   All tunables (particle count, G, bloom, etc.)
├── scene.ts                    Three.js renderer, camera, bloom composer
├── controls.ts                 OrbitControls setup
├── particles/
│   ├── ParticleSystem.ts       SOA data (positions, velocities, masses) + GPU geometry
│   └── spawner.ts              Big bang initial conditions
├── physics/
│   ├── gravity.ts              Brute-force gravity (used for first-frame sync compute)
│   ├── gravity.worker.ts       Web Worker — runs gravity off main thread
│   └── integrator.ts           Velocity-Verlet with fixed timestep + worker dispatch
├── rendering/
│   └── colors.ts               Velocity → stellar spectral color mapping
└── ui/
    └── overlay.ts              HUD overlay
```

## Architecture & Data Flow

### Particle Data — SOA Layout

`ParticleSystem` stores data as flat `Float32Array` typed arrays in Structure-of-Arrays layout:
- `positions: Float32Array(N*3)` — xyz interleaved
- `velocities: Float32Array(N*3)`
- `accelerations: Float32Array(N*3)`
- `masses: Float32Array(N)`
- `colors: Float32Array(N*3)`

These arrays are shared directly with Three.js `BufferAttribute`s — `syncToGPU()` flips `needsUpdate` flags.

### Frame Loop (`main.ts`)

```
requestAnimationFrame → animate()
  1. integrator.step(ps, frameDt)   — Verlet integration + worker dispatch
  2. updateColors(ps)               — velocity → color mapping
  3. ps.syncToGPU()                 — mark GPU buffers dirty
  4. composer.render()              — Three.js draw + bloom
```

### Worker-Based Gravity

The O(N²) gravity computation (~2M pair evaluations for 2k particles) runs in a dedicated Web Worker to keep the main thread free for rendering.

**Double-buffer approach:**
1. **Swap:** If the worker has returned new accelerations since last frame, copy them into `ps.accelerations`
2. **Integrate:** Run Verlet half-kicks + drift using current accelerations (O(N), trivial)
3. **Dispatch:** Send a snapshot of positions + masses to the worker via transferable ArrayBuffers (zero-copy)
4. The worker computes gravity and transfers results back; main thread picks them up next frame

**Trade-off:** 1-frame latency on accelerations — imperceptible at 60fps but keeps rendering completely jank-free.

**Message protocol:**
- Main → Worker: `{ positions, masses, count, G, eps2 }` (buffers transferred)
- Worker → Main: `{ accelerations, positions, masses }` (buffers transferred back for reuse)

### Verlet Integration

Velocity-Verlet with a fixed timestep accumulator:
- `DT = 0.016` wall-clock step, `TIME_SCALE = 0.005` slows simulation 200×
- `MAX_SUBSTEPS = 3` caps catch-up per frame
- Symplectic integration conserves energy → stable long-term orbits and cluster formation

## Key Conventions

- All physics arrays are `Float32Array` — sufficient precision, cache-friendly
- Transferable ArrayBuffers for zero-copy worker communication
- Config constants live in `config.ts` — change `PARTICLE_COUNT`, `G`, `SOFTENING` etc. there
- No external physics library — everything is hand-rolled for performance
- Rendering uses custom GLSL shaders (vertex + fragment) in `ParticleSystem.ts`

## Running

```bash
pnpm install
pnpm dev        # Vite dev server with HMR
pnpm build      # Type-check + production build
```

## Verification

1. `pnpm dev` — particles visible, expanding from origin
2. Orbit controls (mouse drag) stay smooth — no main-thread jank
3. Particles form clusters over time (gravity working correctly)
4. DevTools Performance tab: main thread should show significant idle time
5. Console: no worker loading errors
