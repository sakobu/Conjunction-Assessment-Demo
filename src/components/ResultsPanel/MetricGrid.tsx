import { MetricCard } from "./MetricCard.tsx";
import "./MetricGrid.css";
import { match as matchOption, some, none } from "@railway-ts/pipelines/option";
import type { ManeuverRecommendation, Vec3 } from "../../lib/index.ts";

type MetricGridProps = {
  rec: ManeuverRecommendation;
};

export function MetricGrid({ rec }: MetricGridProps) {
  const { dv, dvUnit } = matchOption(rec.deltaVRequired, {
    some: (v: number) => ({
      dv: `${(v * 1000).toFixed(2)}`,
      dvUnit: some("m/s"),
    }),
    none: () => ({ dv: "N/A", dvUnit: none() }),
  });

  const covLabel = matchOption(rec.risk.combinedCovariance, {
    some: (c: Vec3) =>
      c.map((v: number) => `${(v * 1000).toFixed(1)}m`).join(", "),
    none: () => "default 50m",
  });

  return (
    <div className="metric-grid">
      <MetricCard
        label="Miss Distance"
        value={rec.risk.missDistance.toFixed(4)}
        unit={some("km")}
      />
      <MetricCard
        label="Collision Prob"
        value={rec.risk.collisionProbability.toExponential(3)}
        unit={none()}
      />
      <MetricCard
        label="Rel. Velocity"
        value={rec.risk.relativeVelocity.toFixed(4)}
        unit={some("km/s")}
      />
      <MetricCard
        label="Time to TCA"
        value={rec.risk.timeToClosestApproach.toFixed(1)}
        unit={some("s")}
      />
      <MetricCard label="Delta-V" value={dv} unit={dvUnit} />
      <MetricCard label="1-sigma" value={covLabel} unit={none()} />
    </div>
  );
}
