import rawNews from '@/data/news.json'
import rawNewTools from '@/data/new-tools.json'
import type { NewsItem } from '@/types/news'

export const allNews: NewsItem[] = rawNews as NewsItem[]
export const allNewTools: NewsItem[] = rawNewTools as NewsItem[]

export function getNewsByCategory(category: 'news' | 'new-tool' | 'all'): NewsItem[] {
  if (category === 'news') return allNews
  if (category === 'new-tool') return allNewTools
  return [...allNews, ...allNewTools].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

export const NEWS_COUNTS = {
  total: allNews.length + allNewTools.length,
  news: allNews.length,
  newTools: allNewTools.length,
}

export function formatAge(iso: string, now: number = Date.now()): string {
  const then = new Date(iso).getTime()
  if (!Number.isFinite(then)) return ''
  const diff = now - then
  const minutes = Math.max(0, Math.floor(diff / 60_000))
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  const years = Math.floor(days / 365)
  return `${years}y ago`
}

export function formatAbsoluteDate(iso: string): string {
  const d = new Date(iso)
  if (!Number.isFinite(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function getLatestNewsDate(): string | null {
  const all = [...allNews, ...allNewTools]
  if (all.length === 0) return null
  return all.reduce((max, n) => (new Date(n.date).getTime() > new Date(max).getTime() ? n.date : max), all[0].date)
}

export interface NewsGroup {
  label: string
  items: NewsItem[]
}

/**
 * Bucket news items into Today / Yesterday / This Week / Earlier based on each
 * item's ISO `date`, relative to `now`. Input order is preserved within each
 * bucket; empty buckets are omitted. Items with an unparseable date fall into
 * "Earlier".
 */
export function groupNewsByDate(items: NewsItem[], now: number = Date.now()): NewsGroup[] {
  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)
  const startOfTodayMs = startOfToday.getTime()
  const DAY = 86_400_000
  const buckets: Record<string, NewsItem[]> = {
    Today: [],
    Yesterday: [],
    'This Week': [],
    Earlier: [],
  }
  for (const item of items) {
    const t = new Date(item.date).getTime()
    if (!Number.isFinite(t)) { buckets.Earlier.push(item); continue }
    if (t >= startOfTodayMs) buckets.Today.push(item)
    else if (t >= startOfTodayMs - DAY) buckets.Yesterday.push(item)
    else if (t >= startOfTodayMs - 6 * DAY) buckets['This Week'].push(item)
    else buckets.Earlier.push(item)
  }
  const order = ['Today', 'Yesterday', 'This Week', 'Earlier']
  return order
    .map((label) => ({ label, items: buckets[label] }))
    .filter((g) => g.items.length > 0)
}
