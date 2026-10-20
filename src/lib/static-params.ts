/**
 * The params a dynamic route exports under in a static build.
 *
 * A static export has no server to render the route on demand, and Next.js
 * rejects a `generateStaticParams()` that returns an empty array:
 * "With `output: export`, at least one route must be generated."
 *
 * The placeholder gives the route one path to be exported under. The real id
 * arrives on the client, so the page then renders for any id.
 *
 * ```ts
 * export function generateStaticParams() {
 *   return staticExportParams("eventId");
 * }
 * ```
 */
export function staticExportParams<K extends string>(
  ...keys: K[]
): Record<K, string>[] {
  return [
    Object.fromEntries(keys.map((key) => [key, "placeholder"])) as Record<
      K,
      string
    >,
  ];
}
