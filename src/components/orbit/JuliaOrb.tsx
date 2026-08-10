import React, { useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const GIF_DURATION = 60;
const C_ARC_START = (20 / GIF_DURATION) * Math.PI * 2;
const C_ARC_END = (40 / GIF_DURATION) * Math.PI * 2;
const C_RADIUS = 0.7885;
const ARC_PING_PONG_SEC = 28;

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
  uniform vec3 color3;
  uniform vec3 color2;
  uniform vec3 color4;
  uniform float zoom;
  uniform vec2 center;
  uniform int iterations;
  varying vec2 vUv;

  vec2 complexMul(vec2 a, vec2 b) {
    return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
  }

  vec3 heroPalette(float t) {
    t = fract(t);
    if (t < 0.25) return mix(color1, color2, t * 4.0);
    if (t < 0.5) return mix(color2, color3, (t - 0.25) * 4.0);
    if (t < 0.75) return mix(color3, color4, (t - 0.5) * 4.0);
    return mix(color4, color1, (t - 0.75) * 4.0);
  }

  vec3 heroInterior(vec2 uv, float dist) {
    float spatial = 0.03 * sin(dist * 5.0 + atan(uv.y, uv.x) * 1.5);
    float t = fract(time * 0.045 + spatial);
    vec3 color = heroPalette(t);
    color *= 0.82 + 0.18 * (1.0 - clamp(dist * 0.55, 0.0, 1.0));
    color += 0.04 * sin(time * 0.8) * vec3(0.8, 0.4, 0.6);
    return pow(color, vec3(0.88)) * 0.92;
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / min(resolution.x, resolution.y);
    uv -= center;
    uv *= zoom;

    vec2 z = uv;
    vec2 c = cParam;
    float soft = 0.0;
    bool escaped = false;

    for (int i = 0; i < 256; i++) {
      if (i >= iterations) break;
      if (dot(z, z) > 4.0) {
        escaped = true;
        break;
      }
      z = complexMul(z, z) + c;
    }

    if (escaped) discard;

    float dist = length(uv);
    vec3 color = heroInterior(uv, dist);
    float pulse = 0.94 + 0.06 * sin(time * 0.9);
    gl_FragColor = vec4(color * pulse, 1.0);
  }
`;

export type JuliaOrbVariant = 'classic' | 'inverted';

export const JuliaOrb: React.FC<{
  variant?: JuliaOrbVariant;
  zoom?: number;
  center?: [number, number];
}> = ({
  variant: _variant = 'classic',
  zoom = 2.9,
  center = [0.13, 0],
}) => {
  const { size } = useThree();
  const geometry = useMemo(() => new THREE.PlaneGeometry(6, 6), []);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          time: { value: 0 },
          resolution: { value: new THREE.Vector2(1, 1) },
          cParam: { value: new THREE.Vector2(0.7885, 0) },
          color1: { value: new THREE.Color(0x00ff88) },
          color2: { value: new THREE.Color(0xff0088) },
          color3: { value: new THREE.Color(0x0088ff) },
          color4: { value: new THREE.Color(0x8800ff) },
          zoom: { value: zoom },
          center: { value: new THREE.Vector2(center[0], center[1]) },
          iterations: { value: 128 },
        },
        transparent: true,
        depthTest: false,
        depthWrite: false,
      }),
    [zoom, center[0], center[1]]
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    material.uniforms.time.value = t;
    material.uniforms.resolution.value.set(size.width, size.height);
    material.uniforms.zoom.value = zoom;
    material.uniforms.center.value.set(center[0], center[1]);

    const phase = (t % (2 * ARC_PING_PONG_SEC)) / ARC_PING_PONG_SEC;
    const u = phase <= 1 ? phase : 2 - phase;
    const angle = C_ARC_START + u * (C_ARC_END - C_ARC_START);
    material.uniforms.cParam.value.set(C_RADIUS * Math.cos(angle), C_RADIUS * Math.sin(angle));

    material.uniforms.color1.value.setHSL((t * 0.1) % 1, 1, 0.5);
    material.uniforms.color2.value.setHSL((t * 0.15 + 0.33) % 1, 1, 0.5);
    material.uniforms.color3.value.setHSL((t * 0.12 + 0.66) % 1, 1, 0.5);
    material.uniforms.color4.value.setHSL((t * 0.18 + 0.5) % 1, 1, 0.5);
  });

  return <mesh geometry={geometry} material={material} />;
};
