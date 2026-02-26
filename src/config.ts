export const PARTICLE_COUNT = 2000;
export const G = 50;
export const SOFTENING = 0.5;
export const DT = 0.016;
export const MAX_SUBSTEPS = 3;
export const TIME_SCALE = 0.005; // 200x slower — savor the bang

// Big bang spawn
export const SPAWN_RADIUS = 2.0;
export const SPAWN_VELOCITY = 15.0;

// Bloom
export const BLOOM_STRENGTH = 1.5;
export const BLOOM_RADIUS = 0.4;
export const BLOOM_THRESHOLD = 0.1;

// Particle rendering
export const PARTICLE_SIZE = 0.15;
export const MIN_MASS = 0.5;
export const MAX_MASS = 2.0;

// Blackbody color mapping
export const T_MIN = 1500;    // K — deep red/orange (M-class stars)
export const T_MAX = 30000;   // K — hot blue (O-class stars)
export const KE_REF = 900;    // reference KE mapping to T_MAX (0.5 * MAX_MASS * ~30²)
export const SATURATION_BOOST = 1.8; // push channels away from luminance (1.0 = no change)
