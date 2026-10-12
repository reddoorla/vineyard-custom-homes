import { isFilled, type ImageField } from "@prismicio/client";

export function withFallbackAlt<Field extends ImageField>(field: Field, fallback: string): Field {
  if (!fallback.trim()) throw new Error("withFallbackAlt needs a non-empty fallback");
  if (!isFilled.image(field) || field.alt?.trim()) return field;
  return { ...field, alt: fallback };
}
