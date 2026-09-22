import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";

const STORAGE_KEY = "aifoxx-crt";

// Browsers that block site storage throw on any access. The toggle then still
// works for the visit, it just is not remembered.
function readSetting(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function saveSetting(value: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    // Not remembered, see readSetting.
  }
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
}

export function CRTOverlay() {
  const { theme } = useTheme();
  // The first client render must match the prerendered HTML exactly, so the
  // stored preference and live theme are applied after mount, never during
  // the initial render.
  const [mounted, setMounted] = useState(false);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const stored = readSetting();
    if (stored !== null) {
      setEnabled(stored !== "false");
    }
    setMounted(true);
  }, []);

  // Visitors who never used the toggle follow the theme: scanlines on for the
  // dark theme, off otherwise.
  useEffect(() => {
    if (readSetting() === null) {
      // Visitors who ask for reduced motion never get the flickering overlay by default.
      setEnabled(theme === "dark" && !prefersReducedMotion());
    }
  }, [theme]);

  const toggle = () => {
    setEnabled((value) => {
      const next = !value;
      saveSetting(next);
      return next;
    });
  };

  const showMovingScanline = enabled && theme === "dark";
  const overlayStyle = theme === "light"
    ? {
        background: "repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(93, 104, 120, 0.028) 3px, rgba(93, 104, 120, 0.028) 4px)",
        backgroundSize: "100% 4px",
        opacity: 0.45,
      }
    : theme === "notebook"
    ? {
        background: "repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(92, 72, 41, 0.035) 3px, rgba(92, 72, 41, 0.035) 4px)",
        backgroundSize: "100% 4px",
        opacity: 0.35,
      }
    : {
        background: "repeating-linear-gradient(0deg, transparent 0px, transparent 1px, rgba(0,0,0,0.05) 1px, rgba(0,0,0,0.05) 2px)",
        backgroundSize: "100% 2px",
      };

  return (
    <>
      {mounted && enabled && (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
          <div className="absolute inset-0 animate-flicker" style={overlayStyle} />
          {showMovingScanline && (
            <div
              className="absolute left-0 w-full h-[3px] bg-white/5 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
              style={{ animation: "scanline 10s linear infinite" }}
            />
          )}
        </div>
      )}
      <button
        id="crt-toggle"
        type="button"
        onClick={toggle}
        aria-pressed={enabled}
        className="font-mono text-[10px] uppercase tracking-tighter text-text-muted hover:text-accent-green transition-colors duration-150"
      >
        CRT {enabled ? "ON" : "OFF"}
      </button>
    </>
  );
}
