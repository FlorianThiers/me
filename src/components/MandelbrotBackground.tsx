import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Vertex shader voor de Mandelbrot set
const vertexShader = `
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment shader voor de Mandelbrot set berekening
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
    
    // Dynamische iteraties voor duidelijkere vertakkingen
    for(int i = 0; i < 500; i++) {
      if(i >= iterations) break;
      
      z = complexMul(z, z) + c;
      
      if(length(z) > 2.0) {
        float t = float(i) / float(iterations);
        
        // Vloeiendere kleurovergangen met meerdere kleuren
        if(t < 0.25) {
          color = mix(color1, color2, t * 4.0);
        } else if(t < 0.5) {
          color = mix(color2, color3, (t - 0.25) * 4.0);
        } else if(t < 0.75) {
          color = mix(color3, color4, (t - 0.5) * 4.0);
        } else {
          color = mix(color4, color1, (t - 0.75) * 4.0);
        }
        
        // Voeg subtiele variatie toe voor meer detail
        color += 0.15 * sin(t * 50.0 + time * colorSpeed) * vec3(1.0, 0.5, 0.8);
        break;
      }
    }
    
    return color;
  }
  
  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / min(resolution.y, resolution.x);
    
    // Pas zoom level toe
    uv *= zoomLevel;
    
    // Verschuif naar het gekozen centrum
    uv += vec2(centerX, centerY);
    
    // Zoom effect voor meer detail - gebruik zoomSpeed uniform
    float scale = 1.0 + zoomSpeed * sin(time * 0.3);
    uv *= scale;
    
    // Rotatie voor beweging - gebruik rotationSpeed uniform
    float angle = time * rotationSpeed;
    mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
    uv = rot * uv;
    
    // Bereken Mandelbrot kleur
    vec3 color = mandelbrot(uv);
    
    // Voeg glow effect toe - gebruik glowIntensity uniform
    float glow = glowIntensity / (1.0 + length(uv) * 3.0);
    color += glow * vec3(0.1, 0.4, 0.6);
    
    // Voeg dynamische kleurvariatie toe
    color += 0.1 * sin(time * colorSpeed * 2.0) * vec3(0.8, 0.4, 0.6);
    
    // Verbeter contrast en helderheid
    color = pow(color, vec3(0.8));
    color *= 1.2;
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

export const MandelbrotBackground: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();

  // Maak plane geometry en material aan met useMemo
  const geometry = useMemo(() => new THREE.PlaneGeometry(4, 4), []);
  const material = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        time: { value: 0.0 },
        resolution: { value: new THREE.Vector2() },
        color1: { value: new THREE.Color(0x000ff0) }, // Neon groen
        color2: { value: new THREE.Color(0xff0088) }, // Neon roze
        color3: { value: new THREE.Color(0x0088ff) }, // Neon blauw
        color4: { value: new THREE.Color(0x8800ff) }, // Neon paars
        iterations: { value: 150 },
        zoomSpeed: { value: 1 },
        rotationSpeed: { value: 0.08 },
        colorSpeed: { value: 0.8 },
        glowIntensity: { value: 0.2 },
        centerX: { value: -0.5 },
        centerY: { value: 0.0 },
        zoomLevel: { value: 1.2 },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    
    return mat;
  }, []);

  useFrame((state) => {
    if (material) {
      material.uniforms.time.value = state.clock.elapsedTime;
      material.uniforms.resolution.value.set(size.width, size.height);
      
      // Animate parameters directly in the shader uniforms
      material.uniforms.zoomSpeed.value = 1.05 + 0.05 * Math.sin(state.clock.elapsedTime * 0.1);
      material.uniforms.rotationSpeed.value = 0.08 + 0.02 * Math.sin(state.clock.elapsedTime * 0.02);
      material.uniforms.colorSpeed.value = 0.8 + 0.2 * Math.sin(state.clock.elapsedTime * 0.005);
      material.uniforms.glowIntensity.value = 0.2 + 0.1 * Math.sin(state.clock.elapsedTime * 0.08);
      
      // Randomize colors over time for dynamic color changes
      const time = state.clock.elapsedTime;
      
      // Color 1 - cycles through different neon colors
      const hue1 = (time * 0.1) % 1.0;
      material.uniforms.color1.value.setHSL(hue1, 1.0, 0.5);
      
      // Color 2 - different cycle speed
      const hue2 = (time * 0.15 + 0.33) % 1.0;
      material.uniforms.color2.value.setHSL(hue2, 1.0, 0.5);
      
      // Color 3 - another cycle speed
      const hue3 = (time * 0.12 + 0.66) % 1.0;
      material.uniforms.color3.value.setHSL(hue3, 1.0, 0.5);
      
      // Color 4 - different cycle speed
      const hue4 = (time * 0.18 + 0.5) % 1.0;
      material.uniforms.color4.value.setHSL(hue4, 1.0, 0.5);
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry} material={material} />
  );
};
