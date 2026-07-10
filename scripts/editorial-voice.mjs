/**
 * Copy lint for the Trust & Security Report data.
 *
 * Every published trust report must read as customer-facing product copy. In
 * practice a field can end up with phrasing that reads as a private note rather
 * than published copy: a draft label left at the start of a sentence, a note
 * about a missing or unreachable source, status shorthand, or an instruction
 * meant for an editor rather than the reader. None of that belongs on the page.
 * This module encodes that phrasing so the build can reject it.
 *
 * Two tiers:
 *  - GUARD_RE  : tuned to zero false positives on real product copy. The build
 *                fails the validate step if any published report matches it, so
 *                note-like phrasing can never reach production.
 *  - AUDIT_RE  : a broader superset used only to list fields worth a second read.
 *                Over-inclusive on purpose; a human reviews the matches.
 *
 * These patterns describe how the copy READS. They are unrelated to how the
 * data is produced.
 */

// Phrasing that is near-certainly a private note, not published copy. Every entry
// is checked against the full dataset so it never fires on real product copy.
const GUARD_PATTERNS = [
  // Draft labels sometimes left at the start of a sentence.
  "QA CORRECTION",
  "OVER-CLAIM RISK",
  "SURPRISING/CONFLICTING",
  "IDENTITY(?:-| )CONFLATION",
  // Notes about a missing or unreachable source.
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
  // Status shorthand.
  "graded held",
  "treated as unconfirmed",
  "treat as unconfirmed",
  "pending vendor (?:confirm|clarif|response)",
  "pending a direct",
  "the identity question is resolved",
  "not merely pending",
  // Instructions meant for an editor rather than the reader.
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

// Broader net for listing fields to review. Includes everything in GUARD plus
// softer note-like phrasing that can legitimately appear once in a while, so it
// is unsafe to hard-fail on but still worth a second read.
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
