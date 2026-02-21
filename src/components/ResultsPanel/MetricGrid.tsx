import { MetricCard } from "./MetricCard.tsx";
import {
  match as matchOption,
  mapWith as optMapWith,
  unwrapOr,
} from "@railway-ts/pipelines/option";
import type { ManeuverRecommendation, Vec3 } from "../../lib/index.ts";

type MetricGridProps = {
  rec: ManeuverRecommendation;
};

export function MetricGrid({ rec }: MetricGridProps) {
  const dvMapped = optMapWith((v: number) => `${(v * 1000).toFixed(2)}`)(
    rec.deltaVRequired,
  );
  const dv = unwrapOr(dvMapped, "N/A");

  const covLabel = matchOption(rec.risk.combinedCovariance, {
    some: (c: Vec3) => c.map((v: number) => `${(v * 1000).toFixed(1)}m`).join(", "),
    none: () => "default 50m",
  });

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 8,
        marginBottom: 16,
      }}
    >
      <MetricCard
        label="Miss Distance"
        value={rec.risk.missDistance.toFixed(4)}
        unit="km"
      />
      <MetricCard
        label="Collision Prob"
        value={rec.risk.collisionProbability.toExponential(3)}
      />
      <MetricCard
        label="Rel. Velocity"
        value={rec.risk.relativeVelocity.toFixed(4)}
        unit="km/s"
      />
      <MetricCard
        label="Time to TCA"
        value={rec.risk.timeToClosestApproach.toFixed(1)}
        unit="s"
      />
      <MetricCard label="Delta-V" value={dv} unit={dv !== "N/A" ? "m/s" : undefined} />
      <MetricCard label="1-sigma" value={covLabel} />
    </div>
  );
}
