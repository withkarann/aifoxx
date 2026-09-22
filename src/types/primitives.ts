import { z } from "zod";

// Shared validation primitive: an absolute http(s) URL. Rejects javascript:,
// data:, file:, etc. so a malicious community-contributed URL can never become
// an XSS vector when rendered into an href. Render sites should STILL guard with
// isSafeHttpUrl (defense in depth).
export const HttpUrl = z
  .string()
  .url()
  .refine(
    (u) => {
      try {
        const protocol = new URL(u).protocol;
        return protocol === "https:" || protocol === "http:";
      } catch {
        return false;
      }
    },
    { message: "Only http(s) URLs are allowed" }
  );

// Shared validation primitive: a tool slug. It becomes both a URL segment and a
// file name, so only lowercase letters and digits joined by single hyphens are
// allowed. Keep in sync with scripts/slug.mjs.
export const Slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase letters and digits joined by single hyphens");
