import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";

const EARTH_RADIUS = 6.371; // 6371 km / 1000

export function Earth() {
  const meshRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <group>
      {/* Solid dark sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[EARTH_RADIUS, 32, 32]} />
        <meshBasicMaterial color="#0a1628" transparent opacity={0.95} />
      </mesh>
      {/* Wireframe overlay */}
      <mesh>
        <sphereGeometry args={[EARTH_RADIUS * 1.001, 24, 24]} />
        <meshBasicMaterial
          color="#1e3a5f"
          wireframe
          transparent
          opacity={0.4}
        />
      </mesh>
    </group>
  );
}
