import type { ZodType } from "zod";

/**
 * The validator configuration every form uses.
 *
 * TanStack Form stores a validator's error under the key of that validator
 * and only replaces it when the SAME validator runs again. A form-level
 * `onSubmit` schema therefore leaves its error on screen after the user has
 * fixed the field — it is cleared only by the next submit.
 *
 * Validating on change clears the error as soon as the value is valid
 * again. A submit runs the change validator as well, so an invalid form is
 * still blocked and the error still shows on the first submit.
 *
 * Cross-field rules belong in the schema with a `path`, so they show up on
 * the field they belong to.
 */
export function validateOnChange<T extends ZodType>(schema: T) {
  return { onChange: schema };
}
