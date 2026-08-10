import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import type { DesignElement, ScaleConfig } from '../../types/gardenDesigner';
import {
  elementsToMeshSpecs,
  getSceneFocus,
  pixelToMeters,
  type GardenMeshSpec
} from '../../utils/garden3dUtils';
import { buildTerrainMeshData } from '../../utils/terrainUtils';
import { getElementsBounds } from '../../utils/viewUtils';

interface GardenElementMeshProps {
  spec: GardenMeshSpec;
  scale: ScaleConfig;
  selected: boolean;
  onSelect: (id: string) => void;
}

const GardenElementMesh: React.FC<GardenElementMeshProps> = ({
  spec,
  scale,
  selected,
  onSelect
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    if (spec.shape === 'cylinder') {
      return new THREE.CylinderGeometry(spec.size[0] / 2, spec.size[0] / 2, spec.size[1], 24);
    }
    if (spec.shape === 'extrude' && spec.points && spec.points.length >= 3) {
      const shape = new THREE.Shape();
      const pts = spec.points;
      shape.moveTo(pixelToMeters(pts[0].x, scale), pixelToMeters(pts[0].y, scale));
      for (let i = 1; i < pts.length; i++) {
        shape.lineTo(pixelToMeters(pts[i].x, scale), pixelToMeters(pts[i].y, scale));
      }
      shape.closePath();
      return new THREE.ExtrudeGeometry(shape, {
        depth: spec.size[1],
        bevelEnabled: false
      });
    }
    return new THREE.BoxGeometry(spec.size[0], spec.size[1], spec.size[2]);
  }, [spec, scale]);

  useEffect(() => {
    return () => geometry.dispose();
  }, [geometry]);

  const position: [number, number, number] =
    spec.shape === 'extrude'
      ? [0, spec.position[1], 0]
      : spec.position;

  const rotation: [number, number, number] =
    spec.shape === 'extrude' ? [-Math.PI / 2, spec.rotationY, 0] : [0, spec.rotationY, 0];

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={position}
      rotation={rotation}
      castShadow
      receiveShadow
      onClick={(e) => {
        e.stopPropagation();
        onSelect(spec.id);
      }}
    >
      <meshStandardMaterial
        color={spec.color}
        transparent={spec.opacity < 1}
        opacity={spec.opacity}
        emissive={selected ? '#00ff88' : '#000000'}
        emissiveIntensity={selected ? 0.35 : 0}
        roughness={0.65}
        metalness={spec.shape === 'cylinder' && spec.size[1] > 1.2 ? 0.05 : 0.12}
      />
    </mesh>
  );
};

const GardenTerrainMesh: React.FC<{
  elements: DesignElement[];
  scale: ScaleConfig;
}> = ({ elements, scale }) => {
  const meshData = useMemo(() => {
    const bounds = getElementsBounds(elements);
    if (!bounds) return null;
    const cx = (bounds.minX + bounds.maxX) / 2;
    const cy = (bounds.minY + bounds.maxY) / 2;
    const span = Math.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY, 200) * 1.4;
    return buildTerrainMeshData(elements, scale, { x: cx, y: cy }, span, 40);
  }, [elements, scale]);

  const geometry = useMemo(() => {
    if (!meshData) return null;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(meshData.positions, 3));
    geo.setIndex(meshData.indices);
    geo.computeVertexNormals();
    return geo;
  }, [meshData]);

  useEffect(() => {
    return () => geometry?.dispose();
  }, [geometry]);

  if (!geometry) return null;

  return (
    <mesh geometry={geometry} receiveShadow castShadow>
      <meshStandardMaterial color="#2d4a2d" roughness={0.92} metalness={0.02} side={THREE.DoubleSide} />
    </mesh>
  );
};

interface GardenGroundProps {
  elements: DesignElement[];
  scale: ScaleConfig;
}

const GardenGround: React.FC<GardenGroundProps> = ({ elements, scale }) => {
  const { center, distance } = getSceneFocus(elements, scale);
  const size = distance * 2.2;
  const hasContours = elements.some((el) => el.properties.isContour);

  return (
    <group position={[center[0], 0, center[2]]}>
      {hasContours ? (
        <group position={[-center[0], 0, -center[2]]}>
          <GardenTerrainMesh elements={elements} scale={scale} />
        </group>
      ) : (
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
          <planeGeometry args={[size, size]} />
          <meshStandardMaterial color="#1a2e1a" roughness={0.95} />
        </mesh>
      )}
      <gridHelper args={[size, Math.min(40, Math.round(size)), '#2d4a2d', '#243824']} position={[0, 0.02, 0]} />
    </group>
  );
};

interface Garden3DSceneProps {
  elements: DesignElement[];
  scale: ScaleConfig;
  layerVisibility: Record<string, boolean>;
  selectedElementIds: string[];
  onElementSelect: (id: string) => void;
  sceneDistance: number;
  maxCameraDistance: number;
}

export const Garden3DScene: React.FC<Garden3DSceneProps> = ({
  elements,
  scale,
  layerVisibility,
  selectedElementIds,
  onElementSelect,
  sceneDistance,
  maxCameraDistance
}) => {
  const specs = useMemo(
    () => elementsToMeshSpecs(elements, scale, layerVisibility),
    [elements, scale, layerVisibility]
  );
  const { center } = getSceneFocus(elements, scale);
  const axisSize = Math.min(4, Math.max(2, sceneDistance * 0.15));
  const fogNear = sceneDistance * 2.5;
  const fogFar = Math.max(maxCameraDistance * 1.35, sceneDistance * 12);

  return (
    <>
      <color attach="background" args={['#0d1110']} />
      <fog attach="fog" args={['#0d1110', fogNear, fogFar]} />
      <ambientLight intensity={0.45} />
      <directionalLight
        position={[12, 18, 8]}
        intensity={1.1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <hemisphereLight args={['#8ecae6', '#1a2e1a', 0.35]} />
      <axesHelper args={[axisSize]} position={[center[0], 0.08, center[2]]} />
      <GardenGround elements={elements} scale={scale} />
      {specs.map((spec) => (
        <GardenElementMesh
          key={spec.id}
          spec={spec}
          scale={scale}
          selected={selectedElementIds.includes(spec.id)}
          onSelect={onElementSelect}
        />
      ))}
    </>
  );
};
