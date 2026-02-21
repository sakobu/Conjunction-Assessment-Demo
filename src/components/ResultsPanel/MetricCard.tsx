import "./MetricCard.css";

type MetricCardProps = {
  label: string;
  value: string;
  unit?: string;
};

export function MetricCard({ label, value, unit }: MetricCardProps) {
  return (
    <div className="metric-card">
      <div className="metric-card__label">
        {label}
      </div>
      <div className="metric-card__value">
        {value}
        {unit && (
          <span className="metric-card__unit">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
