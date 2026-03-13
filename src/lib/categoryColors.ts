import colorMap from "@/data/categoryColors.json";

export interface CategoryColor {
  label:  string;
  accent: string;
  bg:     string;
  border: string;
  glow:   string;
  text:   string;
  emoji:  string;
}

const map = colorMap as Record<string, CategoryColor>;

export function getCategoryColor(category: string): CategoryColor {
  return map[category] ?? map["__default__"];
}

export function getAllCategoryColors(): Record<string, CategoryColor> {
  const { __default__: _, ...rest } = map;
  return rest;
}

export function getCategoryVars(category: string): React.CSSProperties {
  const c = getCategoryColor(category);
  return {
    "--cat-accent":  c.accent,
    "--cat-bg":      c.bg,
    "--cat-border":  c.border,
    "--cat-glow":    c.glow,
    "--cat-text":    c.text,
  } as React.CSSProperties;
}
