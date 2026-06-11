// The theme value handed out during the first client render must equal the
// value the build server used ("dark"), no matter which theme the visitor
// saved. Components render different DOM per theme (icons, overlays), so a
// differing first render makes React discard the prerendered page.
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { ReactElement } from "react";
import { act } from "react";
import { renderToString } from "react-dom/server";
import { hydrateRoot, type Root } from "react-dom/client";
import { ThemeProvider, useTheme } from "./ThemeContext";

// Renders structurally different elements per theme, the way the navigation
// theme toggle swaps icons.
function ThemeProbe() {
  const { theme } = useTheme();
  return theme === "dark" ? <span data-probe="dark">dark</span> : <i data-probe={theme}>{theme}</i>;
}

const ui: ReactElement = (
  <ThemeProvider>
    <ThemeProbe />
  </ThemeProvider>
);

function renderServerHtml(element: ReactElement): string {
  vi.stubGlobal("window", undefined);
  try {
    return renderToString(element);
  } finally {
    vi.unstubAllGlobals();
  }
}

describe("ThemeProvider hydration", () => {
  let container: HTMLDivElement;
  let root: Root | undefined;
  let errors: string[];
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    localStorage.clear();
    container = document.createElement("div");
    document.body.appendChild(container);
    errors = [];
    errorSpy = vi.spyOn(console, "error").mockImplementation((...args) => {
      errors.push(args.map(String).join(" "));
    });
  });

  afterEach(() => {
    if (root) act(() => root!.unmount());
    root = undefined;
    container.remove();
    errorSpy.mockRestore();
    localStorage.clear();
  });

  function hydrate(): void {
    act(() => {
      root = hydrateRoot(container, ui);
    });
  }

  function hydrationErrors(): string[] {
    return errors.filter((e) => /hydrat|server HTML|did not match/i.test(e));
  }

  it("hydrates cleanly when the visitor saved the light theme", () => {
    localStorage.setItem("aifoxx-theme", "light");
    container.innerHTML = renderServerHtml(ui);
    hydrate();
    expect(hydrationErrors()).toEqual([]);
  });

  it("applies the saved theme after mount", () => {
    localStorage.setItem("aifoxx-theme", "light");
    container.innerHTML = renderServerHtml(ui);
    hydrate();
    expect(container.querySelector('[data-probe="light"]')).not.toBeNull();
  });
});
