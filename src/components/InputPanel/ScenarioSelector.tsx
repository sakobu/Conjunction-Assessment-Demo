import { scenarios } from "../../lib/index.ts";

type ScenarioSelectorProps = {
  selectedIndex: number;
  onSelect: (index: number) => void;
};

export function ScenarioSelector({
  selectedIndex,
  onSelect,
}: ScenarioSelectorProps) {
  return (
    <div className="field-group">
      <label className="field-label" htmlFor="scenario-select">
        Load Scenario
      </label>
      <select
        id="scenario-select"
        value={selectedIndex}
        onChange={(e) => onSelect(Number(e.target.value))}
      >
        <option value={-1}>-- Select a scenario --</option>
        {scenarios.map((s, i) => (
          <option key={i} value={i}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}
