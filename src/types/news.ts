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
  date: string    // ISO 8601 — source of truth; age is computed on the client at render time
  age?: string    // deprecated: legacy pre-computed string kept for JSON back-compat
  score?: number  // relevance score (higher = more AI-relevant)
}
