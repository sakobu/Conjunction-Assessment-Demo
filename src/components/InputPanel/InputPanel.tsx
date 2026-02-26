import type { UseFormReturn } from "@railway-ts/use-form";
import type { ConjunctionInput } from "../../lib/index.ts";
import { ScenarioSelector } from "./ScenarioSelector.tsx";
import { SpaceObjectFields } from "./SpaceObjectFields.tsx";
import { getError } from "./formUtils.ts";
import "./InputPanel.css";

type InputPanelProps = {
  form: UseFormReturn<ConjunctionInput>;
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
        />

        <SpaceObjectFields
          form={form}
          prefix="secondary"
          label="Secondary Object"
        />

        {getError(form, "secondary.id") ===
          "Primary and secondary must be different objects" && (
          <div className="field-error field-error--spaced">
            {getError(form, "secondary.id")}
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
