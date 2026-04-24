#!/usr/bin/env node
/**
 * Scrapes AI news from multiple sources and writes to src/data/news.json.
 * Run manually: node scripts/scrape-news.mjs
 * Run via CI:   .github/workflows/scrape-news.yml (daily at 6am UTC)
 */

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_PATH = join(__dirname, '..', 'src', 'data', 'news.json')
const NEW_TOOLS_PATH = join(__dirname, '..', 'src', 'data', 'new-tools.json')
const MAX_ITEMS = 200
const MAX_PER_SOURCE = 20
// Drop items older than this. Old HN results from Algolia often link to dead domains (e.g. recode.net).
const MAX_AGE_DAYS = 30
const MIN_CREATED_AT_S = Math.floor((Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000) / 1000)

// ─── Relevance scoring ────────────────────────────────────────────────────────
// Each keyword match adds its weight to the item's score.
// Items from dedicated AI sources (no filter) get a base score of 2.
// Items from general sources need score >= 1 to be included.

const SCORE_KEYWORDS = [
  { re: /\bopenai\b/i,                    w: 3 },
  { re: /\banthropic\b/i,                 w: 3 },
  { re: /\bgpt[-\s]?\d|gpt-4|gpt-5/i,    w: 3 },
  { re: /\bclaude\b/i,                    w: 3 },
  { re: /\bchatgpt\b/i,                   w: 3 },
  { re: /\bgemini\b/i,                    w: 2 },
  { re: /\bllm\b|\bllms\b/i,             w: 2 },
  { re: /\bagent\b|\bagentic\b/i,         w: 2 },
  { re: /artificial intelligence/i,       w: 2 },
  { re: /machine learning/i,              w: 2 },
  { re: /\bdeep learning\b/i,             w: 2 },
  { re: /\bfoundation model/i,            w: 2 },
  { re: /\bai\b/i,                        w: 1 },
  { re: /\bneural\b/i,                    w: 1 },
  { re: /\bautomation\b/i,               w: 1 },
  { re: /\bcopilot\b/i,                   w: 1 },
  { re: /\bgenerative\b/i,               w: 1 },
  { re: /\bmistral\b|\bmeta ai\b|\bllama\b/i, w: 2 },
  { re: /\bperplexity\b|\bhuggingface\b/i, w: 2 },
]

function scoreTitle(title) {
  return SCORE_KEYWORDS.reduce((sum, { re, w }) => sum + (re.test(title) ? w : 0), 0)
}

// ─── Source config ────────────────────────────────────────────────────────────

