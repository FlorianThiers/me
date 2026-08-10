import React, { useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { ORBIT_TRAP_MODE, type OrbitTrapSettings } from '../../data/orbitTrapPresets';

const C_RADIUS = 0.7885;

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float time;
  uniform vec2 resolution;
  uniform vec2 cParam;
  uniform vec3 color1;
  uniform vec3 color2;
  uniform vec3 color3;
  uniform vec3 color4;
  uniform float zoom;
  uniform vec2 center;
  uniform int iterations;
  uniform float trapRotation;
  uniform int trapMode;
  uniform float trapPetals;
  uniform float trapParam;

  vec2 complexMul(vec2 a, vec2 b) {
    return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
  }

  vec3 palette(float t) {
    t = fract(t);
    if (t < 0.25) return mix(color1, color2, t * 4.0);
    if (t < 0.5) return mix(color2, color3, (t - 0.25) * 4.0);
    if (t < 0.75) return mix(color3, color4, (t - 0.5) * 4.0);
    return mix(color4, color1, (t - 0.75) * 4.0);
  }

  float flowerTrap(vec2 p, float petals) {
    float r = length(p);
    float a = atan(p.y, p.x);
    return abs(r - 0.42 * (0.55 + 0.45 * cos(petals * a)));
  }

  float spiralTrap(vec2 p, float tightness) {
    float r = length(p);
    float a = atan(p.y, p.x);
    return abs(a - r * tightness) * 0.35;
  }

  float gridTrap(vec2 p, float cell) {
    vec2 q = p / cell;
    vec2 f = abs(fract(q + 0.5) - 0.5) * cell;
    return min(f.x, f.y);
  }

  float ringTrap(vec2 p, float radius) {
    float r = length(p);
    return min(abs(r - radius), abs(r - radius * 1.65));
  }

  float filamentTrap(vec2 p, float freq) {
    float r = length(p);
    float a = atan(p.y, p.x);
    return abs(sin(a * freq + r * 14.0)) * 0.12 + abs(r - 0.38) * 0.55;
  }

  float neuralTrap(vec2 p, float nodes) {
    float trap = 1e6;
    float n = max(nodes, 3.0);
    for (int i = 0; i < 8; i++) {
      if (float(i) >= n) break;
      float ang = float(i) * 6.28318 / n;
      vec2 node = 0.36 * vec2(cos(ang), sin(ang));
      trap = min(trap, length(p - node));
    }
    trap = min(trap, length(p) * 0.85);
    return trap;
  }

  float sampleTrap(vec2 p) {
    if (trapMode == 1) return spiralTrap(p, trapParam);
    if (trapMode == 2) return gridTrap(p, trapParam);
    if (trapMode == 3) return ringTrap(p, trapParam);
    if (trapMode == 4) return filamentTrap(p, trapParam);
    if (trapMode == 5) return neuralTrap(p, trapParam);
    float t = flowerTrap(p, trapPetals);
    t = min(t, abs(length(p) - 0.35));
    t = min(t, min(abs(p.x), abs(p.y)) * trapParam);
    return t;
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / min(resolution.x, resolution.y);
    uv -= center;
    uv *= zoom;

    float c = cos(trapRotation);
    float s = sin(trapRotation);
    mat2 rot = mat2(c, -s, s, c);
    uv = rot * uv;

    vec2 z = uv;
    vec2 cJulia = cParam;
    float trap = 1e6;
    int steps = 0;

    for (int i = 0; i < 256; i++) {
      if (i >= iterations) break;
      if (dot(z, z) > 16.0) break;
      trap = min(trap, sampleTrap(z));
      z = complexMul(z, z) + cJulia;
      steps = i;
    }

    float t = trap * 3.2 + float(steps) * 0.018 + time * 0.04;
    vec3 color = palette(t);
    float vignette = 0.78 + 0.22 * (1.0 - clamp(length(uv) * 0.45, 0.0, 1.0));
    color *= vignette;
    color += 0.05 * sin(time * 0.5 + trap * 20.0) * vec3(0.5, 0.85, 0.7);
    color = pow(color, vec3(0.88)) * 0.72;
    gl_FragColor = vec4(color, 1.0);
  }
`;

type Props = OrbitTrapSettings;

export const OrbitTrapOrb: React.FC<Props> = ({
  variant,
  petals = 5,
  param = 1,
  zoom = 2.35,
  center = [0.06, 0],
  colorHue = 0.5,
  breathSec = 30,
  rotationSpeed = 0.025,
}) => {
  const { size } = useThree();
  const trapMode = ORBIT_TRAP_MODE[variant];
  const geometry = useMemo(() => new THREE.PlaneGeometry(6, 6), []);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          time: { value: 0 },
          resolution: { value: new THREE.Vector2(1, 1) },
          cParam: { value: new THREE.Vector2(C_RADIUS, 0) },
          color1: { value: new THREE.Color(0x00ff88) },
          color2: { value: new THREE.Color(0xff0088) },
          color3: { value: new THREE.Color(0x0088ff) },
          color4: { value: new THREE.Color(0x8800ff) },
          zoom: { value: zoom },
          center: { value: new THREE.Vector2(center[0], center[1]) },
          iterations: { value: 128 },
          trapRotation: { value: 0 },
          trapMode: { value: trapMode },
          trapPetals: { value: petals },
          trapParam: { value: param },
        },
        transparent: true,
        depthTest: false,
        depthWrite: false,
      }),
    [zoom, center[0], center[1], trapMode, petals, param]
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    material.uniforms.time.value = t;
    material.uniforms.resolution.value.set(size.width, size.height);
    material.uniforms.trapMode.value = trapMode;
    material.uniforms.trapPetals.value = petals;
    material.uniforms.trapParam.value = param;

    const phase = (t % (2 * breathSec)) / breathSec;
    const u = phase <= 1 ? phase : 2 - phase;
    const angle = u * Math.PI * 2 * 0.35;
    material.uniforms.cParam.value.set(
      C_RADIUS * Math.cos(angle),
      C_RADIUS * Math.sin(angle)
    );

    const breath = 1 + 0.08 * Math.sin(u * Math.PI);
    material.uniforms.zoom.value = zoom * breath;
    material.uniforms.trapRotation.value = t * rotationSpeed;

    const h = colorHue;
    material.uniforms.color1.value.setHSL((t * 0.06 + h) % 1, 0.85, 0.45);
    material.uniforms.color2.value.setHSL((t * 0.08 + h + 0.15) % 1, 0.9, 0.5);
    material.uniforms.color3.value.setHSL((t * 0.05 + h + 0.33) % 1, 0.8, 0.42);
    material.uniforms.color4.value.setHSL((t * 0.07 + h + 0.55) % 1, 0.75, 0.48);
  });

  return <mesh geometry={geometry} material={material} />;
};
