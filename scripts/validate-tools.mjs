/**
 * Validates src/data/tools.json for data-quality issues that would cause
 * duplicate or broken listings on the site.
 *
 * Checks performed:
 *  - Duplicate slugs (hard fail)
 *  - Duplicate normalized names (hard fail)
 *  - Duplicate normalized URLs (hard fail)
 *  - Missing required fields (hard fail)
 *  - Compliance flags set to true with no backing source URL (warn only)
 *
 * Run with: node scripts/validate-tools.mjs
 * Exit code 0 = all hard checks passed, exit code 1 = one or more hard checks failed.
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = resolve(__dirname, '../src/data/tools.json');

// Fields every tool entry must carry.
const REQUIRED_FIELDS = ['name', 'category', 'subcategory', 'description', 'url', 'tags', 'pricing'];

// Compliance keys checked against compliance_sources.
const COMPLIANCE_KEYS = ['gdpr', 'soc2', 'hipaa', 'iso27001'];

// ---------------------------------------------------------------------------
// Normalization helpers
// ---------------------------------------------------------------------------

/**
 * Normalizes a URL for duplicate detection.
 * Strips protocol, www., query strings, fragments, and trailing slashes.
 */
function normalizeURL(raw) {
  if (!raw || typeof raw !== 'string') return '';
  let s = raw.toLowerCase().trim();
  s = s.replace(/^https?:\/\//, '');
  s = s.replace(/^www\./, '');
  s = s.replace(/[?#].*$/, '');
  s = s.replace(/\/$/, '');
  return s;
}

/**
 * Normalizes a product name for duplicate detection.
 * Keeps only lowercase alphanumeric characters so punctuation and spacing
 * differences do not hide real duplicates.
 */
function normalizeName(raw) {
  if (!raw || typeof raw !== 'string') return '';
  return raw.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// ---------------------------------------------------------------------------
// Validation passes
// ---------------------------------------------------------------------------

function checkDuplicateSlugs(tools) {
  const seen = new Map();
  const dupes = [];
  for (const tool of tools) {
    const slug = tool.slug;
    if (!slug) continue;
    if (seen.has(slug)) {
      dupes.push(slug);
    }
    seen.set(slug, true);
  }
  return dupes;
}

function checkDuplicateNames(tools) {
  const seen = new Map(); // normalized name → first slug
  const dupes = [];
  for (const tool of tools) {
    const norm = normalizeName(tool.name);
    if (!norm) continue;
    if (seen.has(norm)) {
      dupes.push({ normalized: norm, slugA: seen.get(norm), slugB: tool.slug });
    } else {
      seen.set(norm, tool.slug);
    }
  }
  return dupes;
}

function checkDuplicateURLs(tools) {
  const seen = new Map(); // normalized URL → first slug
  const dupes = [];
  for (const tool of tools) {
    const norm = normalizeURL(tool.url);
    if (!norm) continue;
    if (seen.has(norm)) {
      dupes.push({ normalized: norm, slugA: seen.get(norm), slugB: tool.slug });
    } else {
      seen.set(norm, tool.slug);
    }
  }
  return dupes;
}

function checkRequiredFields(tools) {
  const missing = [];
  for (const tool of tools) {
    for (const field of REQUIRED_FIELDS) {
      const val = tool[field];
      const isEmpty =
        val === undefined ||
        val === null ||
        val === '' ||
        (Array.isArray(val) && val.length === 0);
      if (isEmpty) {
        missing.push({ slug: tool.slug || '(no slug)', field });
      }
    }
  }
  return missing;
}

function checkComplianceSources(tools) {
  const orphans = [];
  for (const tool of tools) {
    const comp = tool.compliance || {};
    const sources = tool.compliance_sources || {};
    for (const key of COMPLIANCE_KEYS) {
      if (comp[key] === true) {
        const src = sources[key];
        if (!src || typeof src !== 'string' || src.trim() === '') {
          orphans.push({ slug: tool.slug, flag: key });
        }
      }
    }
  }
  return orphans;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

let tools;
try {
  tools = JSON.parse(readFileSync(DATA_PATH, 'utf8'));
} catch (err) {
  console.error(`Could not read ${DATA_PATH}: ${err.message}`);
  process.exit(1);
}

if (!Array.isArray(tools)) {
  console.error('tools.json must be a JSON array at the top level.');
  process.exit(1);
}

let failed = false;

// --- Hard check: duplicate slugs ---
const dupeSlugs = checkDuplicateSlugs(tools);
if (dupeSlugs.length > 0) {
  console.error(`FAIL duplicate slugs (${dupeSlugs.length}):`);
  dupeSlugs.forEach(s => console.error(`  slug "${s}" appears more than once`));
  failed = true;
}

// --- Hard check: duplicate normalized names ---
const dupeNames = checkDuplicateNames(tools);
if (dupeNames.length > 0) {
  console.error(`FAIL duplicate normalized names (${dupeNames.length}):`);
  dupeNames.forEach(d =>
    console.error(`  "${d.normalized}" → ${d.slugA} and ${d.slugB}`)
  );
  failed = true;
}

// --- Hard check: duplicate normalized URLs ---
const dupeURLs = checkDuplicateURLs(tools);
if (dupeURLs.length > 0) {
  console.error(`FAIL duplicate normalized URLs (${dupeURLs.length}):`);
  dupeURLs.forEach(d =>
    console.error(`  "${d.normalized}" → ${d.slugA} and ${d.slugB}`)
  );
  failed = true;
}

// --- Hard check: missing required fields ---
const missingFields = checkRequiredFields(tools);
if (missingFields.length > 0) {
  console.error(`FAIL missing required fields (${missingFields.length} violations):`);
  missingFields.forEach(m =>
    console.error(`  ${m.slug} is missing "${m.field}"`)
  );
  failed = true;
}

// --- Warn-only: compliance flags without source URLs ---
const orphanedCompliance = checkComplianceSources(tools);
if (orphanedCompliance.length > 0) {
  const affectedTools = new Set(orphanedCompliance.map(o => o.slug)).size;
  console.warn(
    `WARN ${orphanedCompliance.length} compliance flag(s) across ${affectedTools} tool(s) ` +
    `have no backing source URL. Backfilling source URLs is recommended.`
  );
}

if (failed) {
  process.exit(1);
}

console.log(
  `OK tools.json validated: ${tools.length} entries, ` +
  `0 duplicate slugs, 0 duplicate names, 0 duplicate URLs, 0 missing required fields. ` +
  `(${orphanedCompliance.length} compliance source warning(s))`
);
