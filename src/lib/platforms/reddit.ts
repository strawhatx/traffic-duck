import "server-only";
import { PlatformResult } from "./types";

type RedditChildData = {
  created_utc?: number;
  title?: string;
  selftext?: string;
  author?: string;
  permalink?: string;
  url?: string;
  ups?: number;
  num_comments?: number;
  subreddit?: string;
};

export async function searchReddit(query: string, limit: number = 25): Promise<PlatformResult[]> {
  // Use public Reddit search JSON endpoint; no auth required
  // Wrap multi-word queries in quotes to enforce exact phrase matching
  const trimmed = String(query || "").trim();
  const needsQuotes = /\s/.test(trimmed) && !/^".*"$/.test(trimmed);
  const q = needsQuotes ? `"${trimmed}"` : trimmed;
  const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(q)}&limit=${Math.max(
    1,
    Math.min(limit, 25)
  )}&sort=new`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "TrafficDuckBot/1.0" } });
    if (!res.ok) return [];
    const data = (await res.json()) as Record<string, unknown>;
    const dataObj = data?.data as Record<string, unknown> | undefined;
    const children = Array.isArray(dataObj?.children)
      ? (dataObj.children as Array<{ data?: RedditChildData }>)
      : [];
      
    return children.map((c): PlatformResult => {
      const d: RedditChildData = c?.data ?? {};
      const createdUtc = typeof d.created_utc === "number" ? d.created_utc : undefined;
      const createdIso = createdUtc ? new Date(createdUtc * 1000).toISOString() : undefined;
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
          created_at: createdIso,
        },
      };
    });
  } catch {
    return [];
  }
}


