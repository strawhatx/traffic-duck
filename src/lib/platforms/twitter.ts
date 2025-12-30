import "server-only";
import { PlatformResult } from "./types";

export async function searchTwitter(query: string, limit: number = 10): Promise<PlatformResult[]> {
  const bearer = process.env.TWITTER_BEARER_TOKEN || process.env.X_BEARER_TOKEN || "";
  if (!bearer) return [];

  const maxResults = Math.max(10, Math.min(limit, 50)); // Twitter API v2 allows 10-100; keep modest
  const trimmed = String(query || "").trim();
  const needsQuotes = /\s/.test(trimmed) && !/^".*"$/.test(trimmed);
  const q = needsQuotes ? `"${trimmed}"` : trimmed;
  const params = new URLSearchParams({
    query: `${q} -is:retweet lang:en`,
    max_results: String(maxResults),
    "tweet.fields": "public_metrics,created_at,lang",
    expansions: "author_id",
    "user.fields": "username,name",
  });

  // Prefer api.x.com; fallback to api.twitter.com for older environments
  const endpoints = [
    `https://api.x.com/2/tweets/search/recent?${params.toString()}`,
    `https://api.twitter.com/2/tweets/search/recent?${params.toString()}`,
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${bearer}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) continue;
      const data: any = await res.json();
      const tweets = Array.isArray(data?.data) ? data.data : [];
      const users = Array.isArray(data?.includes?.users) ? data.includes.users : [];
      const userById = new Map<string, any>(users.map((u: any) => [u.id, u]));

      const results: PlatformResult[] = tweets.map((t: any) => {
        const user = userById.get(t.author_id);
        const username = user?.username || "unknown";
        const name = user?.name || username;
        const text: string = String(t?.text || "");
        const title = text.length > 80 ? `${text.slice(0, 77)}...` : text;
        const metrics = t?.public_metrics || {};
        return {
          platform: "twitter",
          title,
          content: text,
          author: name ? `@${username}` : "unknown",
          url: `https://x.com/${username}/status/${t?.id}`,
          engagement: {
            likes: metrics?.like_count ?? 0,
            retweets: metrics?.retweet_count ?? 0,
            quotes: metrics?.quote_count ?? 0,
            comments: metrics?.reply_count ?? 0,
            created_at: t?.created_at || undefined,
          },
        };
      });

      return results;
    } catch {
      // try next endpoint
      continue;
    }
  }

  return [];
}


