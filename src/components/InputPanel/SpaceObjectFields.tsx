import type { ConjunctionInput } from "../../lib/index.ts";
import type { UseFormReturn, ExtractFieldPaths } from "@railway-ts/use-form";
import { fromNullable, isSome } from "@railway-ts/pipelines/option";
import "./SpaceObjectFields.css";

type FormInstance = UseFormReturn<ConjunctionInput>;

function getError<T extends Record<string, unknown>>(
  form: UseFormReturn<T>,
  field: ExtractFieldPaths<T>,
): string | undefined {
  const key = (field as string).replace(/\.(\d+)/g, "[$1]");
  return form.errors[key] || undefined;
}

type SpaceObjectFieldsProps = {
  form: FormInstance;
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

      <div className="field-group">
        <label className="field-label">Object ID</label>
        <input type="text" {...form.getFieldProps(`${prefix}.id`)} />
        {form.errors[`${prefix}.id`] && (
          <div className="field-error">{form.errors[`${prefix}.id`]}</div>
        )}
      </div>

      <div className="field-group">
        <label className="field-label">Type</label>
        <select {...form.getSelectFieldProps(`${prefix}.objectType`)}>
          <option value="payload">Payload</option>
          <option value="debris">Debris</option>
          <option value="rocket_body">Rocket Body</option>
        </select>
      </div>

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
