import { type ReactNode } from "react";
import { X, ExternalLink } from "lucide-react";
import type { Tool } from "@/types/tool";
import { PricingBadge } from "@/components/tools/PricingBadge";
import { getCategoryColor } from "@/lib/categoryColors";
import { getTrustBadges } from "@/lib/trust-badges";
import { complianceKeys, type CanonicalCertKey } from "@/lib/trust";

// Resolve compliance + data-handling from the verified trust assessment (the
// same source as the /trust report), falling back to legacy tool fields only
// when a tool has no assessment. The assessment positively asserts HELD certs,
// so an unconfirmed canonical cert reads as "n/a", never a false "No".
function certValue(tool: Tool, key: CanonicalCertKey): boolean | null {
  const b = getTrustBadges(tool.slug);
  if (b) return complianceKeys(b.certs, b.dpa).has(key) ? true : null;
  return tool.compliance?.[key] ?? null;
}
function trainsValue(tool: Tool): boolean | null {
  const b = getTrustBadges(tool.slug);
  if (b) return b.trains;
  return tool.data_storage?.trains_on_data ?? null;
}
function regionValue(tool: Tool): string {
  const b = getTrustBadges(tool.slug);
  if (b && b.data_region) return b.data_region;
  return tool.data_storage?.region ?? "";
}
function selfHostValue(tool: Tool): boolean | null {
  const b = getTrustBadges(tool.slug);
  if (b) return b.self_hostable;
  return tool.data_storage?.self_hostable ?? null;
}

// ── value renderers ─────────────────────────────────────────────────────────
function text(value: string | null | undefined): ReactNode {
  return value ? (
    <span className="font-mono text-xs text-text-primary break-words">{value}</span>
  ) : (
    <span className="font-mono text-xs text-text-muted">n/a</span>
  );
}

function complianceDot(value: boolean | null | undefined): ReactNode {
  if (value === true) {
    return (
      <span className="inline-flex items-center gap-1 font-mono text-xs text-accent-green">
        <span className="text-[10px]">●</span> Yes
      </span>
    );
  }
  if (value === false) {
    return <span className="font-mono text-xs text-text-secondary"><span className="text-[10px]">○</span> No</span>;
  }
  return <span className="font-mono text-xs text-text-muted">n/a</span>;
}

function yesNo(value: boolean | null | undefined): ReactNode {
  if (value === true) return <span className="font-mono text-xs text-accent-green">Yes</span>;
  if (value === false) return <span className="font-mono text-xs text-text-secondary">No</span>;
  return <span className="font-mono text-xs text-text-muted">n/a</span>;
}

function accessList(tool: Tool): ReactNode {
  const methods = tool.access_methods ?? [];
  if (methods.length === 0) return <span className="font-mono text-xs text-text-muted">n/a</span>;
  return <span className="font-mono text-xs text-text-secondary break-words">{methods.join(" · ")}</span>;
}

// ── attribute table definition (shared by mobile + desktop) ──────────────────
interface Attribute {
  label: string;
  get: (tool: Tool) => ReactNode;
  /** Normalised string used to detect whether tools differ on this attribute. */
  key: (tool: Tool) => string;
}

const ATTRIBUTES: Attribute[] = [
  { label: "Pricing", get: (t) => <PricingBadge pricing={t.pricing} />, key: (t) => t.pricing },
  { label: "Free Tier", get: (t) => text(t.pricing_detail?.free_tier), key: (t) => t.pricing_detail?.free_tier ?? "" },
  { label: "Paid Plans", get: (t) => text(t.pricing_detail?.paid_plans), key: (t) => t.pricing_detail?.paid_plans ?? "" },
  { label: "API Cost", get: (t) => text(t.pricing_detail?.api_cost), key: (t) => t.pricing_detail?.api_cost ?? "" },
  { label: "Access", get: (t) => accessList(t), key: (t) => [...(t.access_methods ?? [])].sort().join(",") },
  { label: "SOC 2", get: (t) => complianceDot(certValue(t, "soc2")), key: (t) => String(certValue(t, "soc2")) },
  { label: "ISO 27001", get: (t) => complianceDot(certValue(t, "iso27001")), key: (t) => String(certValue(t, "iso27001")) },
  { label: "GDPR", get: (t) => complianceDot(certValue(t, "gdpr")), key: (t) => String(certValue(t, "gdpr")) },
  { label: "HIPAA", get: (t) => complianceDot(certValue(t, "hipaa")), key: (t) => String(certValue(t, "hipaa")) },
  { label: "Data Region", get: (t) => text(regionValue(t)), key: (t) => regionValue(t) },
  { label: "Trains on Data", get: (t) => yesNo(trainsValue(t)), key: (t) => String(trainsValue(t)) },
  { label: "Self-hostable", get: (t) => yesNo(selfHostValue(t)), key: (t) => String(selfHostValue(t)) },
  { label: "Category", get: (t) => text(t.category), key: (t) => t.category },
  { label: "Subcategory", get: (t) => text(t.subcategory), key: (t) => t.subcategory },
];

