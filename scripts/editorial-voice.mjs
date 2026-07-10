/**
 * Editorial-voice detection for the Trust & Security Report data.
 *
 * The published trust pages must read entirely as buyer-facing copy. This module
 * encodes the internal editorial vocabulary that must never appear in a report:
 * verification/process notes ("could not fetch the page"), editorial changelog
 * labels ("QA CORRECTION"), grading mechanics ("graded held"), and directives
 * aimed at the directory itself ("do not credit", "should be surfaced to buyers").
 *
 * Two tiers:
 *  - GUARD_RE  : tuned to zero false positives on real vendor copy. The build
 *                guard fails the validate step if any committed report matches it,
 *                so this language can never reach production again.
 *  - AUDIT_RE  : a broader superset used only to enumerate passages that need an
 *                editorial rewrite. Over-inclusive on purpose; a human/editor pass
 *                reviews the matches, so a few soft hits are fine.
 *
 * These patterns describe editorial VOICE, not any tool, path, or workflow. The
 * separate tool/process markers (WebFetch, .vendor-data, etc.) live in the build
 * script's own INTERNAL_RE; this module is purely about how the copy reads.
 */

// Phrases that are near-certainly internal editorial voice. Every entry has been
// checked against the full corpus so it does not fire on genuine vendor content.
const GUARD_PATTERNS = [
  // Editorial changelog / taxonomy labels an analyst prepends to a note.
  "QA CORRECTION",
  "OVER-CLAIM RISK",
  "SURPRISING/CONFLICTING",
  "IDENTITY(?:-| )CONFLATION",
  // Verification / data-capture caveats about the assessment itself.
  "in this pass",
  "this pass[,;) ]",
  "fetch returned",
  "returned only headers",
  "headers/titles",
  "could not (?:fully )?(?:load|fetch|retrieve|access|open|read)",
  "couldn't (?:fully )?(?:load|fetch|retrieve|access)",
  "unable to (?:fully )?(?:load|fetch|retrieve|access) (?:the )?(?:full |page|site|url)",
  "follow-up direct fetch",
  "direct fetch",
  "re-?fetch",
  "before treating [^.]*?(?:fully )?verified",
  "secondary vendor-domain (?:search )?snippet",
  "evidence-capture gap",
  "raw scrape",
  "no usable trust",
  // Grading / status mechanics of the assessment.
  "graded held",
  "treated as unconfirmed",
  "treat as unconfirmed",
  "pending vendor (?:confirm|clarif|response)",
  "pending a direct",
  "the identity question is resolved",
  "not merely pending",
  // Directives aimed at the directory / editor rather than at the buyer.
  "do not credit",
  "must not be credited",
  "should not be credited",
  "should be surfaced (?:to |explicitly|here)",
  "should be flagged (?:to |for |explicitly)",
  "directory must",
  "the directory should",
  "recommend not (?:displaying|crediting|listing|showing)",
  "do not (?:display|present|list|show) [^.]*?as (?:held|compliant|certified)",
];

// Broader net for finding rewrite targets. Includes everything in GUARD plus
// softer analyst tics that may legitimately appear once in a while and therefore
// are unsafe to hard-fail the build on, but should still be reviewed.
const AUDIT_EXTRA = [
  "should be surfaced",
  "should be flagged",
  "recommend(?:ed|s)? (?:a )?(?:follow-up|direct|re-?fetch|confirm|verif|clarif)",
  "recommend(?:ed|s)? not",
  "we recommend not",
  "assessed slug",
  "the assessed",
  "this assessment",
  "for this vendor[,;) ]",
  "over-?claim",
  "under-?claim",
  "identity-conflation",
  "name collision",
  "held\\s*=\\s*(?:'|\")?(?:true|false|unknown)",
  "held false",
  "graded",
  "proof_quote",
  "privacy_policy_url",
  "\\bflag(?:ged)? (?:for|as) (?:review|follow)",
  "surfaced to (?:buyers|users|shoppers)",
  "confirmed via secondary",
  "pending (?:a )?(?:direct|follow|vendor)",
  "capture gap",
  "not fully verified",
  "as fully verified",
];

export const GUARD_RE = new RegExp(GUARD_PATTERNS.join("|"), "i");
export const AUDIT_RE = new RegExp([...GUARD_PATTERNS, ...AUDIT_EXTRA].join("|"), "i");

// Every free-text field on a report that a visitor can read. The guard and the
// audit both walk exactly these paths, so nothing user-facing is missed.
export function reportProseStrings(report) {
  const out = [];
  const push = (path, val) => {
    if (typeof val === "string" && val.trim()) out.push({ path, text: val });
  };
  push("product_family", report.product_family);
  (report.flags || []).forEach((f, i) => push(`flags[${i}]`, f));
  (report.certifications || []).forEach((c, i) => push(`certifications[${i}].proof_quote`, c?.proof_quote));
  if (report.privacy) {
    push("privacy.ai_training_note", report.privacy.ai_training_note);
    push("privacy.data_region", report.privacy.data_region);
  }
  (report.security || []).forEach((s, i) => push(`security[${i}].value`, s?.value));
  (report.products || []).forEach((p, i) => {
    push(`products[${i}].data_scope`, p?.data_scope);
    push(`products[${i}].notes`, p?.notes);
  });
  if (report.compare) {
    push("compare.pricing_model", report.compare.pricing_model);
    push("compare.data_residency", report.compare.data_residency);
  }
  return out;
}

// Returns [{ path, text, match }] for every prose field that trips `re`.
export function findEditorialVoice(report, re = GUARD_RE) {
  const hits = [];
  for (const { path, text } of reportProseStrings(report)) {
    const m = re.exec(text);
    if (m) hits.push({ path, text, match: m[0] });
  }
  return hits;
}
