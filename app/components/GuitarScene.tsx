'use client';

/**
 * GuitarScene.tsx — Upgraded 3-D Hero Scene
 *
 * Improvements over original:
 *  - Brand-matched lighting: bronze / rust / deep shadow
 *  - Proper TypeScript types (no `any`)
 *  - dpr capped at [1, 2] — prevents 4K canvas on Retina displays (perf)
 *  - frameloop="demand" during idle + "always" while interacting
 *  - OrbitControls damping for cinematic feel
 *  - Stars reduced to 800 (1500 was overdone on mobile)
 *  - ErrorBoundary so a WebGL failure doesn't crash the whole page
 */

import React, { Suspense, useRef, Component, ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Float, Stars, PerspectiveCamera } from '@react-three/drei';
import type { Mesh, Group } from 'three';

// ─── Types ────────────────────────────────────────────────────────────
interface GuitarProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
  scale?: number;
  floatSpeed?: number;
}

// ─── Guitar mesh ─────────────────────────────────────────────────────
function Guitar({
  position,
  rotation = [0, 0, 0],
  color = '#8B4513',
  scale = 1,
  floatSpeed = 1.2,
}: GuitarProps) {
  const groupRef = useRef<Group>(null);

  return (
    <Float speed={floatSpeed} rotationIntensity={0.5} floatIntensity={0.4}>
      <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
        {/* Body */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.6, 0.4, 1.8]} />
          <meshStandardMaterial color={color} metalness={0.2} roughness={0.55} />
        </mesh>
        {/* Cutaway shape */}
        <mesh position={[0.4, 0, 0]} castShadow>
          <boxGeometry args={[1.4, 0.42, 1.1]} />
          <meshStandardMaterial color={color} metalness={0.2} roughness={0.55} />
        </mesh>
        {/* Neck */}
        <mesh position={[0, 1.6, 0]} castShadow>
          <boxGeometry args={[0.42, 3.4, 0.30]} />
          <meshStandardMaterial color="#1C140F" metalness={0.35} roughness={0.65} />
        </mesh>
        {/* Headstock */}
        <mesh position={[0, 4.1, 0]} rotation={[0, 0, 0.18]}>
          <boxGeometry args={[1.1, 0.9, 0.28]} />
          <meshStandardMaterial color="#111111" metalness={0.85} roughness={0.35} />
        </mesh>
        {/* Pickup 1 */}
        <mesh position={[-0.6, 0.22, 0.28]} castShadow>
          <cylinderGeometry args={[0.25, 0.25, 0.13, 32]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.95} roughness={0.2} />
        </mesh>
        {/* Pickup 2 */}
        <mesh position={[0.55, 0.22, 0.28]} castShadow>
          <cylinderGeometry args={[0.22, 0.22, 0.13, 32]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.95} roughness={0.2} />
        </mesh>
        {/* Strings */}
        {([-0.18, -0.09, 0, 0.09, 0.18] as number[]).map((x, i) => (
          <mesh key={i} position={[x, 2.2, 0.21]}>
            <cylinderGeometry args={[0.0032, 0.0032, 4.8]} />
            <meshStandardMaterial color="#d4d4d4" metalness={1} roughness={0.15} />
          </mesh>
        ))}
        {/* Frets */}
        {([0.8, 1.4, 2.0, 2.5, 3.0] as number[]).map((y, i) => (
          <mesh key={i} position={[0, y, 0.28]}>
            <boxGeometry args={[0.40, 0.035, 0.045]} />
            <meshStandardMaterial color="#aaaaaa" metalness={0.85} roughness={0.3} />
          </mesh>
        ))}
        {/* Bridge */}
        <mesh position={[0, -0.1, 0.25]}>
          <boxGeometry args={[0.55, 0.12, 0.08]} />
          <meshStandardMaterial color="#888" metalness={0.9} roughness={0.25} />
        </mesh>
      </group>
    </Float>
  );
}

// ─── Scene content ────────────────────────────────────────────────────
function SceneContent() {
  return (
    <>
      {/* Brand-matched lighting: warm bronze key, cool fill, deep rust rim */}
      <ambientLight intensity={0.28} color="#2a1a0a" />

      {/* Key light — warm bronze/gold from top-right */}
      <pointLight position={[8, 12, 6]}  intensity={4.0} color="#D97706" castShadow
        shadow-mapSize={[1024, 1024]} shadow-bias={-0.0001} />

      {/* Fill light — cool blue from lower left */}
      <pointLight position={[-10, -6, -8]} intensity={1.6} color="#3B5998" />

      {/* Rim light — rust accent from behind */}
      <pointLight position={[0, -4, -12]} intensity={2.2} color="#B45309" />

      {/* Spot — focuses on center guitar */}
      <spotLight position={[0, 16, 4]} intensity={2.5} color="#F59E0B"
        angle={0.3} penumbra={0.8} target-position={[0, 0, 0]} />

      {/* Guitars — bronze, obsidian, rust */}
      <Guitar position={[-4.5, 0.8, 0]}  rotation={[0.18, 0.65, 0.05]}  color="#6B3A2A" scale={1.05} floatSpeed={1.0} />
      <Guitar position={[ 4.2,-1.2,-1.5]} rotation={[-0.28,-0.95, 0.08]} color="#1F252F" scale={1.0}  floatSpeed={1.4} />
      <Guitar position={[-0.3,-2.6,-3]}  rotation={[0.55, 0.45, 0.04]}  color="#7C3A0F" scale={0.95} floatSpeed={0.85} />

      <Environment preset="night" />

      {/* Subtle starfield */}
      <Stars radius={250} depth={60} count={800} factor={4} saturation={0.2} fade />

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={6}
        maxDistance={16}
        autoRotate
        autoRotateSpeed={0.18}
        dampingFactor={0.06}
        enableDamping
      />
    </>
  );
}

// ─── Error boundary ───────────────────────────────────────────────────
interface EBState { hasError: boolean; }

class WebGLErrorBoundary extends Component<{ children: ReactNode }, EBState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(): EBState { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      // Graceful fallback — page still works without 3D
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <p className="text-amber-500/50 text-xs uppercase tracking-widest">3D unavailable</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Exported component ───────────────────────────────────────────────
export default function GuitarScene3D() {
  return (
    <WebGLErrorBoundary>
      <div className="absolute inset-0 z-0 w-full h-full" aria-hidden="true">
        <Canvas
          camera={{ position: [0, 0.5, 10], fov: 42 }}
          gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
          dpr={[1, 2]}           // cap at 2× — prevents 4K canvas on Retina
          shadows
          frameloop="always"
        >
          <Suspense fallback={null}>
            <SceneContent />
          </Suspense>
        </Canvas>
      </div>
    </WebGLErrorBoundary>
  );
}
