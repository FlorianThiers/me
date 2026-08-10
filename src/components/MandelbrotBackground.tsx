import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

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

    vec2 valleyCenter = vec2(centerX, centerY);
    float distanceFromValley = length(uv - valleyCenter);
    float zoomEffect = 1.0 + zoomSpeed * sin(time * 0.3) * exp(-distanceFromValley * 0.1);
    uv = valleyCenter + (uv - valleyCenter) * zoomEffect;

    // Additive wobble only — never bake time into a varying rate (that grows ~t).
    float angle = time * rotationSpeed + 0.35 * sin(time * 0.02);
    mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
    uv = valleyCenter + rot * (uv - valleyCenter);

    vec3 color = mandelbrot(uv);
    float glow = glowIntensity / (1.0 + length(uv) * 2.0);
    color += glow * vec3(0.2, 0.5, 0.7);
    color += 0.05 * sin(time * colorSpeed * 2.0) * vec3(0.8, 0.4, 0.6);
    color = pow(color, vec3(0.7));
    color *= 0.9;
    gl_FragColor = vec4(color, 1.0);
  }
`;

/** Homepage hero — fixed overview valley with breathe / rotate (no valley tour). */
export const MandelbrotBackground: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();

  const geometry = useMemo(() => new THREE.PlaneGeometry(6, 6), []);
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        time: { value: 0.0 },
        resolution: { value: new THREE.Vector2() },
        color1: { value: new THREE.Color(0x000ff0) },
        color2: { value: new THREE.Color(0xff0088) },
        color3: { value: new THREE.Color(0x0088ff) },
        color4: { value: new THREE.Color(0x8800ff) },
        iterations: { value: 150 },
        zoomSpeed: { value: 0.35 },
        rotationSpeed: { value: 0.025 },
        colorSpeed: { value: 0.8 },
        glowIntensity: { value: 0.2 },
        centerX: { value: -0.55 },
        centerY: { value: 0.02 },
        zoomLevel: { value: 1.35 },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
  }, []);

  useFrame((state) => {
    if (!material) return;

    const currentTime = state.clock.elapsedTime;
    material.uniforms.time.value = currentTime;
    material.uniforms.resolution.value.set(size.width, size.height);
    // Keep rates constant: shader does `time * rate`; modulating rate by time
    // makes angular velocity grow with elapsedTime (tab-hide → sudden turbo).
    material.uniforms.glowIntensity.value = 0.2 + 0.1 * Math.sin(currentTime * 0.08);

    const breath = 1 + 0.08 * Math.sin(currentTime * 0.22);
    material.uniforms.zoomLevel.value = 1.35 * breath;
    material.uniforms.centerX.value = -0.55 + 0.001 * Math.sin(currentTime * 0.02);
    material.uniforms.centerY.value = 0.02 + 0.0005 * Math.cos(currentTime * 0.03);

    material.uniforms.color1.value.setHSL((currentTime * 0.1) % 1, 1, 0.5);
    material.uniforms.color2.value.setHSL((currentTime * 0.15 + 0.33) % 1, 1, 0.5);
    material.uniforms.color3.value.setHSL((currentTime * 0.12 + 0.66) % 1, 1, 0.5);
    material.uniforms.color4.value.setHSL((currentTime * 0.18 + 0.5) % 1, 1, 0.5);
  });

  return <mesh ref={meshRef} geometry={geometry} material={material} />;
};
