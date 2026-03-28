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
