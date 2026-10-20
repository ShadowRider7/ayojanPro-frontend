/**
 * True when the value is an `http`/`https` URL.
 *
 * User-supplied links are rendered as anchors, so a `javascript:` or `data:`
 * URL must never be accepted.
 */
export function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
