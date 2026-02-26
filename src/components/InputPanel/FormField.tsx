import type { ReactNode } from "react";
import type { UseFormReturn, ExtractFieldPaths } from "@railway-ts/use-form";
import { getError } from "./formUtils.ts";

type SmartProps<T extends Record<string, unknown>> = {
  form: UseFormReturn<T>;
  name: ExtractFieldPaths<T>;
  label: string;
  children: ReactNode;
  htmlFor?: never;
  error?: never;
};

type ManualProps = {
  htmlFor?: string;
  error?: string;
  label: string;
  children: ReactNode;
  form?: never;
  name?: never;
};

type FormFieldProps<T extends Record<string, unknown>> =
  | SmartProps<T>
  | ManualProps;

export function FormField<T extends Record<string, unknown>>(
  props: FormFieldProps<T>,
) {
  const { label, children } = props;
  const htmlFor = props.form
    ? props.form.getFieldId(props.name)
    : props.htmlFor;
  const error = props.form ? getError(props.form, props.name) : props.error;

  return (
    <div className="field-group">
      <label className="field-label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error && <div className="field-error">{error}</div>}
    </div>
  );
}