const RSS_SOURCES = [
  // ── Dedicated AI news (no filter needed) ─────────────────────────────────
  {
    id: 'techcrunch',
    label: 'TechCrunch AI',
    url: 'https://techcrunch.com/tag/artificial-intelligence/feed/',
    category: 'news',
  },
  {
    id: 'venturebeat',
    label: 'VentureBeat',
    url: 'https://venturebeat.com/category/ai/feed/',
    category: 'news',
  },
  {
    id: 'mit-techreview',
    label: 'MIT Tech Review',
    url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed/',
    category: 'news',
  },
  {
    id: 'huggingface',
    label: 'Hugging Face Blog',
    url: 'https://huggingface.co/blog/feed.xml',
    category: 'news',
  },
  {
    id: 'tldr-ai',
    label: 'TLDR AI',
    url: 'https://tldr.tech/api/rss/ai',
    category: 'news',
  },
  {
    id: 'aisnakeoil',
    label: 'AI Snake Oil',
    url: 'https://www.aisnakeoil.com/feed',
    category: 'news',
  },
  {
    id: 'thesequence',
    label: 'The Sequence',
    url: 'https://thesequence.substack.com/feed',
    category: 'news',
  },
  // ── General tech (filter by score) ───────────────────────────────────────
  {
    id: 'zdnet',
    label: 'ZDNet',
    url: 'https://www.zdnet.com/topic/artificial-intelligence/rss.xml',
    category: 'news',
    needsScore: true,
  },
  {
    id: 'theverge',
    label: 'The Verge',
    url: 'https://www.theverge.com/rss/index.xml',
    category: 'news',
    needsScore: true,
  },
  {
    id: 'arstechnica',
    label: 'Ars Technica',
    url: 'https://feeds.arstechnica.com/arstechnica/index',
    category: 'news',
    needsScore: true,
  },
  {
    id: 'analyticsvidhya',
    label: 'Analytics Vidhya',
    url: 'https://www.analyticsvidhya.com/feed/',
    category: 'news',
    needsScore: true,
  },
  {
    id: 'towardsdatascience',
    label: 'Towards Data Science',
    url: 'https://towardsdatascience.com/feed',
    category: 'news',
    needsScore: true,
  },
  // ── AI newsletters → new tool candidates ─────────────────────────────────
  {
    id: 'rundown-ai',
    label: 'The Rundown AI',
    url: 'https://therundown.substack.com/feed',
    category: 'new-tool',
  },
  {
    id: 'neuron',
    label: 'The Neuron',
    url: 'https://theneuron.substack.com/feed',
    category: 'new-tool',
  },
  {
    id: 'import-ai',
    label: 'Import AI',
    url: 'https://importai.substack.com/feed',
    category: 'new-tool',
  },
  {
    id: 'lastweekinai',
    label: 'Last Week in AI',
    url: 'https://lastweekinai.substack.com/feed',
    category: 'new-tool',
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

function computeAge(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&apos;/g, "'")
}

function extractTag(xml, tag) {
  const re = new RegExp(
    `<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`,
    'i'
  )
  const m = xml.match(re)
  return m ? decodeEntities(m[1].trim()) : null
}

function parseRSS(xml) {
  const items = []
  for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)) {
    const raw = m[1]
    const title = extractTag(raw, 'title')
    let link = extractTag(raw, 'link')
    if (!link) {
      const hrefM = raw.match(/<link[^>]+href="([^"]+)"/)
      if (hrefM) link = hrefM[1]
    }
    const pubDate = extractTag(raw, 'pubDate') || extractTag(raw, 'published')
    if (title && link) items.push({ title, link, pubDate })
  }
  return items
}

function parseAtom(xml) {
  const items = []
  for (const m of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/gi)) {
    const raw = m[1]
    const title = extractTag(raw, 'title')
    const hrefM = raw.match(/<link[^>]+href="([^"]+)"/)
    const link = hrefM ? hrefM[1] : extractTag(raw, 'link')
    const pubDate = extractTag(raw, 'published') || extractTag(raw, 'updated')
    if (title && link) items.push({ title, link, pubDate })
  }
  return items
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'AIFoxx-NewsBot/1.0 (https://aifoxx.com)',
      Accept: 'application/rss+xml, application/xml, text/xml, */*',
    },
    signal: AbortSignal.timeout(12_000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.text()
}

// ─── Fetch functions ──────────────────────────────────────────────────────────

async function fetchHN() {
  // search_by_date sorts by recency; numericFilters restricts to the last MAX_AGE_DAYS so we skip 10-year-old dead links.
  const url = `https://hn.algolia.com/api/v1/search_by_date?tags=story&query=artificial+intelligence&hitsPerPage=${MAX_PER_SOURCE}&numericFilters=created_at_i>${MIN_CREATED_AT_S}`
  const data = JSON.parse(await fetchText(url))
  return (data.hits || [])
    .filter((h) => h.url && h.title)
    .map((h) => {
      const title = h.title
      const date = new Date(h.created_at_i * 1000).toISOString()
      return {
        id: `hn-${h.objectID}`,
        title,
        url: h.url,
        domain: extractDomain(h.url),
        source: 'hn',
        category: 'news',
        points: h.points ?? undefined,
        date,
        age: computeAge(date),
        score: scoreTitle(title),
      }
    })
}

async function fetchLaunchHN() {
  const url = `https://hn.algolia.com/api/v1/search_by_date?tags=story&query=%22Launch+HN%22&hitsPerPage=${MAX_PER_SOURCE}&numericFilters=created_at_i>${MIN_CREATED_AT_S}`
  const data = JSON.parse(await fetchText(url))
  return (data.hits || [])
    .filter((h) => h.url && h.title && /^Launch HN:/i.test(h.title))
    .map((h) => {
      const title = h.title.replace(/^Launch HN:\s*/i, '').trim()
      const date = new Date(h.created_at_i * 1000).toISOString()
      return {
        id: `launch-hn-${h.objectID}`,
        title,
        url: h.url,
        domain: extractDomain(h.url),
        source: 'launch-hn',
        category: 'new-tool',
        points: h.points ?? undefined,
        date,
        age: computeAge(date),
        score: scoreTitle(title),
      }
    })
}

