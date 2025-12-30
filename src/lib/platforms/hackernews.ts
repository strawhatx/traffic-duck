import "server-only";
import type { PlatformResult } from "./types";

export async function searchHackerNews(
  query: string,
  limit: number = 10,
  days: number = 7
): Promise<PlatformResult[]> {
  if (!query.trim()) return [];

  try {
    const since = Math.floor(Date.now() / 1000) - days * 24 * 60 * 60;

    const url = new URL("https://hn.algolia.com/api/v1/search_by_date");
    url.searchParams.set("query", query.trim());
    url.searchParams.set("tags", "story");
    url.searchParams.set("hitsPerPage", String(Math.max(5, Math.min(limit, 50))));
    url.searchParams.set("numericFilters", `created_at_i>${since}`);
    url.searchParams.set("restrictSearchableAttributes", "title");

    const res = await fetch(url.toString());
    if (!res.ok) return [];

    const data = await res.json() as Record<string, unknown>;
    const hits = Array.isArray(data?.hits) ? data.hits : [];

    return hits.slice(0, limit).map((h: Record<string, unknown>): PlatformResult => ({
      platform: "hackernews",
      title: h?.title || "Hacker News story",
      content: h?.title || "",
      author: h?.author || "hn",
      url: h?.url || `https://news.ycombinator.com/item?id=${h?.objectID}`,
      engagement: {
        likes: Number(h?.points ?? 0),
        comments: Number(h?.num_comments ?? 0),
        created_at: h?.created_at || undefined,
      },
    }));
  } catch {
    return [];
  }
}




