import { describe, it, expect } from "vitest";
import { isStaleDeployError } from "./stale-deploy";

describe("isStaleDeployError", () => {
  it("matches the manifest-404 JSON parse error", () => {
    // What the browser throws when a stale loader-data manifest 404s and the
    // HTML error page is fed to response.json().
    const err = new SyntaxError('Unexpected token \'T\', "The page c"... is not valid JSON');
    expect(isStaleDeployError(err)).toBe(true);
  });

  it("matches a failed dynamic import after a deploy", () => {
    const err = new TypeError("Failed to fetch dynamically imported module: https://aifoxx.com/assets/x.js");
    expect(isStaleDeployError(err)).toBe(true);
  });

  it("matches a failed module script import", () => {
    const err = new Error("Importing a module script failed.");
    expect(isStaleDeployError(err)).toBe(true);
  });

  it("does not match an ordinary application error", () => {
    expect(isStaleDeployError(new Error("Cannot read properties of undefined"))).toBe(false);
  });

  it("is safe on non-Error values", () => {
    expect(isStaleDeployError(null)).toBe(false);
    expect(isStaleDeployError("just a string")).toBe(false);
  });
});
