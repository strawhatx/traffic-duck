import { PlatformResult } from "./types";

export async function searchReddit(query: string, limit: number = 10): Promise<PlatformResult[]> {
  // Use public Reddit search JSON endpoint; no auth required
  const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&limit=${Math.max(
    1,
    Math.min(limit, 25)
  )}&sort=new`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "TrafficDuckBot/1.0" } });
    if (!res.ok) return [];
    const data = await res.json();
    const children = data?.data?.children ?? [];
    return children.map((c: any): PlatformResult => {
      const d = c?.data ?? {};
      return {
        platform: "reddit",
        title: d.title ?? "",
        content: d.selftext || undefined,
        author: d.author ?? "unknown",
        url: d.permalink ? `https://www.reddit.com${d.permalink}` : d.url ?? "",
        engagement: {
          upvotes: d.ups ?? 0,
          comments: d.num_comments ?? 0,
          subreddit: d.subreddit ?? undefined,
        },
      };
    });
  } catch {
    return [];
  }
}


