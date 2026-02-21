import type {
  ManeuverRecommendation,
  AssessError,
} from "../../lib/index.ts";
import { RiskBadge } from "./RiskBadge.tsx";
import { MetricGrid } from "./MetricGrid.tsx";
import { ErrorDisplay } from "./ErrorDisplay.tsx";

type ResultState =
  | { status: "idle" }
  | { status: "success"; data: ManeuverRecommendation }
  | { status: "error"; error: AssessError };

type ResultsPanelProps = {
  result: ResultState;
};

export function ResultsPanel({ result }: ResultsPanelProps) {
  return (
    <div className="panel panel--right">
      <div className="panel__section">
        <div className="panel__section-title">Assessment Results</div>

        {result.status === "idle" && (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              color: "var(--text-muted)",
              fontSize: "0.8125rem",
            }}
          >
            <div
              style={{
                fontSize: "2rem",
                marginBottom: 8,
                opacity: 0.3,
              }}
            >
              &#x25CE;
            </div>
            Select a scenario and click
            <br />
            <strong>Assess Conjunction</strong>
          </div>
        )}

        {result.status === "success" && (
          <>
            <RiskBadge
              action={result.data.action}
              collisionProbability={result.data.risk.collisionProbability}
            />
            <MetricGrid rec={result.data} />
            <div className="panel__section">
              <div className="panel__section-title">Reasoning</div>
              <div
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                  fontFamily: "var(--font-mono)",
                  background: "var(--bg-card)",
                  padding: "10px 12px",
                  borderRadius: 4,
                  border: "1px solid var(--border-subtle)",
                }}
              >
                {result.data.reasoning}
              </div>
            </div>

            <div className="panel__section">
              <div className="panel__section-title">Objects</div>
              <div style={{ fontSize: "0.8125rem" }}>
                <div style={{ marginBottom: 4 }}>
                  <span style={{ color: "var(--obj-primary)" }}>&#9679;</span>{" "}
                  <span style={{ fontFamily: "var(--font-mono)" }}>
                    {result.data.risk.primary.id}
                  </span>
                  <span style={{ color: "var(--text-muted)", marginLeft: 8 }}>
                    {result.data.risk.primary.objectType}
                  </span>
                </div>
                <div>
                  <span style={{ color: "var(--obj-secondary)" }}>&#9679;</span>{" "}
                  <span style={{ fontFamily: "var(--font-mono)" }}>
                    {result.data.risk.secondary.id}
                  </span>
                  <span style={{ color: "var(--text-muted)", marginLeft: 8 }}>
                    {result.data.risk.secondary.objectType}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {result.status === "error" && <ErrorDisplay error={result.error} />}
      </div>
    </div>
  );
}
