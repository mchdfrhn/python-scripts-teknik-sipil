import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

interface SoilBearing3DProps {
  width: number; // base width (B) in meters
  status: 'safe' | 'warning' | 'danger' | 'neutral';
  q_ult: number;
}

interface StructureSceneProps {
  width: number;
  settlementTarget: number;
  columnWidth: number;
  columnHeight: number;
  footingThickness: number;
  footingLength: number;
}

interface StressBulbSceneProps {
  width: number;
  status: 'safe' | 'warning' | 'danger' | 'neutral';
  q_ult: number;
  stressColor: string;
  footingThickness: number;
}

const StructureScene: React.FC<StructureSceneProps> = ({
  width,
  settlementTarget,
  columnWidth,
  columnHeight,
  footingThickness,
  footingLength,
}) => {
  const structRef = useRef<THREE.Group>(null);
  const currentSettlement = useRef(0);

  useFrame(() => {
    if (!structRef.current) return;
    // Smooth settlement interpolation
    currentSettlement.current += (settlementTarget - currentSettlement.current) * 0.03;
    structRef.current.position.y = currentSettlement.current;
  });

  return (
    <group ref={structRef}>
      {/* Column */}
      <Box args={[columnWidth, columnHeight, columnWidth]} position={[0, columnHeight / 2 + footingThickness / 2, 0]} material-color="#94a3b8" />
      
      {/* Footing Pad */}
      <Box args={[width, footingThickness, footingLength]} position={[0, 0, 0]} material-color="#cbd5e1" />
    </group>
  );
};

const StressBulbScene: React.FC<StressBulbSceneProps> = ({
  width,
  status,
  q_ult,
  stressColor,
  footingThickness,
}) => {
  const bulbRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    if (bulbRef.current && materialRef.current) {
      const t = clock.getElapsedTime();

      // Speed scales with pressure, but with wider range and smoother feel
      // Low q_ult (~50 kPa): speed ~1.5  |  High q_ult (~500 kPa): speed ~4
      const speed = 1.0 + Math.min(4, q_ult / 150);
      
      // Pulse amplitude — visible but not distracting
      const pulse = 1.0 + Math.sin(t * 2 * speed) * 0.08;
      
      // Boussinesq stress bulbs: depth ~1.5× width, so stretch Y by 1.5x
      bulbRef.current.scale.set(pulse, pulse * 1.5, pulse);
      
      // Opacity pulse — more pronounced for danger status
      const opacityBase = status === 'danger' ? 0.55 : status === 'warning' ? 0.45 : 0.35;
      const opacityAmplitude = status === 'danger' ? 0.15 : 0.1;
      materialRef.current.opacity = opacityBase + Math.sin(t * 1.5 * speed) * opacityAmplitude;
    }
  });

  return (
    <mesh ref={bulbRef} position={[0, -footingThickness / 2 - 0.1, 0]}>
      <sphereGeometry args={[width * 0.7, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial 
        ref={materialRef} 
        color={stressColor} 
        transparent 
        opacity={0.5} 
        side={THREE.DoubleSide} 
      />
    </mesh>
  );
};

export const SoilBearing3D: React.FC<SoilBearing3DProps> = ({ width, status, q_ult }) => {
  const stressColor = status === 'danger' ? '#ef4444' : status === 'warning' ? '#f59e0b' : '#3b82f6';
  
  // Dimensions
  const columnWidth = 0.4;
  const columnHeight = 2.0;
  const footingThickness = 0.5;
  const footingLength = width; // Assuming square footing for visualization B x B

  // Settlement target based on status
  const settlementTarget = status === 'danger' ? -0.4 : status === 'warning' ? -0.1 : 0;

  return (
    <div className="w-full h-full min-h-[400px] cursor-move bg-slate-900 rounded-xl overflow-hidden">
      <Canvas camera={{ position: [width * 2, width, width * 3], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 15, 10]} intensity={1} castShadow />
        <directionalLight position={[-10, 5, -10]} intensity={0.3} />
        
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} target={[0, 0, 0]} />

        {/* Ground Plane (Soil surface cut-away) */}
        <group position={[0, -footingThickness / 2, 0]}>
          <Box args={[10, 0.05, 10]} material-color="#334155" material-transparent material-opacity={0.8} />
          <gridHelper args={[10, 10, 0x555555, 0x222222]} position={[0, 0.03, 0]} />
        </group>

        {/* Concrete Structure (with settlement animation) */}
        <StructureScene 
          width={width}
          settlementTarget={settlementTarget}
          columnWidth={columnWidth}
          columnHeight={columnHeight}
          footingThickness={footingThickness}
          footingLength={footingLength}
        />

        {/* Applied Load Arrow */}
        <group position={[0, columnHeight + footingThickness / 2 + 0.5, 0]}>
          <Cylinder args={[0.05, 0.05, 1, 8]} material-color="#ef4444" position={[0, 0.5, 0]} />
          <Cylinder args={[0.2, 0, 0.4, 8]} material-color="#ef4444" position={[0, 0, 0]} />
        </group>

        <StressBulbScene 
          width={width}
          status={status}
          q_ult={q_ult}
          stressColor={stressColor}
          footingThickness={footingThickness}
        />

      </Canvas>
    </div>
  );
};
