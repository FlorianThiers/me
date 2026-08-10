import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { DesignElement, ScaleConfig, Folder } from '../../types/gardenDesigner';
import { Garden3DScene } from './Garden3DScene';
import { getSceneFocus } from '../../utils/garden3dUtils';
import { filterVisibleElements } from '../../utils/designUtils';

interface Garden3DViewportProps {
  elements: DesignElement[];
  folders: Folder[];
  scale: ScaleConfig;
  layerVisibility: Record<string, boolean>;
  selectedElementIds: string[];
  onElementSelect: (id: string) => void;
  className?: string;
}

export const Garden3DViewport: React.FC<Garden3DViewportProps> = ({
  elements,
  folders,
  scale,
  layerVisibility,
  selectedElementIds,
  onElementSelect,
  className = ''
}) => {
  const visibleElements = filterVisibleElements(elements, folders, layerVisibility);
  const { center, distance } = getSceneFocus(visibleElements, scale);
  const maxDistance = Math.max(80, distance * 8);
  const camPos: [number, number, number] = [
    center[0] + distance * 0.85,
    center[1] + distance * 0.65,
    center[2] + distance * 0.85
  ];

  return (
    <div className={`relative bg-[#0d1110] ${className}`}>
      <div className="absolute top-3 left-3 z-10 px-2 py-1 rounded bg-dark-secondary/80 border border-white/10 text-[10px] text-white/50 uppercase tracking-wider">
        X rechts · Z diepte · Y hoogte · draai · scroll zoom
      </div>
      <Canvas
        className="!block !w-full !h-full"
        shadows
        camera={{ position: camPos, fov: 42, near: 0.1, far: Math.max(800, maxDistance * 2.5) }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <Suspense fallback={null}>
          <Garden3DScene
            elements={visibleElements}
            scale={scale}
            layerVisibility={layerVisibility}
            selectedElementIds={selectedElementIds}
            onElementSelect={onElementSelect}
            sceneDistance={distance}
            maxCameraDistance={maxDistance}
          />
          <OrbitControls
            makeDefault
            target={center}
            enablePan
            enableDamping
            dampingFactor={0.12}
            rotateSpeed={0.55}
            zoomSpeed={0.85}
            panSpeed={0.9}
            zoomToCursor
            screenSpacePanning
            minDistance={2}
            maxDistance={maxDistance}
            maxPolarAngle={Math.PI / 2.05}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};
