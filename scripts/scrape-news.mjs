#!/usr/bin/env node
/**
 * Scrapes AI news from three sources and writes to src/data/news.json.
 * Run manually: node scripts/scrape-news.mjs
 * Run via CI:   .github/workflows/scrape-news.yml (daily at 6am UTC)
 *
 * Sources:
 *   - Hacker News (Algolia API) → category: news
 *   - ProductHunt RSS           → category: new-tool
 *   - TechCrunch AI RSS         → category: news
 */

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_PATH = join(__dirname, '..', 'src', 'data', 'news.json')
const MAX_ITEMS = 50

// ─── Helpers ────────────────────────────────────────────────────────────────

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
  // Handles both plain text and CDATA sections
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

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'AIFoxx-NewsBot/1.0 (https://aifox.com)' },
    signal: AbortSignal.timeout(10_000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.text()
}

// ─── Sources ────────────────────────────────────────────────────────────────

async function fetchHN() {
  const url =
    'https://hn.algolia.com/api/v1/search?tags=story&query=artificial+intelligence&hitsPerPage=30'
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

async function fetchProductHunt() {
  const xml = await fetchText('https://www.producthunt.com/feed')
  const items = parseRSS(xml)
  return items
    .filter((i) => /\bai\b|artificial intelligence|machine learning|llm|gpt/i.test(i.title))
    .map((i, idx) => {
      const date = i.pubDate ? new Date(i.pubDate).toISOString() : new Date().toISOString()
      return {
        id: `ph-${idx}-${Date.now()}`,
        title: i.title,
        url: i.link,
        domain: extractDomain(i.link),
        source: 'producthunt',
        category: 'new-tool',
        date,
        age: computeAge(date),
      }
    })
}

async function fetchTechCrunch() {
  const xml = await fetchText('https://techcrunch.com/tag/artificial-intelligence/feed/')
  const items = parseRSS(xml)
  return items.map((i, idx) => {
    const date = i.pubDate ? new Date(i.pubDate).toISOString() : new Date().toISOString()
    return {
      id: `tc-${idx}-${Date.now()}`,
      title: i.title,
      url: i.link,
      domain: extractDomain(i.link),
      source: 'techcrunch',
      category: 'news',
      date,
      age: computeAge(date),
    }
  })
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Scraping AI news...')

  const results = await Promise.allSettled([fetchHN(), fetchProductHunt(), fetchTechCrunch()])

  const allItems = []
  const labels = ['HN', 'ProductHunt', 'TechCrunch']
  for (let i = 0; i < results.length; i++) {
    const r = results[i]
    if (r.status === 'fulfilled') {
      console.log(`  ${labels[i]}: ${r.value.length} items`)
      allItems.push(...r.value)
    } else {
      console.warn(`  ${labels[i]}: FAILED — ${r.reason?.message}`)
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
  console.log(`Done. Wrote ${final.length} items to src/data/news.json`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
