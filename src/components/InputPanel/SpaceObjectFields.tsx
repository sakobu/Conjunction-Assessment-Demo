import type { ConjunctionInput } from "../../lib/index.ts";
import type { UseFormReturn, ExtractFieldPaths } from "@railway-ts/use-form";
import { fromNullable, isSome } from "@railway-ts/pipelines/option";
import { getError } from "./formUtils.ts";
import { FormField } from "./FormField.tsx";
import "./SpaceObjectFields.css";

type SpaceObjectFieldsProps = {
  form: UseFormReturn<ConjunctionInput>;
  prefix: "primary" | "secondary";
  label: string;
};

export function SpaceObjectFields({
  form,
  prefix,
  label,
}: SpaceObjectFieldsProps) {
  const values = form.values[prefix];

  const covOption = fromNullable(values.covariance);
  const hasCovariance = isSome(covOption);

  return (
    <div className="panel__section">
      <div className={`panel__section-title panel__section-title--${prefix}`}>
        {label}
      </div>

      <FormField form={form} name={`${prefix}.id`} label="Object ID">
        <input type="text" {...form.getFieldProps(`${prefix}.id`)} />
      </FormField>

      <FormField form={form} name={`${prefix}.objectType`} label="Type">
        <select {...form.getSelectFieldProps(`${prefix}.objectType`)}>
          <option value="payload">Payload</option>
          <option value="debris">Debris</option>
          <option value="rocket_body">Rocket Body</option>
        </select>
      </FormField>

      <div className="field-group">
        <label className="field-label">Position (km) [X, Y, Z]</label>
        <div className="field-row">
          {([0, 1, 2] as const).map((i) => {
            const error = getError(form, `${prefix}.position.${i}`);
            return (
              <div key={i}>
                <input
                  type="number"
                  step="any"
                  {...form.getFieldProps(`${prefix}.position.${i}`)}
                />
                {error && <div className="field-error">{error}</div>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="field-group">
        <label className="field-label">Velocity (km/s) [X, Y, Z]</label>
        <div className="field-row">
          {([0, 1, 2] as const).map((i) => {
            const error = getError(form, `${prefix}.velocity.${i}`);
            return (
              <div key={i}>
                <input
                  type="number"
                  step="any"
                  {...form.getFieldProps(`${prefix}.velocity.${i}`)}
                />
                {error && <div className="field-error">{error}</div>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="field-group">
        <label className="field-label">
          <input
            type="checkbox"
            checked={hasCovariance}
            onChange={(e) =>
              form.setFieldValue(
                `${prefix}.covariance`,
                e.target.checked ? [0.05, 0.05, 0.05] : undefined,
              )
            }
            className="checkbox-gap"
          />
          Covariance 1-sigma (km)
        </label>
        {!hasCovariance &&
          getError(
            form,
            `${prefix}.covariance` as ExtractFieldPaths<ConjunctionInput>,
          ) && (
            <div className="field-error">
              {getError(
                form,
                `${prefix}.covariance` as ExtractFieldPaths<ConjunctionInput>,
              )}
            </div>
          )}
        {hasCovariance && (
          <div className="field-row field-row--covariance">
            {([0, 1, 2] as const).map((i) => {
              const error = getError(form, `${prefix}.covariance.${i}`);
              return (
                <div key={i}>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    {...form.getFieldProps(`${prefix}.covariance.${i}`)}
                  />
                  {error && <div className="field-error">{error}</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
