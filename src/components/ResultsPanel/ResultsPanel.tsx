import type { ManeuverRecommendation, AssessError } from "../../lib/index.ts";
import { RiskBadge } from "./RiskBadge.tsx";
import { MetricGrid } from "./MetricGrid.tsx";
import { ErrorDisplay } from "./ErrorDisplay.tsx";
import "./ResultsPanel.css";

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
          <div className="results-idle">
            <div className="results-idle__icon">&#x25CE;</div>
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
              <div className="results-reasoning">{result.data.reasoning}</div>
            </div>

            <div className="panel__section">
              <div className="panel__section-title">Objects</div>
              <div className="results-objects">
                <div className="results-objects__row results-objects__row--primary">
                  <span className="results-objects__dot">&#9679;</span>{" "}
                  <span className="results-objects__id">
                    {result.data.risk.primary.id}
                  </span>
                  <span className="results-objects__type">
                    {result.data.risk.primary.objectType}
                  </span>
                </div>
                <div className="results-objects__row results-objects__row--secondary">
                  <span className="results-objects__dot">&#9679;</span>{" "}
                  <span className="results-objects__id">
                    {result.data.risk.secondary.id}
                  </span>
                  <span className="results-objects__type">
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