async function fetchRSSSource(source) {
  const xml = await fetchText(source.url)
  const items = source.atom ? parseAtom(xml) : parseRSS(xml)
  const results = []
  for (const i of items.slice(0, MAX_PER_SOURCE)) {
    const title = i.title
    const score = scoreTitle(title)
    // For general sources (needsScore), skip items with zero AI relevance
    if (source.needsScore && score === 0) continue
    // Skip items without a pubDate (we can't trust the recency) or older than MAX_AGE_DAYS.
    if (!i.pubDate) continue
    const parsed = new Date(i.pubDate)
    if (!Number.isFinite(parsed.getTime())) continue
    if (parsed.getTime() < MIN_CREATED_AT_S * 1000) continue
    const date = parsed.toISOString()
    results.push({
      id: `${source.id}-${Date.now()}-${results.length}`,
      title,
      url: i.link,
      domain: extractDomain(i.link),
      source: source.id,
      category: source.category,
      date,
      age: computeAge(date),
      score,
    })
  }
  return results
}

// ─── Deduplication ────────────────────────────────────────────────────────────
// Deduplicate by URL and by normalized title to catch cross-posted articles.

function normalizeTitle(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function dedup(items) {
  const seenUrls = new Set()
  const seenTitles = new Set()
  return items.filter((item) => {
    const normTitle = normalizeTitle(item.title)
    if (seenUrls.has(item.url) || seenTitles.has(normTitle)) return false
    seenUrls.add(item.url)
    seenTitles.add(normTitle)
    return true
  })
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('── News sources ──────────────────────────────')

  const newsSources = [
    { id: 'hn', label: 'HN (Algolia)', fetch: fetchHN },
    ...RSS_SOURCES.filter((s) => s.category === 'news').map((s) => ({
      id: s.id, label: s.label, fetch: () => fetchRSSSource(s),
    })),
  ]

  const toolSources = [
    { id: 'launch-hn', label: 'Launch HN', fetch: fetchLaunchHN },
    ...RSS_SOURCES.filter((s) => s.category === 'new-tool').map((s) => ({
      id: s.id, label: s.label, fetch: () => fetchRSSSource(s),
    })),
  ]

  // Fetch news
  const newsResults = await Promise.allSettled(newsSources.map((s) => s.fetch()))
  const newsItems = []
  for (let i = 0; i < newsResults.length; i++) {
    const r = newsResults[i]
    if (r.status === 'fulfilled') {
      console.log(`  ✓ ${newsSources[i].label}: ${r.value.length} items`)
      newsItems.push(...r.value)
    } else {
      console.warn(`  ✗ ${newsSources[i].label}: ${r.reason?.message}`)
    }
  }

  console.log('\n── New tool sources ──────────────────────────')

  // Fetch new tools
  const toolResults = await Promise.allSettled(toolSources.map((s) => s.fetch()))
  const toolItems = []
  for (let i = 0; i < toolResults.length; i++) {
    const r = toolResults[i]
    if (r.status === 'fulfilled') {
      console.log(`  ✓ ${toolSources[i].label}: ${r.value.length} items`)
      toolItems.push(...r.value)
    } else {
      console.warn(`  ✗ ${toolSources[i].label}: ${r.reason?.message}`)
    }
  }

  // Sort by date, dedup, write news.json
  const finalNews = dedup(newsItems)
  finalNews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  writeFileSync(OUTPUT_PATH, JSON.stringify(finalNews.slice(0, MAX_ITEMS), null, 2) + '\n')

  // Sort by date, dedup, write new-tools.json
  const finalTools = dedup(toolItems)
  finalTools.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  writeFileSync(NEW_TOOLS_PATH, JSON.stringify(finalTools.slice(0, MAX_ITEMS), null, 2) + '\n')

  console.log(`\nDone.`)
  console.log(`  news.json:      ${Math.min(finalNews.length, MAX_ITEMS)} items`)
  console.log(`  new-tools.json: ${Math.min(finalTools.length, MAX_ITEMS)} items`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
