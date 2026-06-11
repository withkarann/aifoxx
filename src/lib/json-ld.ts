/**
 * Serialize a schema.org object for embedding inside an inline
 * <script type="application/ld+json"> tag. JSON.stringify leaves "<",
 * U+2028, and U+2029 unescaped, so a value containing "</script>" would
 * end the script block early and inject markup into the page. Escaping
 * them as \uXXXX keeps the payload valid JSON and inert as HTML.
 */
export function serializeJsonLd(schema: Record<string, unknown>): string {
  return JSON.stringify(schema)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
