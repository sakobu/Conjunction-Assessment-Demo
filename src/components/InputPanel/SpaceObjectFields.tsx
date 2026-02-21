import type { ConjunctionInput, Vec3 } from "../../lib/index.ts";
import type { useForm } from "@railway-ts/use-form";

type FormInstance = ReturnType<typeof useForm<ConjunctionInput>>;

type SpaceObjectFieldsProps = {
  form: FormInstance;
  prefix: "primary" | "secondary";
  label: string;
  color: string;
};

export function SpaceObjectFields({
  form,
  prefix,
  label,
  color,
}: SpaceObjectFieldsProps) {
  const values = form.values[prefix];

  const setTupleValue = (
    field: "position" | "velocity" | "covariance",
    index: number,
    raw: string,
  ) => {
    const current = [...((values[field] ?? [0, 0, 0]) as Vec3)];
    current[index] = raw as unknown as number; // parseNumber() handles coercion at validation
    form.setFieldValue(`${prefix}.${field}`, current);
  };

  const hasCovariance = values.covariance !== undefined;
  const covValues = (values.covariance ?? [0, 0, 0]) as Vec3;

  return (
    <div className="panel__section">
      <div
        className="panel__section-title panel__section-title--object"
        style={{ '--obj-color': color } as React.CSSProperties}
      >
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
          {[0, 1, 2].map((i) => (
            <div key={i}>
              <input
                type="number"
                step="any"
                value={values.position[i]}
                onChange={(e) => setTupleValue("position", i, e.target.value)}
              />
              {form.errors[`${prefix}.position[${i}]`] && (
                <div className="field-error">
                  {form.errors[`${prefix}.position[${i}]`]}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="field-group">
        <label className="field-label">Velocity (km/s) [X, Y, Z]</label>
        <div className="field-row">
          {[0, 1, 2].map((i) => (
            <div key={i}>
              <input
                type="number"
                step="any"
                value={values.velocity[i]}
                onChange={(e) => setTupleValue("velocity", i, e.target.value)}
              />
              {form.errors[`${prefix}.velocity[${i}]`] && (
                <div className="field-error">
                  {form.errors[`${prefix}.velocity[${i}]`]}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="field-group">
        <label className="field-label">
          <input
            type="checkbox"
            checked={hasCovariance}
            onChange={(e) => {
              if (e.target.checked) {
                form.setFieldValue(`${prefix}.covariance`, [0.05, 0.05, 0.05]);
              } else {
                form.setFieldValue(`${prefix}.covariance`, undefined);
              }
            }}
            className="checkbox-gap"
          />
          Covariance 1-sigma (km)
        </label>
        {hasCovariance && (
          <div className="field-row field-row--covariance">
            {[0, 1, 2].map((i) => (
              <div key={i}>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={covValues[i]}
                  onChange={(e) =>
                    setTupleValue("covariance", i, e.target.value)
                  }
                />
                {form.errors[`${prefix}.covariance[${i}]`] && (
                  <div className="field-error">
                    {form.errors[`${prefix}.covariance[${i}]`]}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
