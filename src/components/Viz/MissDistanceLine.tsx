import { Line, Html } from "@react-three/drei";
import type { Vec3 } from "../../lib/index.ts";
import "./MissDistanceLine.css";

type MissDistanceLineProps = {
  start: Vec3;
  end: Vec3;
  distance: number;
  visible: boolean;
};

export function MissDistanceLine({
  start,
  end,
  distance,
  visible,
}: MissDistanceLineProps) {
  if (!visible) return null;

  const midpoint: Vec3 = [
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2,
    (start[2] + end[2]) / 2,
  ];

  return (
    <group>
      <Line
        points={[start, end]}
        color="#ffffff"
        lineWidth={1}
        dashed
        dashSize={0.02}
        gapSize={0.02}
        transparent
        opacity={0.6}
      />
      <Html position={midpoint} center style={{ pointerEvents: "none" }}>
        <div className="miss-label">
          {distance.toFixed(4)} km
        </div>
      </Html>
    </group>
  );
}
