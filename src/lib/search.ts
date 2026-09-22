import Fuse from 'fuse.js';
import type { Tool } from '@/types/tool';
import { allTools } from './tools';
import { normalizeQuery } from './query';

export { MAX_QUERY_LENGTH, normalizeQuery } from './query';

// Reuse the light catalog (name/tags/description/category are all indexed here);
// importing the raw data again would ship a second copy of the catalog.
const tools = allTools;

const fuseOptions = {
  keys: [
    { name: 'name', weight: 2 },
    { name: 'tags', weight: 1.5 },
    { name: 'description', weight: 1 },
    { name: 'category', weight: 0.5 },
  ],
  threshold: 0.3,
  // Match a word wherever it appears in a description, not only near the start.
  ignoreLocation: true,
  includeScore: true,
  minMatchCharLength: 2,
};

const fuse = new Fuse<Tool>(tools, fuseOptions);

export function searchTools(rawQuery: string, sourceTools: Tool[] = tools): Tool[] {
  const query = normalizeQuery(rawQuery);
  if (!query) return sourceTools;
  if (sourceTools.length === 0) return [];

  if (sourceTools === tools) {
    return fuse.search(query).map((r) => r.item);
  }

  const localFuse = new Fuse<Tool>(sourceTools, fuseOptions);
  return localFuse.search(query).map((r) => r.item);
}

export default searchTools;
