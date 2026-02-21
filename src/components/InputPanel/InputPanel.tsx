import type { useConjunctionAssessment } from "../../hooks/useConjunctionAssessment.ts";
import { ScenarioSelector } from "./ScenarioSelector.tsx";
import { SpaceObjectFields } from "./SpaceObjectFields.tsx";

type InputPanelProps = {
  form: ReturnType<typeof useConjunctionAssessment>["form"];
  selectedScenario: number;
  loadScenario: (index: number) => void;
};

export function InputPanel({
  form,
  selectedScenario,
  loadScenario,
}: InputPanelProps) {
  return (
    <div className="panel panel--left">
      <ScenarioSelector
        selectedIndex={selectedScenario}
        onSelect={loadScenario}
      />

      <form onSubmit={(e) => void form.handleSubmit(e)}>
        <SpaceObjectFields
          form={form}
          prefix="primary"
          label="Primary Object"
          color="var(--obj-primary)"
        />

        <SpaceObjectFields
          form={form}
          prefix="secondary"
          label="Secondary Object"
          color="var(--obj-secondary)"
        />

        {form.errors["secondary.id"] === "Primary and secondary must be different objects" && (
          <div className="field-error field-error--spaced">
            {form.errors["secondary.id"]}
          </div>
        )}

        <button
          type="submit"
          className="btn btn--primary"
          disabled={form.isSubmitting}
        >
          {form.isSubmitting ? "Assessing..." : "Assess Conjunction"}
        </button>
      </form>
    </div>
  );
}
