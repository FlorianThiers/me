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
    vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / resolution.y;
    
    // Pas zoom level toe
    uv *= zoomLevel;
    
    // Verschuif naar het gekozen centrum (Elephant Valley)
    uv += vec2(centerX, centerY);
    
    // Zoom effect rond de Elephant Valley coördinaten (zeer subtiel om vervorming te voorkomen)
    vec2 valleyCenter = vec2(centerX, centerY);
    float distanceFromValley = length(uv - valleyCenter);
    float zoomEffect = 1.0 + zoomSpeed * sin(time * 0.3) * exp(-distanceFromValley * 0.1);
    uv = valleyCenter + (uv - valleyCenter) * zoomEffect;
    
    // Rotatie rond de Elephant Valley (niet rond het scherm centrum)
    float angle = time * rotationSpeed;
    mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
    uv = valleyCenter + rot * (uv - valleyCenter);
    
    // Bereken Mandelbrot kleur
    vec3 color = mandelbrot(uv);
    
    // Voeg glow effect toe - gebruik glowIntensity uniform
    float glow = glowIntensity / (1.0 + length(uv) * 2.0);
    color += glow * vec3(0.2, 0.5, 0.7);
    
    // Voeg dynamische kleurvariatie toe
    color += 0.05 * sin(time * colorSpeed * 2.0) * vec3(0.8, 0.4, 0.6);
    
    // Verbeter contrast en helderheid voor betere leesbaarheid
    color = pow(color, vec3(0.7));
    color *= 0.9;
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

export const MandelbrotBackground: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();

  // Maak plane geometry en material aan met useMemo - groter voor mobiele compatibiliteit
  const geometry = useMemo(() => new THREE.PlaneGeometry(6, 6), []);
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
        centerX: { value: -1 }, // Elephant Valley X coordinate
        centerY: { value: 0.1127 },  // Elephant Valley Y coordinate
        zoomLevel: { value: 1.5 },   // Zoom level for Elephant Valley view
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
      material.uniforms.zoomSpeed.value = 2 + 0.5 * Math.sin(state.clock.elapsedTime * 0.1); // Simple zoom animation
      material.uniforms.rotationSpeed.value = 0.05 + 0.02 * Math.sin(state.clock.elapsedTime * 0.02); // Rotation around valley
      material.uniforms.colorSpeed.value = 0.8 + 0.2 * Math.sin(state.clock.elapsedTime * 0.005);
      material.uniforms.glowIntensity.value = 0.2 + 0.1 * Math.sin(state.clock.elapsedTime * 0.08);
      
      // Animate center movement to create "breathing" effect around famous Mandelbrot locations
      const currentTime = state.clock.elapsedTime;
      
      // Famous Mandelbrot locations to cycle through
      const locations = [
        { x: -0.7453, y: 0.1127, name: "Elephant Valley" },
        { x: -0.8, y: 0.156, name: "Seahorse Valley" },
        { x: -0.16, y: 1.0405, name: "Lightning" },
        { x: -1.25066, y: 0.02012, name: "Misiurewicz Point" },
        { x: -0.745428, y: 0.113009, name: "Elephant Valley Deep" },
        { x: -0.7269, y: 0.1889, name: "Spiral" },
        { x: 0.28, y: 0.008, name: "Mini Mandelbrot" }
      ];
      
      // Calculate which location we should be at (changes every 10 seconds)
      const locationIndex = Math.floor(currentTime / 10) % locations.length;
      const nextLocationIndex = (locationIndex + 1) % locations.length;
      const transitionProgress = (currentTime % 10) / 10; // 0 to 1 over 10 seconds
      
      // Smooth transition between locations using cosine interpolation
      const smoothTransition = (1 - Math.cos(transitionProgress * Math.PI)) / 2;
      
      const currentLocation = locations[locationIndex];
      const nextLocation = locations[nextLocationIndex];
      
      // Interpolate between current and next location
      const targetX = currentLocation.x + (nextLocation.x - currentLocation.x) * smoothTransition;
      const targetY = currentLocation.y + (nextLocation.y - currentLocation.y) * smoothTransition;
      
      // Add subtle breathing movement on top of the location transitions
      material.uniforms.centerX.value = targetX + 0.001 * Math.sin(currentTime * 0.02);
      material.uniforms.centerY.value = targetY + 0.0005 * Math.cos(currentTime * 0.03);
      
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