import { useState } from "react";
import { hasToolIcon, toolIconUrl } from "@/lib/tool-icons";
import { isSafeHttpUrl } from "@/lib/utils";

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
  /**
   * Edge length in pixels the icon is drawn at, written onto the image so the
   * browser reserves the space before the file arrives and the surrounding text
   * does not jump. Match it to the className size.
   */
  size?: number;
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
  size = 32,
}: ToolIconProps) {
  void websiteUrl;
  const localIcon = slug && hasToolIcon(slug) ? toolIconUrl(slug) : null;
  const src = (isSafeHttpUrl(logoUrl) ? logoUrl : null) || localIcon || null;
  // Remember which image failed, so a failure never carries over to another
  // tool's icon when this component is reused for a different tool.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = failedSrc !== null && failedSrc === src;

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={`${name} logo`}
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setFailedSrc(src)}
        // An image that already failed before the page came to life never
        // fires onError, so check once when it is attached.
        ref={(el) => {
          if (el && el.complete && el.naturalWidth === 0 && failedSrc !== src) setFailedSrc(src);
        }}
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