function attributeDiffers(attr: Attribute, tools: Tool[]): boolean {
  if (tools.length < 2) return false;
  return new Set(tools.map(attr.key)).size > 1;
}

// ── tool column header (logo · name · [remove] · open) ───────────────────────
function ToolHeader({ tool, onRemove }: { tool: Tool; onRemove?: (slug: string) => void }) {
  const color = getCategoryColor(tool.category);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        {tool.logo_url ? (
          <img
            src={tool.logo_url}
            alt=""
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            className="w-7 h-7 rounded-[4px] object-cover shrink-0"
          />
        ) : (
          <div className="w-7 h-7 bg-bg-elevated border border-border-default rounded-[4px] flex items-center justify-center shrink-0">
            <span className="font-display font-black text-xs" style={{ color: color.accent }}>{tool.name.charAt(0)}</span>
          </div>
        )}
        <span className="font-display font-black text-sm text-text-primary truncate min-w-0 flex-1">{tool.name}</span>
        {onRemove && (
          <button
            type="button"
            onClick={() => onRemove(tool.slug)}
            aria-label={`Remove ${tool.name} from comparison`}
            className="shrink-0 text-text-muted hover:text-accent-red transition-colors duration-150 min-h-[24px] min-w-[24px] flex items-center justify-center"
          >
            <X size={14} />
          </button>
        )}
      </div>
      <a
        href={tool.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 font-mono text-[10px] hover:underline"
        style={{ color: color.accent }}
      >
        Open <ExternalLink size={10} />
      </a>
    </div>
  );
}

interface ComparisonViewProps {
  tools: Tool[];
  /** When provided, each tool shows a remove control. Omit for read-only (e.g. SEO vs-pages). */
  onRemove?: (slug: string) => void;
}

/**
 * Read-only side-by-side comparison: a table on desktop, stacked-by-attribute on
 * mobile (no horizontal scroll). Rows where the tools differ are highlighted.
 */
export function ComparisonView({ tools, onRemove }: ComparisonViewProps) {
  return (
    <>
      {/* ── Desktop: side-by-side table ── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="w-44 text-left p-3 font-mono text-xs text-text-muted tracking-widest align-bottom">
                // ATTRIBUTE
              </th>
              {tools.map((t) => (
                <th key={t.slug} className="p-3 text-left align-top min-w-[200px]">
                  <ToolHeader tool={t} onRemove={onRemove} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ATTRIBUTES.map((attr) => {
              const diff = attributeDiffers(attr, tools);
              return (
                <tr key={attr.label} className={diff ? "bg-accent-amber/5" : ""}>
                  <td className="p-3 border-t border-border-dim align-top font-mono text-xs text-text-muted">
                    {attr.label}
                    {diff && <span className="ml-1 text-accent-amber" title="Tools differ here">▲</span>}
                  </td>
                  {tools.map((t) => (
                    <td key={t.slug} className="p-3 border-t border-border-dim align-top">
                      {attr.get(t)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Mobile: stacked by attribute ── */}
      <div className="md:hidden space-y-4">
        {/* who's being compared */}
        <div className="flex flex-wrap gap-2">
          {tools.map((t) => (
            <span
              key={t.slug}
              className="inline-flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded-[4px] bg-bg-surface border border-border-default text-text-primary"
            >
              {t.name}
              {onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(t.slug)}
                  aria-label={`Remove ${t.name} from comparison`}
                  className="text-text-muted hover:text-accent-red min-h-[24px] min-w-[24px] flex items-center justify-center -mr-1"
                >
                  <X size={12} />
                </button>
              )}
            </span>
          ))}
        </div>

        {ATTRIBUTES.map((attr) => {
          const diff = attributeDiffers(attr, tools);
          return (
            <div
              key={attr.label}
              className={`rounded-[6px] p-3 border ${diff ? "border-accent-amber/40 bg-accent-amber/5" : "border-border-default bg-bg-surface"}`}
            >
              <p className="font-mono text-xs text-text-muted tracking-widest mb-2">
                // {attr.label}
                {diff && <span className="ml-1 text-accent-amber">▲ differ</span>}
              </p>
              <div className="space-y-1.5">
                {tools.map((t) => (
                  <div key={t.slug} className="flex items-start gap-3">
                    <span className="font-mono text-xs text-text-secondary w-20 shrink-0 truncate">{t.name}</span>
                    <span className="flex-1 text-right min-w-0 break-words">{attr.get(t)}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
