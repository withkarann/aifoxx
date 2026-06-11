import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Theme = "dark" | "light" | "notebook";

const THEMES: Theme[] = ["dark", "light", "notebook"];

interface ThemeContextValue {
  theme: Theme;
  cycleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "aifoxx-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Starts on the same theme the prerendered HTML was built with; the saved
  // theme is applied after mount so the first client render always matches
  // the server markup.
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const storedTheme = localStorage.getItem(STORAGE_KEY) as Theme | "sepia" | null;
    if (storedTheme === "sepia") {
      // Reading the saved theme during render would make the first client
      // render differ from the prerendered HTML, so it must happen here even
      // though it costs one extra render on mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme("notebook");
    } else if (storedTheme && THEMES.includes(storedTheme as Theme)) {
      setTheme(storedTheme as Theme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const cycleTheme = useCallback(() => {
    setTheme((currentTheme) => {
      const currentIndex = THEMES.indexOf(currentTheme);
      return THEMES[(currentIndex + 1) % THEMES.length];
    });
  }, []);

  const value = useMemo(
    () => ({ theme, cycleTheme, setTheme }),
    [theme, cycleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
