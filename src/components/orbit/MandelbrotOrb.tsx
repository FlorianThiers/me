import React, { useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { MandelbrotViewConfig } from '../../data/pageMandelbrotConfig';

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
  uniform vec3 color1;
  uniform vec3 color2;
  uniform vec3 color3;
  uniform vec3 color4;
  uniform int iterations;
  uniform float zoomSpeed;
  uniform float rotationSpeed;
  uniform float colorSpeed;
  uniform float glowIntensity;
  uniform float centerX;
  uniform float centerY;
  uniform float zoomLevel;
  varying vec2 vUv;

  vec2 complexMul(vec2 a, vec2 b) {
    return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
  }

  vec3 mandelbrot(vec2 c) {
    vec2 z = vec2(0.0);
    vec3 color = vec3(0.0);
    for(int i = 0; i < 500; i++) {
      if(i >= iterations) break;
      z = complexMul(z, z) + c;
      if(length(z) > 2.0) {
        float t = float(i) / float(iterations);
        if(t < 0.25) color = mix(color1, color2, t * 4.0);
        else if(t < 0.5) color = mix(color2, color3, (t - 0.25) * 4.0);
        else if(t < 0.75) color = mix(color3, color4, (t - 0.5) * 4.0);
        else color = mix(color4, color1, (t - 0.75) * 4.0);
        color += 0.15 * sin(t * 50.0 + time * colorSpeed) * vec3(1.0, 0.5, 0.8);
        break;
      }
    }
    return color;
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / resolution.y;
    uv *= zoomLevel;
    uv += vec2(centerX, centerY);

    vec2 focus = vec2(centerX, centerY);
    float dist = length(uv - focus);
    float zoomEffect = 1.0 + zoomSpeed * sin(time * 0.3) * exp(-dist * 0.1);
    uv = focus + (uv - focus) * zoomEffect;

    // Additive wobble only — never bake time into a varying rate (that grows ~t).
    float angle = time * rotationSpeed + 0.4 * sin(time * 0.02);
    mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
    uv = focus + rot * (uv - focus);

    vec3 color = mandelbrot(uv);
    float glow = glowIntensity / (1.0 + length(uv) * 2.0);
    color += glow * vec3(0.2, 0.5, 0.7);
    color += 0.05 * sin(time * colorSpeed * 2.0) * vec3(0.8, 0.4, 0.6);
    color = pow(color, vec3(0.7));
    color *= 0.9;
    gl_FragColor = vec4(color, 1.0);
  }
`;

type Props = {
  view: MandelbrotViewConfig;
};

/**
 * One fixed Mandelbrot landmark per page.
 * Animation mirrors JuliaOrb: ping-pong zoom + colour cycle + local rotation — never changes valley.
 */
export const MandelbrotOrb: React.FC<Props> = ({ view }) => {
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
          color1: { value: new THREE.Color(0x00ff88) },
          color2: { value: new THREE.Color(0xff0088) },
          color3: { value: new THREE.Color(0x0088ff) },
          color4: { value: new THREE.Color(0x8800ff) },
          iterations: { value: view.iterations },
          zoomSpeed: { value: view.zoomSpeed },
          rotationSpeed: { value: view.rotationSpeed },
          colorSpeed: { value: 0.8 },
          glowIntensity: { value: 0.2 },
          centerX: { value: view.centerX },
          centerY: { value: view.centerY },
          zoomLevel: { value: view.zoomLevel },
        },
        transparent: true,
        depthTest: false,
        depthWrite: false,
      }),
    [view]
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    material.uniforms.time.value = t;
    material.uniforms.resolution.value.set(size.width, size.height);
    material.uniforms.iterations.value = view.iterations;

    const breathSec = view.breathSec;
    const phase = (t % (2 * breathSec)) / breathSec;
    const u = phase <= 1 ? phase : 2 - phase;
    const zoom =
      view.zoomLevel * (1 + view.zoomBreathAmp * Math.sin(u * Math.PI));

    material.uniforms.zoomLevel.value = zoom;
    material.uniforms.centerX.value = view.centerX + 0.0008 * Math.sin(t * 0.02);
    material.uniforms.centerY.value = view.centerY + 0.0004 * Math.cos(t * 0.03);
    // Keep rates constant: shader does `time * rate`; modulating rate by time
    // makes angular velocity grow with elapsedTime (tab-hide → sudden turbo).
    material.uniforms.rotationSpeed.value = view.rotationSpeed;
    material.uniforms.zoomSpeed.value = view.zoomSpeed;
    material.uniforms.colorSpeed.value = 0.8;
    material.uniforms.glowIntensity.value = 0.2 + 0.1 * Math.sin(t * 0.08);

    const cp = view.colorPhase;
    material.uniforms.color1.value.setHSL((t * 0.1 + cp) % 1, 1, 0.5);
    material.uniforms.color2.value.setHSL((t * 0.15 + 0.33 + cp) % 1, 1, 0.5);
    material.uniforms.color3.value.setHSL((t * 0.12 + 0.66 + cp) % 1, 1, 0.5);
    material.uniforms.color4.value.setHSL((t * 0.18 + 0.5 + cp) % 1, 1, 0.5);
  });

  return <mesh geometry={geometry} material={material} />;
};
