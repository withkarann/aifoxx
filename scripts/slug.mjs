// A tool slug is used as a URL segment and as a file name, so it must be
// lowercase letters and digits separated by single hyphens. Anything else
// (path separators, "..", uppercase, empty) is rejected.
export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidSlug(slug) {
  return typeof slug === 'string' && SLUG_RE.test(slug);
}

export function assertValidSlug(slug) {
  if (!isValidSlug(slug)) throw new Error(`invalid tool slug: ${JSON.stringify(slug)}`);
  return slug;
}
