import { RED_THRESHOLD, YELLOW_THRESHOLD } from "../../lib/index.ts";

type RiskBadgeProps = {
  action: "no_action" | "monitor" | "maneuver";
  collisionProbability: number;
};

const riskConfig = {
  maneuver: { label: "RED", color: "var(--risk-red)" },
  monitor: { label: "YELLOW", color: "var(--risk-amber)" },
  no_action: { label: "GREEN", color: "var(--risk-green)" },
};

export function RiskBadge({ action, collisionProbability }: RiskBadgeProps) {
  const config = riskConfig[action];
  const thresholdLabel =
    collisionProbability > RED_THRESHOLD
      ? `Pc > ${RED_THRESHOLD.toExponential(0)}`
      : collisionProbability > YELLOW_THRESHOLD
        ? `Pc > ${YELLOW_THRESHOLD.toExponential(0)}`
        : `Pc < ${YELLOW_THRESHOLD.toExponential(0)}`;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        borderRadius: 6,
        background: "rgba(0,0,0,0.3)",
        border: `1px solid ${config.color}`,
        marginBottom: 16,
      }}
    >
      <div
        style={{
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: config.color,
          boxShadow: `0 0 12px ${config.color}`,
        }}
      />
      <div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            fontSize: "0.9375rem",
            color: config.color,
          }}
        >
          {config.label} — {action.replace("_", " ").toUpperCase()}
        </div>
        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
          {thresholdLabel}
        </div>
      </div>
    </div>
  );
}
