import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box } from '@react-three/drei';
import * as THREE from 'three';

interface Earthquake3DProps {
  floors: number;
  deflections: number[]; // real-time deflections array [0..floors]
  status: 'safe' | 'warning' | 'danger' | 'neutral';
}

interface BuildingSceneProps {
  floors: number;
  deflections: number[];
  buildingColor: string;
}

// Visual and structural constants
const floorHeight = 1.0; // scaled 3D units per floor
const buildingWidth = 3.0;
const buildingDepth = 2.0;
const columnThickness = 0.15;
const slabThickness = 0.1;
const vizScale = 3.0;
const maxTiltAngle = (15 * Math.PI) / 180;

const colPositions = [
  [-buildingWidth / 2 + columnThickness, buildingDepth / 2 - columnThickness],
  [buildingWidth / 2 - columnThickness, buildingDepth / 2 - columnThickness],
  [-buildingWidth / 2 + columnThickness, -buildingDepth / 2 + columnThickness],
  [buildingWidth / 2 - columnThickness, -buildingDepth / 2 + columnThickness],
];

const BuildingScene: React.FC<BuildingSceneProps> = ({ floors, deflections, buildingColor }) => {
  // We use refs for smooth interpolation of each floor's X position
  const currentDefsRef = useRef<number[]>([]);
  const meshGroupRef = useRef<THREE.Group>(null);

  // Smooth interpolation each frame (lerp towards target)
  useFrame(() => {
    // Initialize or resize the deflections ref array if floors changes
    if (currentDefsRef.current.length !== floors + 1) {
      currentDefsRef.current = new Array(floors + 1).fill(0);
    }

    const current = currentDefsRef.current;
    for (let i = 0; i <= floors; i++) {
      const target = (deflections[i] || 0) * vizScale;
      // Lerp factor: 0.15 gives smooth, responsive follow without jitter
      current[i] = current[i] + (target - current[i]) * 0.15;
    }

    if (!meshGroupRef.current) return;
    const currentDefs = currentDefsRef.current;
    let childIdx = 0;
    const children = meshGroupRef.current.children;

    // Update floor slabs
    for (let i = 0; i <= floors; i++) {
      const defX = currentDefs[i] || 0;
      const yPos = i * floorHeight;
      const isFoundation = i === 0;
      
      if (childIdx < children.length) {
        children[childIdx].position.set(defX, isFoundation ? -0.1 : yPos, 0);
        childIdx++;
      }
    }

    // Update columns
    for (let i = 0; i < floors; i++) {
      const defX = currentDefs[i] || 0;
      const nextDefX = currentDefs[i + 1] || 0;
      const yPos = i * floorHeight;

      // Drift between this floor and next
      const interStoryDrift = nextDefX - defX;
      
      // Column tilt angle — clamped for realism
      let angleZ = Math.atan2(interStoryDrift, floorHeight);
      angleZ = Math.max(-maxTiltAngle, Math.min(maxTiltAngle, angleZ));

      // Column length (slightly stretched by tilt, but negligible for small angles)
      const colLength = floorHeight / Math.cos(angleZ);
      
      const colY = yPos + floorHeight / 2;
      const colX = (defX + nextDefX) / 2;

      for (let idx = 0; idx < colPositions.length; idx++) {
        const ci = childIdx;
        if (ci < children.length) {
          const colGroup = children[ci] as THREE.Group;
          colGroup.position.set(colX + colPositions[idx][0], colY, colPositions[idx][1]);
          colGroup.rotation.set(0, 0, -angleZ);
          
          // Update column box length
          const box = colGroup.children[0] as THREE.Mesh;
          if (box && box.geometry) {
            // Scale Y to match column length
            box.scale.set(1, colLength / floorHeight, 1);
          }
        }
        childIdx++;
      }
    }
  });

  // Build initial geometry (positions will be updated by useFrame)
  const elements: React.ReactNode[] = [];

  // Floor slabs
  for (let i = 0; i <= floors; i++) {
    const isFoundation = i === 0;
    elements.push(
      <Box 
        key={`slab-${i}`} 
        args={isFoundation ? [buildingWidth + 1, 0.2, buildingDepth + 1] : [buildingWidth, slabThickness, buildingDepth]} 
        position={[0, isFoundation ? -0.1 : i * floorHeight, 0]}
        material-color={isFoundation ? "#64748b" : "#94a3b8"}
        material-transparent
        material-opacity={isFoundation ? 1.0 : 0.8}
      />
    );
  }

  // Columns
  for (let i = 0; i < floors; i++) {
    for (let idx = 0; idx < colPositions.length; idx++) {
      elements.push(
        <group key={`col-${i}-${idx}`} position={[colPositions[idx][0], i * floorHeight + floorHeight / 2, colPositions[idx][1]]}>
          <Box args={[columnThickness, floorHeight, columnThickness]} material-color={buildingColor} />
        </group>
      );
    }
  }

  return <group ref={meshGroupRef}>{elements}</group>;
};

export const Earthquake3D: React.FC<Earthquake3DProps> = ({ floors, deflections, status }) => {
  const buildingColor = status === 'danger' ? '#ef4444' : status === 'warning' ? '#f59e0b' : '#3b82f6';
  
  return (
    <div className="w-full h-full min-h-[300px] cursor-move">
      <Canvas camera={{ position: [5, floors * 0.8, 8], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, 10, -5]} intensity={0.5} />
        
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} target={[0, floors * 0.5, 0]} />

        {/* Ground Plane (Grid) */}
        <gridHelper args={[30, 30, 0x888888, 0x444444]} position={[0, -0.2, 0]} />

        <BuildingScene floors={floors} deflections={deflections} buildingColor={buildingColor} />
      </Canvas>
    </div>
  );
};
