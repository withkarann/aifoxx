// The site ships prerendered HTML, so the first client render of CRTOverlay
// must be identical to what the build server produced no matter what is in
// localStorage or which theme the visitor saved. If they diverge, React
// throws away the prerendered DOM and re-renders the whole page client side.
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { ReactElement } from "react";
import { act } from "react";
import { renderToString } from "react-dom/server";
import { hydrateRoot, type Root } from "react-dom/client";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CRTOverlay } from "./CRTOverlay";

const ui: ReactElement = (
  <ThemeProvider>
    <CRTOverlay />
  </ThemeProvider>
);

// Render the way the build server does: no window, no storage, no live DOM.
function renderServerHtml(element: ReactElement): string {
  vi.stubGlobal("window", undefined);
  try {
    return renderToString(element);
  } finally {
    vi.unstubAllGlobals();
  }
}

describe("CRTOverlay hydration", () => {
  let container: HTMLDivElement;
  let root: Root | undefined;
  let errors: string[];
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
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

  it("hydrates cleanly on a first visit with no stored preference", () => {
    container.innerHTML = renderServerHtml(ui);
    hydrate();
    expect(hydrationErrors()).toEqual([]);
  });

  it("hydrates cleanly when the visitor has switched the effect off", () => {
    localStorage.setItem("aifoxx-crt", "false");
    container.innerHTML = renderServerHtml(ui);
    hydrate();
    expect(hydrationErrors()).toEqual([]);
  });

  it("applies a stored off preference after mount", () => {
    localStorage.setItem("aifoxx-crt", "false");
    container.innerHTML = renderServerHtml(ui);
    hydrate();
    const button = container.querySelector("#crt-toggle");
    expect(button?.textContent).toContain("OFF");
    expect(container.querySelector(".animate-flicker")).toBeNull();
  });
});
