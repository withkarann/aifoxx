import { describe, it, expect } from "vitest";
// This lint lives with the data scripts; the test rides along in src/ so vitest
// picks it up. It protects the promise that every trust report reads as
// customer-facing copy.
// @ts-expect-error -- plain .mjs module, no types
import { GUARD_RE, AUDIT_RE, findEditorialVoice, findBannedDashes } from "../../scripts/editorial-voice.mjs";

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

describe("flag label prefixes", () => {
  // A "What to watch" entry must read as a sentence, never as a coded label.
  const labeled = [
    "CERT-SCOPE: Most certifications are held at the corporate level.",
    "HIPAA-AMBIGUITY: No standalone HIPAA certification exists.",
    "NO TRUST CENTER: The vendor does not publish a trust portal.",
    "AI TRAINING NUANCE: Enterprise data is excluded from training.",
    "CRITICAL: The consumer tier trains on user content by default.",
    "LEGACY-NAME: The listing uses the vendor's former name.",
  ];
  for (const s of labeled) {
    it(`rejects label-prefixed flag: ${s.slice(0, 40)}...`, () => {
      const hits = findEditorialVoice({ slug: "acme", flags: [s] });
      expect(hits).toHaveLength(1);
      expect(hits[0].path).toBe("flags[0]");
    });
  }

  const cleanFlags = [
    "ISO 27001:2022 is held at the parent-company level; confirm product scope during procurement.",
    "Most certifications are held at the Palo Alto Networks corporate level.",
    "The vendor does not publish a dedicated trust center.",
    "No standalone HIPAA certification exists; a BAA is available for eligible services.",
  ];
  for (const s of cleanFlags) {
    it(`passes sentence-style flag: ${s.slice(0, 40)}...`, () => {
      expect(findEditorialVoice({ slug: "acme", flags: [s] })).toHaveLength(0);
    });
  }

  it("does not apply the label rule to verbatim certification quotes", () => {
    const report = {
      slug: "acme",
      flags: ["Certification scope is organization-wide; confirm product coverage."],
      certifications: [
        { name: "ISO 27001", held: true, proof_quote: "ISO 27001: Information Security Management System certification." },
      ],
    };
    expect(findEditorialVoice(report)).toHaveLength(0);
  });

  it("rejects severity shorthand in privacy and security fields", () => {
    const report = {
      slug: "acme",
      flags: [],
      privacy: { ai_training_note: "CRITICAL GAP: the privacy policy is silent on model training." },
      security: [{ name: "Policy", value: "FLAG: policy may change without notice." }],
    };
    const hits = findEditorialVoice(report);
    expect(hits.map((h) => h.path).sort()).toEqual(["privacy.ai_training_note", "security[0].value"]);
  });
});

describe("findBannedDashes", () => {
  it("rejects em and en dashes in our own prose", () => {
    const report = {
      slug: "acme",
      product_family: "Design suite — with AI features.",
      flags: ["Trains on customer data – opt-out available."],
    };
    const hits = findBannedDashes(report);
    expect(hits.map((h: { path: string }) => h.path).sort()).toEqual(["flags[0]", "product_family"]);
  });

  it("leaves verbatim quote fields untouched", () => {
    const report = {
      slug: "acme",
      flags: ["Clean flag."],
      certifications: [{ name: "SOC 2", held: true, proof_quote: "Audited annually — report available on request." }],
      security: [{ name: "Encryption", value: "TLS 1.2+ — vendor wording." }],
    };
    expect(findBannedDashes(report)).toHaveLength(0);
  });
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
