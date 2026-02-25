import * as THREE from 'three';
import { PARTICLE_COUNT, PARTICLE_SIZE } from '../config.ts';

const vertexShader = /* glsl */ `
  attribute float size;
  attribute vec3 customColor;
  varying vec3 vColor;

  void main() {
    vColor = customColor;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = /* glsl */ `
  varying vec3 vColor;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    float alpha = 1.0 - smoothstep(0.0, 0.5, d);
    alpha *= alpha; // sharper falloff
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(vColor * 1.5, alpha);
  }
`;

export class ParticleSystem {
  count: number;
  positions: Float32Array;
  velocities: Float32Array;
  accelerations: Float32Array;
  masses: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;

  geometry: THREE.BufferGeometry;
  material: THREE.ShaderMaterial;
  points: THREE.Points;

  constructor(count: number = PARTICLE_COUNT) {
    this.count = count;
    this.positions = new Float32Array(count * 3);
    this.velocities = new Float32Array(count * 3);
    this.accelerations = new Float32Array(count * 3);
    this.masses = new Float32Array(count);
    this.colors = new Float32Array(count * 3);
    this.sizes = new Float32Array(count);

    // Default sizes
    for (let i = 0; i < count; i++) {
      this.sizes[i] = PARTICLE_SIZE;
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('customColor', new THREE.BufferAttribute(this.colors, 3));
    this.geometry.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1));

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.points = new THREE.Points(this.geometry, this.material);
  }

  syncToGPU() {
    this.geometry.attributes.position.needsUpdate = true;
    (this.geometry.attributes.customColor as THREE.BufferAttribute).needsUpdate = true;
    (this.geometry.attributes.size as THREE.BufferAttribute).needsUpdate = true;
  }
}
