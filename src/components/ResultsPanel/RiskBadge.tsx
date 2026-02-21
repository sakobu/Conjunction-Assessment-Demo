import { RED_THRESHOLD, YELLOW_THRESHOLD } from "../../lib/index.ts";
import "./RiskBadge.css";

type RiskBadgeProps = {
  action: "no_action" | "monitor" | "maneuver";
  collisionProbability: number;
};

const riskLabel: Record<RiskBadgeProps["action"], string> = {
  maneuver: "RED",
  monitor: "YELLOW",
  no_action: "GREEN",
};

export function RiskBadge({ action, collisionProbability }: RiskBadgeProps) {
  const thresholdLabel =
    collisionProbability > RED_THRESHOLD
      ? `Pc > ${RED_THRESHOLD.toExponential(0)}`
      : collisionProbability > YELLOW_THRESHOLD
        ? `Pc > ${YELLOW_THRESHOLD.toExponential(0)}`
        : `Pc < ${YELLOW_THRESHOLD.toExponential(0)}`;

  return (
    <div className={`risk-badge risk-badge--${action.replace("_", "-")}`}>
      <div className="risk-badge__dot" />
      <div>
        <div className="risk-badge__label">
          {riskLabel[action]} — {action.replace("_", " ").toUpperCase()}
        </div>
        <div className="risk-badge__threshold">
          {thresholdLabel}
        </div>
      </div>
    </div>
  );
}
