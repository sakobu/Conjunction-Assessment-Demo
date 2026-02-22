import "./MetricCard.css";
import { match as matchOption } from "@railway-ts/pipelines/option";
import type { Option } from "@railway-ts/pipelines/option";

type MetricCardProps = {
  label: string;
  value: string;
  unit: Option<string>;
};

export function MetricCard({ label, value, unit }: MetricCardProps) {
  return (
    <div className="metric-card">
      <div className="metric-card__label">
        {label}
      </div>
      <div className="metric-card__value">
        {value}
        {matchOption(unit, {
          some: (u) => <span className="metric-card__unit">{u}</span>,
          none: () => null,
        })}
      </div>
    </div>
  );
}
