/**
 * Page-number items for a truncated pagination control: the first and last
 * page always show, the current page keeps one neighbor on each side, and an
 * "ellipsis" marker stands in for any skipped stretch. Seven pages or fewer
 * all fit, so nothing is truncated.
 */
export type PageItem = number | "ellipsis";

export function paginationItems(current: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const items: PageItem[] = [1];
  const left = Math.max(2, current - 1);
  const right = Math.min(totalPages - 1, current + 1);

  if (left > 2) items.push("ellipsis");
  for (let page = left; page <= right; page++) items.push(page);
  if (right < totalPages - 1) items.push("ellipsis");

  items.push(totalPages);
  return items;
}
