import { describe, it, expect } from "vitest";
import { trustProductName, trustOperator } from "@/lib/trust-name";
import { TRUST_SLUGS } from "@/lib/trust";
import trustIndex from "@/data/trust-index.json";
import type { TrustIndexEntry } from "@/types/trust";

const entries = trustIndex as TrustIndexEntry[];

describe("trustProductName", () => {
  it("names the product rather than the legal entity that owns it", () => {
    expect(trustProductName("power-bi", "Microsoft Corporation")).toBe("Power BI");
  });

  it("falls back to the vendor when the slug has no catalog entry", () => {
    expect(trustProductName("not-a-real-slug", "Acme Inc.")).toBe("Acme Inc.");
  });

  it("gives every trust report a distinct name", () => {
    const names = entries.map((e) => trustProductName(e.slug, e.vendor));
    const duplicates = names.filter((n, i) => names.indexOf(n) !== i);
    expect(duplicates).toEqual([]);
  });

  it("covers every published trust slug", () => {
    for (const slug of TRUST_SLUGS) {
      expect(trustProductName(slug, "fallback").length).toBeGreaterThan(0);
    }
  });
});

describe("trustOperator", () => {
  it("credits the operator when it is a different name from the product", () => {
    expect(trustOperator("Power BI", "Microsoft Corporation")).toBe("Microsoft Corporation");
  });

  it("stays silent when the vendor is the product plus legal wording", () => {
    expect(trustOperator("Ably", "Ably Realtime (UK Limited)")).toBeUndefined();
    expect(trustOperator("Abnormal AI", "Abnormal AI, Inc.")).toBeUndefined();
    expect(trustOperator("Ada Health", "Ada Health GmbH")).toBeUndefined();
  });

  it("ignores punctuation and case when comparing", () => {
    expect(trustOperator("Notion", "notion labs, inc.")).toBeUndefined();
  });
});
