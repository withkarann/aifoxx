/** Longest search the site will run. Longer input is cut, so a pasted or
 *  linked query can never make the page unresponsive. */
export const MAX_QUERY_LENGTH = 200;

/** Trim a search and cap it at MAX_QUERY_LENGTH characters. */
export function normalizeQuery(query: string | null | undefined): string {
  return (query ?? "").trim().slice(0, MAX_QUERY_LENGTH).trim();
}
