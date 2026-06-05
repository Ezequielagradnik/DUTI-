"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  Sparkles,
  MeshDistortMaterial,
  Environment,
} from "@react-three/drei";
import type { Mesh, Group } from "three";

function Blob() {
  const mesh = useRef<Mesh>(null);
  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime;
    mesh.current.rotation.x = t * 0.12;
    mesh.current.rotation.y = t * 0.18;
  });
  return (
    <Float speed={1.4} rotationIntensity={0.6} floatIntensity={1.1}>
      <mesh ref={mesh} scale={1.3}>
        <icosahedronGeometry args={[1, 12]} />
        <MeshDistortMaterial
          color="#bd7b54"
          emissive="#7a3f1e"
          emissiveIntensity={0.25}
          roughness={0.18}
          metalness={0.85}
          distort={0.38}
          speed={1.6}
        />
      </mesh>
    </Float>
  );
}

function Ring() {
  const ref = useRef<Group>(null);
  useFrame((state) => {
    if (ref.current) ref.current.rotation.z = state.clock.elapsedTime * 0.25;
  });
  return (
    <group ref={ref} rotation={[Math.PI / 2.4, 0, 0]}>
      <mesh>
        <torusGeometry args={[2.1, 0.018, 16, 120]} />
        <meshStandardMaterial color="#15304f" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  );
}

export default function HeroCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} color="#ffffff" />
      <pointLight position={[-4, -2, -3]} intensity={2} color="#d99a72" />
      <Blob />
      <Ring />
      <Sparkles
        count={70}
        scale={8}
        size={3}
        speed={0.4}
        opacity={0.7}
        color="#d99a72"
      />
      <Environment preset="sunset" />
    </Canvas>
  );
}
