import { RED_THRESHOLD, YELLOW_THRESHOLD } from "../../lib/index.ts";
import "./RiskBadge.css";

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
      className="risk-badge"
      style={{ '--risk-color': config.color } as React.CSSProperties}
    >
      <div className="risk-badge__dot" />
      <div>
        <div className="risk-badge__label">
          {config.label} — {action.replace("_", " ").toUpperCase()}
        </div>
        <div className="risk-badge__threshold">
          {thresholdLabel}
        </div>
      </div>
    </div>
  );
}
