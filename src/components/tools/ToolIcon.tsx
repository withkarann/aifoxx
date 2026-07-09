import { useState } from "react";
import { hasToolIcon, toolIconUrl } from "@/lib/tool-icons";

interface ToolIconProps {
  /** Tool name. Its first letter is the fallback when no favicon loads. */
  name: string;
  /** Tool slug, used to resolve the locally hosted icon. */
  slug?: string;
  /** Optional explicit logo image URL; preferred over the local icon. */
  logoUrl?: string;
  /** Tool website URL. Kept for compatibility; no longer used for the icon. */
  websiteUrl?: string;
  /** Accent color for the letter-tile fallback glyph. */
  accent: string;
  /** Tailwind size + radius classes for the square icon (e.g. "w-8 h-8"). */
  className?: string;
  /** Font-size classes for the fallback letter. */
  letterClassName?: string;
}

/**
 * Square tool icon: shows the tool's real logo or website favicon, and falls
 * back to a single-letter tile if no image is available or the image fails to
 * load. The image reserves its box up front (fixed width/height) so swapping in
 * the favicon never shifts the layout around it.
 */
export function ToolIcon({
  name,
  slug,
  logoUrl,
  websiteUrl,
  accent,
  className = "w-8 h-8",
  letterClassName = "text-sm",
}: ToolIconProps) {
  void websiteUrl;
  const localIcon = slug && hasToolIcon(slug) ? toolIconUrl(slug) : null;
  const src = logoUrl || localIcon || null;
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={`${name} logo`}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={`${className} rounded-[4px] object-cover shrink-0 bg-bg-elevated`}
      />
    );
  }

  return (
    <div
      className={`${className} bg-bg-elevated border border-border-default rounded-[4px] flex items-center justify-center shrink-0`}
    >
      <span className={`font-display font-black ${letterClassName}`} style={{ color: accent }}>
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}
