import SearchQuery from '../models/SearchQuery.js';

export async function logSearch(query, userId = null, toolName = null, source = 'search_bar') {
  try {
    if (!query || typeof query !== 'string') return;
    
    await SearchQuery.create({
      query: query.trim().toLowerCase(),
      userId,
      toolName,
      source
    });
  } catch (error) {
    // Don't throw - logging failures shouldn't break the app
    console.error('Failed to log search:', error);
  }
}