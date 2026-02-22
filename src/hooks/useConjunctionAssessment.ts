import { useState, useCallback } from "react";
import { useForm } from "@railway-ts/use-form";
import { pipe } from "@railway-ts/pipelines/composition";
import { match, tapWith } from "@railway-ts/pipelines/result";
import { validate } from "@railway-ts/pipelines/schema";
import {
  conjunctionInputSchema,
  assessConjunction,
  scenarios,
  type ConjunctionInput,
  type ManeuverRecommendation,
  type AssessError,
} from "../lib/index.ts";

type ResultState =
  | { status: "idle" }
  | { status: "success"; data: ManeuverRecommendation }
  | { status: "error"; error: AssessError };

const initialValues: ConjunctionInput = {
  primary: {
    id: "1",
    objectType: "payload",
    position: [0, 0, 0],
    velocity: [0, 0, 0],
  },
  secondary: {
    id: "2",
    objectType: "debris",
    position: [0, 0, 0],
    velocity: [0, 0, 0],
  },
};

export function useConjunctionAssessment() {
  const [result, setResult] = useState<ResultState>({ status: "idle" });
  const [liveValues, setLiveValues] = useState<ConjunctionInput>(initialValues);
  const [selectedScenario, setSelectedScenario] = useState<number>(-1);

  const form = useForm<ConjunctionInput>(conjunctionInputSchema, {
    initialValues,
    onValuesChange: (values) => {
      pipe(validate(values, conjunctionInputSchema), tapWith(setLiveValues));
    },
    onSubmit: (values) => {
      match(pipe(values, assessConjunction), {
        ok: (rec: ManeuverRecommendation) =>
          setResult({ status: "success", data: rec }),
        err: (error: AssessError) => setResult({ status: "error", error }),
      });
    },
  });

  const loadScenario = useCallback(
    (index: number) => {
      setSelectedScenario(index);
      if (index >= 0 && index < scenarios.length) {
        const input = scenarios[index].input;
        form.resetForm();
        form.setValues(input);
        setResult({ status: "idle" });
      }
    },
    [form],
  );

  return {
    form,
    result,
    liveValues,
    selectedScenario,
    loadScenario,
  };
}
