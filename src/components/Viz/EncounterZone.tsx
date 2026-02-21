import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";

type EncounterZoneProps = {
  position: [number, number, number];
  color: string;
  visible: boolean;
};

const MIN_VISUAL_RADIUS = 0.05;

export function EncounterZone({ position, color, visible }: EncounterZoneProps) {
  const meshRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      // Pulse animation
      const scale = 1 + Math.sin(Date.now() * 0.003) * 0.15;
      meshRef.current.scale.setScalar(scale);
    }
    // Fade in
    if (meshRef.current?.material) {
      const mat = meshRef.current.material as { opacity: number };
      const target = visible ? 0.25 : 0;
      mat.opacity += (target - mat.opacity) * delta * 3;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[MIN_VISUAL_RADIUS, 24, 24]} />
      <meshBasicMaterial color={color} transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}
