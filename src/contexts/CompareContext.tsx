import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

const MAX_COMPARE = 3;

interface CompareContextValue {
  selected: string[];
  isSelected: (slug: string) => boolean;
  toggle: (slug: string) => void;
  add: (slug: string) => void;
  remove: (slug: string) => void;
  clear: () => void;
  setSelected: (slugs: string[]) => void;
  isFull: boolean;
  max: number;
}

const CompareContext = createContext<CompareContextValue | undefined>(undefined);

/**
 * Holds the "compare tray": the slugs the user has marked to compare while
 * browsing. Deliberately in-memory only (no localStorage): the server and the
 * first client render both start empty, so there is no SSG hydration mismatch.
 * Durable sharing is handled by the /compare URL (?tools=…), not this tray.
 */
export function CompareProvider({ children }: { children: ReactNode }) {
  const [selected, setSelectedState] = useState<string[]>([]);

  const setSelected = useCallback((slugs: string[]) => {
    setSelectedState([...new Set(slugs)].slice(0, MAX_COMPARE));
  }, []);

  const add = useCallback((slug: string) => {
    setSelectedState((prev) =>
      prev.includes(slug) || prev.length >= MAX_COMPARE ? prev : [...prev, slug]
    );
  }, []);

  const remove = useCallback((slug: string) => {
    setSelectedState((prev) => prev.filter((s) => s !== slug));
  }, []);

  const toggle = useCallback((slug: string) => {
    setSelectedState((prev) =>
      prev.includes(slug)
        ? prev.filter((s) => s !== slug)
        : prev.length >= MAX_COMPARE
          ? prev
          : [...prev, slug]
    );
  }, []);

  const clear = useCallback(() => setSelectedState([]), []);

  const value = useMemo<CompareContextValue>(
    () => ({
      selected,
      isSelected: (slug) => selected.includes(slug),
      toggle,
      add,
      remove,
      clear,
      setSelected,
      isFull: selected.length >= MAX_COMPARE,
      max: MAX_COMPARE,
    }),
    [selected, toggle, add, remove, clear, setSelected]
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
}
