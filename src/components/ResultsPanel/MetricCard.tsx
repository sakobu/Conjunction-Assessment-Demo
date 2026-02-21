type MetricCardProps = {
  label: string;
  value: string;
  unit?: string;
};

export function MetricCard({ label, value, unit }: MetricCardProps) {
  return (
    <div
      style={{
        background: "var(--bg-card)",
        borderRadius: 4,
        padding: "8px 10px",
        border: "1px solid var(--border-subtle)",
      }}
    >
      <div
        style={{
          fontSize: "0.6875rem",
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.875rem",
          fontWeight: 600,
          color: "var(--text-primary)",
        }}
      >
        {value}
        {unit && (
          <span
            style={{
              fontSize: "0.6875rem",
              color: "var(--text-muted)",
              marginLeft: 4,
            }}
          >
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
