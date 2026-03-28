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
const MAX_ITEMS = 200
const MAX_PER_SOURCE = 20  // prevent any one source from dominating

// ─── Source config ───────────────────────────────────────────────────────────
// Add or remove sources here. filter = regex applied to title (undefined = keep all).

const AI_FILTER = /\bai\b|artificial intelligence|openai|anthropic|llm|chatgpt|machine learning|deep learning|neural|gpt|claude|gemini|automation|agent/i
const TOOL_FILTER = /ai|assistant|automation|llm|gpt|model|intelligence|smart|agent|tool|productivity|generate|copilot|workflow/i

const RSS_SOURCES = [
  // ── News ──────────────────────────────────────────────────────────────────
  {
    id: 'techcrunch',
    label: 'TechCrunch',
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
    id: 'zdnet',
    label: 'ZDNet',
    url: 'https://www.zdnet.com/topic/artificial-intelligence/rss.xml',
    category: 'news',
  },
  {
    id: 'huggingface',
    label: 'Hugging Face',
    url: 'https://huggingface.co/blog/feed.xml',
    category: 'news',
  },
  {
    id: 'theverge',
    label: 'The Verge',
    url: 'https://www.theverge.com/rss/index.xml',
    category: 'news',
    filter: AI_FILTER,
  },
  {
    id: 'arstechnica',
    label: 'Ars Technica',
    url: 'https://feeds.arstechnica.com/arstechnica/index',
    category: 'news',
    filter: AI_FILTER,
  },
  {
    id: 'tldr-ai',
    label: 'TLDR AI',
    url: 'https://tldr.tech/api/rss/ai',
    category: 'news',
  },
  {
    id: 'reddit-ml',
    label: 'r/MachineLearning',
    url: 'https://www.reddit.com/r/MachineLearning.rss',
    category: 'news',
    atom: true,
  },
  {
    id: 'reddit-artificial',
    label: 'r/artificial',
    url: 'https://www.reddit.com/r/artificial.rss',
    category: 'news',
    atom: true,
  },
  {
    id: 'analyticsvidhya',
    label: 'Analytics Vidhya',
    url: 'https://www.analyticsvidhya.com/feed/',
    category: 'news',
    filter: AI_FILTER,
  },
  {
    id: 'towardsdatascience',
    label: 'Towards Data Science',
    url: 'https://towardsdatascience.com/feed',
    category: 'news',
    filter: AI_FILTER,
  },
  {
    id: 'thesequence',
    label: 'The Sequence',
    url: 'https://thesequence.substack.com/feed',
    category: 'news',
  },
  {
    id: 'aisnakeoil',
    label: 'AI Snake Oil',
    url: 'https://www.aisnakeoil.com/feed',
    category: 'news',
  },
  // ── New Tools ─────────────────────────────────────────────────────────────
  {
    id: 'producthunt',
    label: 'Product Hunt',
    url: 'https://www.producthunt.com/feed',
    category: 'new-tool',
    // no filter — PH feed is already curated product launches
  },
  {
    id: 'theresanaiforthat',
    label: "There's An AI For That",
    url: 'https://theresanaiforthat.com/rss/',
    category: 'new-tool',
    atom: true,  // try Atom parsing
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// Atom feeds use <entry> instead of <item>, and <link href="..."/> for the URL
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
      'User-Agent': 'AIFoxx-NewsBot/1.0 (https://aifox.com)',
      Accept: 'application/rss+xml, application/xml, text/xml, */*',
    },
    signal: AbortSignal.timeout(12_000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.text()
}

// ─── Fetch functions ──────────────────────────────────────────────────────────

async function fetchHN() {
  const url = `https://hn.algolia.com/api/v1/search?tags=story&query=artificial+intelligence&hitsPerPage=${MAX_PER_SOURCE}`
  const data = JSON.parse(await fetchText(url))
  return (data.hits || [])
    .filter((h) => h.url && h.title)
    .map((h) => ({
      id: `hn-${h.objectID}`,
      title: h.title,
      url: h.url,
      domain: extractDomain(h.url),
      source: 'hn',
      category: 'news',
      points: h.points ?? undefined,
      date: new Date(h.created_at_i * 1000).toISOString(),
      age: computeAge(new Date(h.created_at_i * 1000).toISOString()),
    }))
}

async function fetchRSSSource(source) {
  const xml = await fetchText(source.url)
  const items = source.atom ? parseAtom(xml) : parseRSS(xml)
  return items
    .filter((i) => !source.filter || source.filter.test(i.title))
    .slice(0, MAX_PER_SOURCE)
    .map((i, idx) => {
      const date = i.pubDate ? new Date(i.pubDate).toISOString() : new Date().toISOString()
      return {
        id: `${source.id}-${idx}-${Date.now()}`,
        title: i.title,
        url: i.link,
        domain: extractDomain(i.link),
        source: source.id,
        category: source.category,
        date,
        age: computeAge(date),
      }
    })
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Scraping AI news...')

  const allSources = [
    { id: 'hn', label: 'HN (Algolia)', fetch: fetchHN },
    ...RSS_SOURCES.map((s) => ({ id: s.id, label: s.label, fetch: () => fetchRSSSource(s) })),
  ]

  const results = await Promise.allSettled(allSources.map((s) => s.fetch()))

  const allItems = []
  for (let i = 0; i < results.length; i++) {
    const r = results[i]
    if (r.status === 'fulfilled') {
      console.log(`  ✓ ${allSources[i].label}: ${r.value.length} items`)
      allItems.push(...r.value)
    } else {
      console.warn(`  ✗ ${allSources[i].label}: ${r.reason?.message}`)
    }
  }

  // Deduplicate by URL
  const seen = new Set()
  const unique = allItems.filter((item) => {
    if (seen.has(item.url)) return false
    seen.add(item.url)
    return true
  })

  // Sort newest first, keep top MAX_ITEMS
  unique.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const final = unique.slice(0, MAX_ITEMS)

  writeFileSync(OUTPUT_PATH, JSON.stringify(final, null, 2) + '\n')
  console.log(`\nDone. Wrote ${final.length} items to src/data/news.json`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
