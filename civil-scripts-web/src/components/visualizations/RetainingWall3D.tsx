import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Text } from '@react-three/drei';
import * as THREE from 'three';

interface RetainingWall3DProps {
  height: number; // in meters (2-8)
  soilType: 'pasir' | 'lempung';
  status: 'safe' | 'warning' | 'danger' | 'neutral';
  sfOverturning: number;
  sfSliding: number;
}

interface RetainingWallSceneProps {
  height: number;
  status: 'safe' | 'warning' | 'danger' | 'neutral';
  wallColor: string;
  baseWidth: number;
  stemWidth: number;
  baseThickness: number;
  wallDepth: number;
  slideTarget: number;
  tiltTarget: number;
}

const RetainingWallScene: React.FC<RetainingWallSceneProps> = ({
  height,
  status,
  wallColor,
  baseWidth,
  stemWidth,
  baseThickness,
  wallDepth,
  slideTarget,
  tiltTarget,
}) => {
  const wallGroupRef = useRef<THREE.Group>(null);
  const outerGroupRef = useRef<THREE.Group>(null);
  
  // Smooth interpolation state
  const currentSlide = useRef(0);
  const currentTilt = useRef(0);

  // Dynamic animation for failure modes
  useFrame(({ clock }) => {
    if (!wallGroupRef.current || !outerGroupRef.current) return;
    
    const t = clock.getElapsedTime();
    
    // Smooth lerp towards target values (0.05 = slow, satisfying transition)
    currentSlide.current += (slideTarget - currentSlide.current) * 0.05;
    currentTilt.current += (tiltTarget - currentTilt.current) * 0.05;
    
    // Apply slide
    outerGroupRef.current.position.x = currentSlide.current;
    
    // Apply tilt rotation (around toe = front edge of base slab)
    wallGroupRef.current.rotation.z = currentTilt.current;
    
    if (status === 'danger') {
      // Subtle lateral vibration — represents progressive failure/cracking
      // ~0.6 Hz (natural frequency for a masonry wall), amplitude 0.03 units
      const shake = Math.sin(t * 4) * 0.03;
      outerGroupRef.current.position.x = currentSlide.current + shake;
    }
  });

  // Pivot point for overturning: toe of the wall (front edge of base slab)
  // The toe is at x = baseWidth/2 relative to center of base
  const toeX = baseWidth / 2;

  return (
    <group ref={outerGroupRef} position={[0, 0, 0]}>
      {/* Rotation pivot at the toe (front edge of base) */}
      <group ref={wallGroupRef} position={[toeX, 0, 0]} rotation={[0, 0, 0]}>
        <group position={[-toeX, 0, 0]}>
          {/* Base Slab */}
          <Box args={[baseWidth, baseThickness, wallDepth]} position={[0, baseThickness / 2, 0]} material-color={wallColor} />
          {/* Stem (wall body) — positioned near the heel side */}
          <Box 
            args={[stemWidth, height, wallDepth]} 
            position={[-baseWidth / 2 + stemWidth / 2 + baseWidth * 0.2, height / 2 + baseThickness, 0]} 
            material-color={wallColor} 
          />
        </group>
      </group>
    </group>
  );
};

export const RetainingWall3D: React.FC<RetainingWall3DProps> = ({ height, soilType, status, sfOverturning, sfSliding }) => {
  const wallColor = status === 'danger' ? '#ef4444' : status === 'warning' ? '#f59e0b' : '#94a3b8';
  const soilColor = soilType === 'pasir' ? '#d97706' : '#78350f'; // Amber for sand, dark brown for clay
  
  // Dimensions
  const baseWidth = height * 0.6;
  const stemWidth = Math.max(0.3, height * 0.1);
  const baseThickness = Math.max(0.4, height * 0.1);
  const wallDepth = 4; // depth into the screen
  
  // Visual amplification of failure — linked to Safety Factor (SF)
  // Safe limit is 1.5. If SF drops below 1.5, failure displacement increases proportionally.
  // Clamped to prevent visual explosion at very low SF
  const tiltTarget = sfOverturning < 1.5 
    ? -Math.min(0.4, 0.3 * (1.5 - sfOverturning))  // max ~23° tilt
    : 0;
  const slideTarget = sfSliding < 1.5 
    ? -Math.min(3.0, 2.0 * (1.5 - sfSliding))  // max 3 units slide
    : 0;

  return (
    <div className="w-full h-full min-h-[400px] cursor-move bg-slate-900 rounded-xl overflow-hidden">
      <Canvas camera={{ position: [0, height / 2 + 2, height + 5], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
        <directionalLight position={[-5, 5, -5]} intensity={0.3} />
        
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} target={[0, height / 3, 0]} />

        {/* Foundation Ground */}
        <Box args={[20, 1, 10]} position={[0, -0.5, 0]} material-color="#334155" />
        <gridHelper args={[20, 20, 0x555555, 0x222222]} position={[0, 0.01, 0]} />

        <RetainingWallScene 
          height={height}
          status={status}
          wallColor={wallColor}
          baseWidth={baseWidth}
          stemWidth={stemWidth}
          baseThickness={baseThickness}
          wallDepth={wallDepth}
          slideTarget={slideTarget}
          tiltTarget={tiltTarget}
        />

        {/* Backfill Soil Mass */}
        <Box 
          args={[8, height, wallDepth]} 
          position={[baseWidth / 2 + 4, height / 2 + baseThickness, 0]} 
          material-color={soilColor} 
          material-transparent 
          material-opacity={0.7} 
        />
        
        {/* Visual Force Arrow (Active Earth Pressure) */}
        <group position={[baseWidth / 2 + 0.1, height / 3 + baseThickness, 0]}>
          <mesh rotation={[0, 0, -Math.PI / 2]}>
             <cylinderGeometry args={[0.05, 0.05, 2, 8]} />
             <meshStandardMaterial color="#ef4444" />
          </mesh>
          <mesh position={[-1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
             <coneGeometry args={[0.2, 0.4, 8]} />
             <meshStandardMaterial color="#ef4444" />
          </mesh>
          <Text position={[-0.5, 0.4, 0]} color="#ef4444" fontSize={0.4} anchorX="center" anchorY="middle">
             Pa
          </Text>
        </group>

      </Canvas>
    </div>
  );
};
