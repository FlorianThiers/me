import React, { useRef, useMemo, useEffect } from 'react';
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

interface MandelbrotBackgroundProps {
  intensity?: number;
  params?: {
    iterations: number;
    zoom: number;
    rotation: number;
    colorSpeed: number;
    glowIntensity: number;
    color1: string;
    color2: string;
    color3: string;
    color4: string;
  };
}

export const MandelbrotBackground: React.FC<MandelbrotBackgroundProps> = ({ 
  intensity = 1.0,
  params
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();

  // Maak plane geometry en material aan met useMemo
  const geometry = useMemo(() => new THREE.PlaneGeometry(4, 4), []); // Groter voor volledig scherm
  const material = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        time: { value: 0.0 },
        resolution: { value: new THREE.Vector2() },
        color1: { value: new THREE.Color(0x00ff88) }, // Neon groen
        color2: { value: new THREE.Color(0xff0088) }, // Neon roze
        color3: { value: new THREE.Color(0x0088ff) }, // Neon blauw
        color4: { value: new THREE.Color(0x8800ff) }, // Neon paars
        iterations: { value: 200 },
        zoomSpeed: { value: 0.05 },
        rotationSpeed: { value: 0.05 },
        colorSpeed: { value: 0.3 },
        glowIntensity: { value: 0.15 },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    
    // Zorg ervoor dat uniforms kunnen worden bijgewerkt
    mat.uniformsNeedUpdate = true;
    
    // Log de initial uniforms
    console.log('Material created with uniforms:', mat.uniforms);
    
    return mat;
  }, []);

  // Update material uniforms wanneer params veranderen
  useEffect(() => {
    if (material && params) {
      console.log('Updating Mandelbrot params:', params); // Debug log
      console.log('Current material uniforms before update:', material.uniforms); // Debug log
      
      // Update alle uniforms
      material.uniforms.iterations.value = params.iterations;
      material.uniforms.zoomSpeed.value = params.zoom;
      material.uniforms.rotationSpeed.value = params.rotation;
      material.uniforms.colorSpeed.value = params.colorSpeed;
      material.uniforms.glowIntensity.value = params.glowIntensity;
      
      // Update kleuren van control panel - zorg ervoor dat ze correct worden geparsed
      try {
        material.uniforms.color1.value.set(params.color1);
        material.uniforms.color2.value.set(params.color2);
        material.uniforms.color3.value.set(params.color3);
        material.uniforms.color4.value.set(params.color4);
        
        console.log('Colors updated successfully:', {
          color1: params.color1,
          color2: params.color2,
          color3: params.color3,
          color4: params.color4
        });
      } catch (error) {
        console.error('Error setting colors:', error);
      }
      
      // Force material update
      material.needsUpdate = true;
      
      // Force uniform update
      material.uniformsNeedUpdate = true;
      
      console.log('Material updated, uniforms after update:', material.uniforms);
    }
  }, [material, params]);

  useFrame((state) => {
    if (material) {
      material.uniforms.time.value = state.clock.elapsedTime;
      material.uniforms.resolution.value.set(size.width, size.height);
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry} material={material} />
  );
};
