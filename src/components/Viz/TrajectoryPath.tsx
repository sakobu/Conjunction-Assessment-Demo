import { useMemo } from "react";
import { Line } from "@react-three/drei";
import { propagateLinear, type Vec3 } from "../../lib/index.ts";

type TrajectoryPathProps = {
  position: Vec3;
  velocity: Vec3;
  tca: number;
  color: string;
  dashed?: boolean;
};

const SCALE = 1 / 1000;
const NUM_POINTS = 100;
const TIME_RANGE = 300; // +/- 300 seconds around TCA

export function TrajectoryPath({
  position,
  velocity,
  tca,
  color,
  dashed = false,
}: TrajectoryPathProps) {
  const points = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= NUM_POINTS; i++) {
      const t = tca - TIME_RANGE + (i / NUM_POINTS) * TIME_RANGE * 2;
      const p = propagateLinear(t)(position)(velocity);
      pts.push([p[0] * SCALE, p[1] * SCALE, p[2] * SCALE]);
    }
    return pts;
  }, [position, velocity, tca]);

  if (points.length < 2) return null;

  return (
    <Line
      points={points}
      color={color}
      lineWidth={2}
      transparent
      opacity={0.8}
      dashed={dashed}
      dashSize={0.05}
      gapSize={0.03}
    />
  );
}
