export type NewsSource = string   // e.g. 'hn', 'producthunt', 'techcrunch', 'venturebeat' …
export type NewsCategory = 'news' | 'new-tool'

export interface NewsItem {
  id: string
  title: string
  url: string
  domain: string
  source: NewsSource
  category: NewsCategory
  points?: number
  date: string    // ISO 8601
  age: string     // pre-computed at scrape time, e.g. "3h ago"
  score?: number  // relevance score (higher = more AI-relevant)
}
