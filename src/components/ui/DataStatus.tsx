import Brand from "@/lib/brand";

interface DataStatusProps {
  value: unknown;
  type?: "badge" | "inline" | "block";
}

function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined || value === "") return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === "object" && !Array.isArray(value) && Object.keys(value as object).length === 0) return true;
  return false;
}

export function DataStatus({ value, type = "badge" }: DataStatusProps) {
  if (!isEmpty(value)) return null;

  if (type === "inline") {
    return (
      <span className="font-mono text-xs text-[var(--text-muted)] italic">
        Not available yet
      </span>
    );
  }

  if (type === "block") {
    return (
      <div className="border border-dashed border-[var(--border-dim)] rounded-[6px] p-4 text-center font-mono">
        <p className="text-xs text-[var(--text-muted)]">// DATA NOT AVAILABLE YET</p>
        <p className="text-[10px] text-[var(--text-muted)] mt-1 opacity-60">
          Help us —{" "}
          <a href={Brand.product.repo} target="_blank" rel="noopener noreferrer" className="text-[var(--accent-blue)]">
            contribute via GitHub ↗
          </a>
        </p>
      </div>
    );
  }

  return (
    <span className="font-mono text-sm text-[var(--text-muted)]">—</span>
  );
}
