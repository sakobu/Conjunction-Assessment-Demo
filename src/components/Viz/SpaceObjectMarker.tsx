import { Billboard, Text } from "@react-three/drei";
import type { Vec3 } from "../../lib/index.ts";

type SpaceObjectMarkerProps = {
  position: Vec3;
  color: string;
  label: string;
  labelOffset?: "above" | "below";
  markerScale?: number;
};

const SCALE = 1 / 1000; // 1 scene unit = 1000 km

export function SpaceObjectMarker({
  position,
  color,
  label,
  labelOffset = "above",
  markerScale = 1,
}: SpaceObjectMarkerProps) {
  const pos: Vec3 = [
    position[0] * SCALE,
    position[1] * SCALE,
    position[2] * SCALE,
  ];

  return (
    <group position={pos}>
      {/* Glow sphere */}
      <mesh scale={0.03 * markerScale}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
      {/* Core point */}
      <mesh scale={0.015 * markerScale}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {/* Label */}
      <Billboard position={[0, labelOffset === "above" ? 0.08 : -0.08, 0]}>
        <Text
          fontSize={0.04}
          color={color}
          anchorX="center"
          anchorY={labelOffset === "above" ? "bottom" : "top"}
          outlineColor="#000000"
          outlineWidth={0.004}
        >
          {label}
        </Text>
      </Billboard>
    </group>
  );
}
