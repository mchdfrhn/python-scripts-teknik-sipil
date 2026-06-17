import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, Line, Cylinder, Html } from '@react-three/drei';
import * as THREE from 'three';
import type { BeamPoint } from '@/lib/api';

interface SteelBeam3DProps {
  length: number; // in meters
  load: number; // in kN
  profileHeight: number; // in mm
  points: BeamPoint[]; // from API
  status: 'safe' | 'warning' | 'danger' | 'neutral';
}

/**
 * SteelBeam3D — Steel I-Beam Deflection Visualization
 * 
 * Physics model:
 * - Simply-supported beam with central point load
 * - Deflection curve from structural analysis (actual data points from API)
 * - Visual exaggeration factor calibrated: 50× for small deflections, auto-reduced for large
 * - Maximum visual deflection clamped to ±2.0 units to prevent absurd visuals
 * - Load arrow height clamped to reasonable range
 */
export const SteelBeam3D: React.FC<SteelBeam3DProps> = ({ length, load, profileHeight, points, status }) => {
  // Scale down the 3D model: 1 unit in Three.js = 1 meter
  const scale = 1;
  const beamLength = length * scale;
  
  // Adaptive deflection scale:
  // For small deflections (<5mm): 50× exaggeration (clearly visible)
  // For large deflections (>50mm): scale reduces to keep max visual deflection ≤ 2.0 units
  const maxAbsDef = Math.max(...points.map(p => Math.abs(p.def)), 0.1); // in mm
  const baseScale = 50;
  const maxVisualDeflection = 2.0; // max 3D units of visual sag
  const deflectionScale = Math.min(baseScale, (maxVisualDeflection * 1000) / maxAbsDef);
  
  // Calculate points for the deformed beam
  const deformedPoints = useMemo(() => {
    return points.map(p => new THREE.Vector3(
      p.x * scale - beamLength / 2, // Centered on X
      Math.max(-maxVisualDeflection, Math.min(maxVisualDeflection, p.def * deflectionScale / 1000)), // Clamped
      0
    ));
  }, [points, beamLength, scale, deflectionScale, maxVisualDeflection]);

  const beamColor = status === 'danger' ? '#ef4444' : status === 'warning' ? '#f59e0b' : '#3b82f6';
  
  // Base depth and thickness for the I-beam visualization
  const h = (profileHeight / 1000) * scale * 2; // Exaggerate thickness slightly for visibility

  // Load arrow height — clamped to [1.0, 2.5] units above beam
  const arrowHeight = Math.max(1.0, Math.min(2.5, load / 80));

  return (
    <div className="w-full h-full min-h-[300px] cursor-move">
      <Canvas camera={{ position: [0, 2, length > 8 ? 8 : 6], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, 10, -5]} intensity={0.5} />
        
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />

        <group>
          {/* Ground Plane (Grid) */}
          <gridHelper args={[20, 20, 0x888888, 0x444444]} position={[0, -2, 0]} />

          {/* Supports (Pin and Roller) */}
          <group position={[-beamLength / 2, -h / 2 - 0.2, 0]}>
            <Cylinder args={[0, 0.2, 0.4, 4]} rotation={[0, Math.PI / 4, 0]} material-color="#64748b" />
          </group>
          <group position={[beamLength / 2, -h / 2 - 0.2, 0]}>
            <Cylinder args={[0.1, 0.1, 0.4, 16]} rotation={[0, 0, Math.PI / 2]} material-color="#64748b" />
            <Box args={[0.4, 0.1, 0.4]} position={[0, -0.25, 0]} material-color="#64748b" />
          </group>

          {/* Deformed Beam Line */}
          <Line
            points={deformedPoints}
            color={beamColor}
            lineWidth={8}
            dashed={false}
          />

          {/* Ghost of Original Beam (Dashed) */}
          <Line
            points={[
              new THREE.Vector3(-beamLength / 2, 0, 0),
              new THREE.Vector3(beamLength / 2, 0, 0)
            ]}
            color="#94a3b8"
            lineWidth={2}
            dashed={true}
            dashSize={0.2}
            dashScale={0.1}
          />

          {/* Load Arrow (Point Load at center) */}
          <group position={[0, arrowHeight, 0]}>
            <Cylinder args={[0.02, 0.02, arrowHeight, 8]} material-color="#ef4444" position={[0, arrowHeight / 2, 0]} />
            <Cylinder args={[0.15, 0, 0.3, 8]} material-color="#ef4444" position={[0, 0, 0]} />
            <Html position={[0.5, arrowHeight, 0]}>
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
                P = {load} kN
              </div>
            </Html>
          </group>

        </group>
      </Canvas>
    </div>
  );
};
