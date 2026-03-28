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
  // ── New Tools (AI newsletters + launch boards) ────────────────────────────
  {
    id: 'rundown-ai',
    label: 'The Rundown AI',
    url: 'https://therundown.substack.com/feed',
    category: 'new-tool',
    // curated AI newsletter — keep all items
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

// "Launch HN" posts — official product launch announcements on Hacker News
async function fetchLaunchHN() {
  const url = `https://hn.algolia.com/api/v1/search?tags=story&query=%22Launch+HN%22&hitsPerPage=${MAX_PER_SOURCE}`
  const data = JSON.parse(await fetchText(url))
  return (data.hits || [])
    .filter((h) => h.url && h.title && /^Launch HN:/i.test(h.title))
    .map((h) => ({
      id: `launch-hn-${h.objectID}`,
      title: h.title.replace(/^Launch HN:\s*/i, '').trim(),
      url: h.url,
      domain: extractDomain(h.url),
      source: 'launch-hn',
      category: 'new-tool',
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

function dedup(items) {
  const seen = new Set()
  return items.filter((item) => {
    if (seen.has(item.url)) return false
    seen.add(item.url)
    return true
  })
}

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

  // Sort + dedup + write news.json
  const finalNews = dedup(newsItems)
  finalNews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  writeFileSync(OUTPUT_PATH, JSON.stringify(finalNews.slice(0, MAX_ITEMS), null, 2) + '\n')

  // Sort + dedup + write new-tools.json
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
