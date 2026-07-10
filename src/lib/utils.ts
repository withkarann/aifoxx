import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** True only for absolute http(s) URLs. Use before assigning to an href to
 *  block javascript:/data:/file: XSS vectors from untrusted/community data.
 *
 *  Must return the SAME result in Node (used to pre-render pages at build time)
 *  and in the browser. Their URL parsers disagree on strings that contain
 *  whitespace: e.g. "https://x.com (note)" throws in Node but parses in the
 *  browser. Left unguarded, that renders a link on only one side and breaks
 *  hydration on the pre-rendered pages. A real href never contains raw
 *  whitespace, so reject those the same way in both environments first. */
export function isSafeHttpUrl(url: string | null | undefined): url is string {
  if (typeof url !== "string" || url === "" || /\s/.test(url)) return false;
  try {
    const protocol = new URL(url).protocol;
    return protocol === "https:" || protocol === "http:";
  } catch {
    return false;
  }
}
