import "./Dashboard.css";
import { useConjunctionAssessment } from "../../hooks/useConjunctionAssessment.ts";
import { InputPanel } from "../InputPanel/InputPanel.tsx";
import { ResultsPanel } from "../ResultsPanel/ResultsPanel.tsx";
import { ConjunctionScene } from "../Viz/ConjunctionScene.tsx";

export function Dashboard() {
  const { form, result, liveValues, selectedScenario, loadScenario } =
    useConjunctionAssessment();

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <div className="dashboard__status-dot" />
        <span className="dashboard__title">Conjunction Assessment</span>
        <span className="dashboard__subtitle">Mission Control Dashboard</span>
      </div>

      <InputPanel
        form={form}
        selectedScenario={selectedScenario}
        loadScenario={loadScenario}
      />

      <ConjunctionScene values={liveValues} result={result} />

      <ResultsPanel result={result} />
    </div>
  );
}
