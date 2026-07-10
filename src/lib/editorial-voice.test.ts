import { describe, it, expect } from "vitest";
// This lint lives with the data scripts; the test rides along in src/ so vitest
// picks it up. It protects the promise that every trust report reads as
// customer-facing copy.
// @ts-expect-error -- plain .mjs module, no types
import { GUARD_RE, AUDIT_RE, findEditorialVoice } from "../../scripts/editorial-voice.mjs";

describe("editorial-voice GUARD_RE", () => {
  // Note-like phrasing that must never appear in published copy.
  const internal = [
    "QA CORRECTION (2026-06-27): entry wording updated.",
    "No public evidence; graded held=false pending a source.",
    "OVER-CLAIM RISK: the whitepaper could be read as company-wide.",
    "IDENTITY CONFLATION RISK: this slug could be confused with another vendor.",
    "Do not credit HIPAA to this vendor.",
    "Could not fully load the privacy page in this pass (fetch returned only headers/titles).",
    "Recommend a follow-up direct fetch before treating these as fully verified.",
    "This should be surfaced to buyers explicitly, not folded into a blanket claim.",
    "Treated as unconfirmed pending vendor confirmation.",
    "Directory must NOT present a blanket 'does not train on your data' claim.",
  ];
  for (const s of internal) {
    it(`flags internal voice: ${s.slice(0, 40)}...`, () => {
      expect(GUARD_RE.test(s)).toBe(true);
    });
  }

  // Genuine customer-facing copy that must never trip the lint.
  const clean = [
    "SOC 2 Type II audit covering May 1, 2023 to May 31, 2024.",
    "All data encrypted in transit via TLS 1.2 or greater and at rest with AES-256.",
    "Not to be confused with Bolt Financial, a separate company.",
    "Trains on customer content by default for non-Enterprise plans; opt-out available.",
    "Publishes an actively maintained subprocessor list with a dated change log.",
    "No self-host option; US-based company with documented cross-border transfer terms.",
    "SAML SSO and SCIM provisioning are available on the Enterprise tier.",
  ];
  for (const s of clean) {
    it(`passes clean copy: ${s.slice(0, 40)}...`, () => {
      expect(GUARD_RE.test(s)).toBe(false);
    });
  }
});

describe("findEditorialVoice", () => {
  it("returns a hit for a report with a note-like flag", () => {
    const report = {
      slug: "acme",
      flags: [
        "Trains on customer data by default; opt-out available.",
        "QA CORRECTION (2026-06-27): entry updated.",
      ],
      certifications: [{ name: "SOC 2", held: true, proof_quote: "SOC 2 Type II audit completed." }],
    };
    const hits = findEditorialVoice(report, GUARD_RE);
    expect(hits).toHaveLength(1);
    expect(hits[0].path).toBe("flags[1]");
  });

  it("returns no hits for a fully clean report", () => {
    const report = {
      slug: "acme",
      product_family: "Workflow automation platform.",
      flags: ["Trains on customer data by default; Enterprise is opted out."],
      certifications: [{ name: "SOC 2", held: true, proof_quote: "SOC 2 Type II audit completed." }],
      privacy: { ai_training_note: "Enterprise customers are automatically opted out." },
      security: [{ name: "Encryption", value: "TLS 1.2+ in transit, AES-256 at rest." }],
    };
    expect(findEditorialVoice(report, GUARD_RE)).toHaveLength(0);
  });

  it("AUDIT_RE is a superset of GUARD_RE", () => {
    const s = "OVER-CLAIM RISK: vendor over-claims ISO scope.";
    expect(GUARD_RE.test(s)).toBe(true);
    expect(AUDIT_RE.test(s)).toBe(true);
  });
});
