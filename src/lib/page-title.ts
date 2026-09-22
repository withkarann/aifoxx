/** Search results show roughly this many characters of a page title. */
export const TITLE_LIMIT = 60;

/**
 * The first title that fits in search results, longest and most specific
 * first. Falls back to the last (shortest) option when none fits.
 */
export function fitTitle(options: string[], limit = TITLE_LIMIT): string {
  return options.find((t) => t.length <= limit) ?? options[options.length - 1];
}
