import { Line, Html } from "@react-three/drei";

type MissDistanceLineProps = {
  start: [number, number, number];
  end: [number, number, number];
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

  const midpoint: [number, number, number] = [
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
        <div
          style={{
            background: "rgba(0,0,0,0.8)",
            color: "#e2e8f0",
            padding: "2px 6px",
            borderRadius: 3,
            fontSize: "10px",
            fontFamily: "monospace",
            whiteSpace: "nowrap",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          {distance.toFixed(4)} km
        </div>
      </Html>
    </group>
  );
}
