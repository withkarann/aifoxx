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

import { readFileSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';
import { GUARD_RE, findEditorialVoice, findBannedDashes } from './editorial-voice.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = resolve(__dirname, '../src/data/tools.json');
const MCP_PATH = resolve(__dirname, '../src/data/mcp-servers.json');
const SKILLS_PATH = resolve(__dirname, '../src/data/claude-code-skills.json');
const TRUST_DIR = resolve(__dirname, '../src/data/trust');

// Fields every tool entry must carry.
const REQUIRED_FIELDS = ['name', 'category', 'subcategory', 'description', 'url', 'tags', 'pricing'];

// Compliance keys checked against compliance_sources.
const COMPLIANCE_KEYS = ['gdpr', 'soc2', 'hipaa', 'iso27001'];

// MCP server / skill entries: missing these breaks a listing (hard fail);
// an empty description only degrades the card (warn).
const SKILL_REQUIRED_HARD = ['name', 'github_url'];
const SKILL_REQUIRED_WARN = ['description'];

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

/**
 * Validates an MCP-server / Claude-skill dataset (same shape as the skill type).
 * Duplicate id / name / github_url is a hard fail; an empty description is a warn.
 */
function validateSkillDataset(label, path) {
  let data;
  try {
    data = JSON.parse(readFileSync(path, 'utf8'));
  } catch (err) {
    return { hard: [`${label}: could not read (${err.message})`], warn: [], count: 0 };
  }
  if (!Array.isArray(data)) {
    return { hard: [`${label}: must be a JSON array at the top level`], warn: [], count: 0 };
  }
  const hard = [];
  const warn = [];
  const ids = new Map();
  const names = new Map();
  const urls = new Map();
  for (const entry of data) {
    const id = entry.id || entry.slug || '(no id)';
    if (entry.id || entry.slug) {
      const key = entry.id || entry.slug;
      if (ids.has(key)) hard.push(`${label}: duplicate id "${key}"`);
      else ids.set(key, true);
    }
    const nn = normalizeName(entry.name);
    if (nn) {
      if (names.has(nn)) hard.push(`${label}: duplicate name "${entry.name}" (${names.get(nn)} & ${id})`);
      else names.set(nn, id);
    }
    const nu = normalizeURL(entry.github_url);
    if (nu) {
      if (urls.has(nu)) hard.push(`${label}: duplicate github_url "${nu}" (${urls.get(nu)} & ${id})`);
      else urls.set(nu, id);
    }
    for (const field of SKILL_REQUIRED_HARD) {
      const val = entry[field];
      if (val === undefined || val === null || val === '') {
        hard.push(`${label}: ${id} is missing "${field}"`);
      }
    }
    for (const field of SKILL_REQUIRED_WARN) {
      const val = entry[field];
      if (val === undefined || val === null || (typeof val === 'string' && val.trim() === '')) {
        warn.push(`${label}: ${id} has an empty "${field}"`);
      }
    }
  }
  return { hard, warn, count: data.length };
}

/**
 * Every published Trust & Security Report must read as customer-facing copy.
 * This flags any phrasing that reads as a private note rather than published
 * copy and hard-fails so it can never reach production. See editorial-voice.mjs.
 */
function checkTrustEditorialVoice() {
  let files;
  try {
    files = readdirSync(TRUST_DIR).filter(
      (f) => f.endsWith('.json') && f !== 'dimensions.json'
    );
  } catch {
    return { hits: [], count: 0 }; // no trust dataset present in this checkout
  }
  const hits = [];
  for (const file of files) {
    let report;
    try {
      report = JSON.parse(readFileSync(join(TRUST_DIR, file), 'utf8'));
    } catch (err) {
      hits.push({ slug: file.replace(/\.json$/, ''), path: '(parse)', match: err.message });
      continue;
    }
    for (const h of findEditorialVoice(report, GUARD_RE)) {
      hits.push({ slug: report.slug || file.replace(/\.json$/, ''), path: h.path, match: h.match });
    }
    for (const h of findBannedDashes(report)) {
      hits.push({ slug: report.slug || file.replace(/\.json$/, ''), path: h.path, match: `banned dash "${h.match}"` });
    }
  }
  return { hits, count: files.length };
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

console.log(
  `OK tools.json validated: ${tools.length} entries, ` +
  `0 duplicate slugs, 0 duplicate names, 0 duplicate URLs, 0 missing required fields. ` +
  `(${orphanedCompliance.length} compliance source warning(s))`
);

// --- MCP servers + Claude Code skills datasets ---
for (const [label, path] of [['mcp-servers.json', MCP_PATH], ['claude-code-skills.json', SKILLS_PATH]]) {
  const r = validateSkillDataset(label, path);
  if (r.hard.length > 0) {
    console.error(`FAIL ${label} (${r.hard.length}):`);
    r.hard.forEach(h => console.error(`  ${h}`));
    failed = true;
  }
  if (r.warn.length > 0) {
    console.warn(`WARN ${label}: ${r.warn.length} entr${r.warn.length === 1 ? 'y' : 'ies'} with an empty description.`);
  }
  if (r.hard.length === 0) {
    console.log(`OK ${label} validated: ${r.count} entries (${r.warn.length} warning(s)).`);
  }
}

// --- Hard check: note-like phrasing in Trust & Security Reports ---
const trust = checkTrustEditorialVoice();
if (trust.hits.length > 0) {
  const affected = new Set(trust.hits.map((h) => h.slug)).size;
  console.error(
    `FAIL note-like phrasing in ${trust.hits.length} trust report field(s) across ${affected} report(s):`
  );
  trust.hits.slice(0, 40).forEach((h) =>
    console.error(`  ${h.slug} ${h.path}: matched ${JSON.stringify(h.match)}`)
  );
  if (trust.hits.length > 40) console.error(`  ... and ${trust.hits.length - 40} more`);
  console.error(
    '  Trust reports must be customer-facing. Reword the flagged copy so it reads as a product description.'
  );
  failed = true;
} else if (trust.count > 0) {
  console.log(`OK trust reports validated: ${trust.count} reports, 0 issues.`);
}

if (failed) {
  process.exit(1);
}
