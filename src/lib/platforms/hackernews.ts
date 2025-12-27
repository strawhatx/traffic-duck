import type { PlatformResult } from "./types";

// Hacker News via Algolia API
export async function searchHackerNews(query: string, limit: number = 10): Promise<PlatformResult[]> {
  const q = query.trim();
  if (!q) return [];
  try {
    const url = new URL("https://hn.algolia.com/api/v1/search");
    url.searchParams.set("query", q);
    url.searchParams.set("hitsPerPage", String(Math.max(5, Math.min(limit, 50))));
    url.searchParams.set("tags", "story");
    const res = await fetch(url.toString(), { headers: { "Content-Type": "application/json" } });
    if (!res.ok) return [];
    const data: any = await res.json();
    const hits: any[] = Array.isArray(data?.hits) ? data.hits : [];
    return hits.slice(0, limit).map((h: any): PlatformResult => {
      const title: string = String(h?.title || "Hacker News story");
      const text: string = String(h?._highlightResult?.title?.value || "");
      const urlStr: string = String(h?.url || `https://news.ycombinator.com/item?id=${h?.objectID}`);
      const author: string = String(h?.author || "hn");
      const points = Number(h?.points ?? 0);
      const numComments = Number(h?.num_comments ?? 0);
      const createdAt = String(h?.created_at || "");
      return {
        platform: "hackernews",
        title,
        content: text || title,
        author,
        url: urlStr,
        engagement: {
          likes: points,
          comments: numComments,
          created_at: createdAt,
        },
      };
    });
  } catch {
    return [];
  }
}


