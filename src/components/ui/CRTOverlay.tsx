import { useState, useEffect } from "react";

const STORAGE_KEY = "toolsai-crt";

export function CRTOverlay() {
  const [enabled, setEnabled] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored !== "false";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(enabled));
  }, [enabled]);

  return (
    <>
      {enabled && (
        <div className="fixed inset-0 pointer-events-none z-[9999]">
          <div
            className="absolute inset-0"
            style={{
              background: "repeating-linear-gradient(0deg, transparent 0px, transparent 1px, rgba(0,0,0,0.05) 1px, rgba(0,0,0,0.05) 2px)",
              backgroundSize: "100% 2px",
            }}
          />
          <div
            className="absolute left-0 w-full h-[2px] bg-white/5"
            style={{ animation: "scanline 8s linear infinite" }}
          />
        </div>
      )}
      <button
        onClick={() => setEnabled((v) => !v)}
        className="fixed bottom-4 right-4 z-[10000] font-mono text-xs px-2 py-1 rounded-[4px] border border-border-default bg-bg-surface text-text-muted hover:text-text-primary hover:shadow-glow transition-all duration-150"
      >
        CRT {enabled ? "ON" : "OFF"}
      </button>
    </>
  );
}
