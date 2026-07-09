import Fuse from 'fuse.js';
import type { Tool } from '@/types/tool';
import { allTools } from './tools';

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
  includeScore: true,
  minMatchCharLength: 2,
};

const fuse = new Fuse<Tool>(tools, fuseOptions);

export function searchTools(query: string, sourceTools: Tool[] = tools): Tool[] {
  if (!query || !query.trim()) return sourceTools;
  if (sourceTools.length === 0) return [];

  if (sourceTools === tools) {
    return fuse.search(query).map((r) => r.item);
  }

  const localFuse = new Fuse<Tool>(sourceTools, fuseOptions);
  return localFuse.search(query).map((r) => r.item);
}

export default searchTools;
