import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** True only for absolute http(s) URLs. Use before assigning to an href to
 *  block javascript:/data:/file: XSS vectors from untrusted/community data. */
export function isSafeHttpUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  try {
    const protocol = new URL(url).protocol;
    return protocol === "https:" || protocol === "http:";
  } catch {
    return false;
  }
}

/** Extract the bare hostname (no leading www.) from a URL, or null if it can't
 *  be parsed. Used to build a tool's favicon URL from its website link. */
export function getHostFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/** Google's favicon service URL for a site host, sized for crisp display on
 *  retina screens. Returns null when the host can't be derived. */
export function getFaviconUrl(url: string | null | undefined, size = 64): string | null {
  const host = getHostFromUrl(url);
  return host ? `https://www.google.com/s2/favicons?domain=${host}&sz=${size}` : null;
}
