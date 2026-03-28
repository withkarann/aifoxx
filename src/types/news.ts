export type NewsSource = 'hn' | 'producthunt' | 'techcrunch'
export type NewsCategory = 'news' | 'new-tool'

export interface NewsItem {
  id: string
  title: string
  url: string
  domain: string
  source: NewsSource
  category: NewsCategory
  points?: number
  date: string  // ISO 8601
  age: string   // pre-computed at scrape time, e.g. "3 hours ago"
}
