import rawNews from '@/data/news.json'
import type { NewsItem, NewsCategory } from '@/types/news'

export const allNews: NewsItem[] = rawNews as NewsItem[]

export function getNewsByCategory(category: NewsCategory | 'all'): NewsItem[] {
  if (category === 'all') return allNews
  return allNews.filter((item) => item.category === category)
}

export const NEWS_COUNTS = {
  total: allNews.length,
  news: allNews.filter((i) => i.category === 'news').length,
  newTools: allNews.filter((i) => i.category === 'new-tool').length,
}
