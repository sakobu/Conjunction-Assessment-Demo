import type { UseFormReturn, ExtractFieldPaths } from "@railway-ts/use-form";

export function getError<T extends Record<string, unknown>>(
  form: UseFormReturn<T>,
  field: ExtractFieldPaths<T>,
): string | undefined {
  const key = (field as string).replace(/\.(\d+)/g, "[$1]");
  return form.errors[key] || undefined;
}
