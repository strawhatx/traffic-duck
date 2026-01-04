import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { resolveTierFromProfile, type SubscriptionTier } from "@/lib/subscription";

export type IntentLevel = "high" | "medium" | "low";
export type Platform = "X" | "Reddit" | "Hacker News";

export type Opportunity = {
  id: number;
  platform: Platform;
  intent: IntentLevel;
  excerpt: string;
  keyword: string;
  reason: string;
  timeAgo: string;
  engagement: {
    replies: number;
    likes: number;
  };
};

type SearchResult = {
  id: string;
  platform: "reddit" | "twitter" | "instagram" | "hackernews";
  title: string | null;
  content: string | null;
  author: string | null;
  url: string;
  engagement: Record<string, unknown> | null;
  why_matters: string | null;
  discovered_at: string | null;
};

function toTimeAgo(iso?: string | null): string {
  if (!iso) return "";
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return "";
  const diffMs = Date.now() - then;
  const mins = Math.floor(diffMs / (60 * 1000));
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function normalizePlatform(p: SearchResult["platform"]): Platform | null {
  if (p === "twitter") return "X";
  if (p === "reddit") return "Reddit";
  if (p === "hackernews") return "Hacker News";
  return null;
}

function deriveIntent(eng: Record<string, unknown> | null, why: string | null): IntentLevel {
  const likes = Number(typeof eng?.likes === "number" ? eng.likes : 0);
  const comments = Number(typeof eng?.comments === "number" ? eng.comments : 0);
  const upvotes = Number(typeof eng?.upvotes === "number" ? eng.upvotes : 0);
  const score = likes + comments + upvotes;
  if (score >= 30) return "high";
  if (score >= 10) return "medium";
  if ((why ?? "").toLowerCase().includes("high")) return "high";
  return "low";
}

export function useDashboardData() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tier, setTier] = useState<SubscriptionTier>("free");
  const [keywordsCount, setKeywordsCount] = useState<number>(0);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);

  const load = async () => {
    setLoading(true);
    setError(null);
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) {
      setOpportunities([]);
      setLoading(false);
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_status, price_id")
      .eq("id", userId)
      .maybeSingle();
    setTier(resolveTierFromProfile(profile ?? undefined));

    const { count } = await supabase.from("keywords").select("id", { count: "exact", head: true }).eq("user_id", userId);
    setKeywordsCount(count ?? 0);

    const { data, error } = await supabase
      .from("search_results")
      .select("id, platform, title, content, author, url, engagement, why_matters, discovered_at")
      .order("discovered_at", { ascending: false, nullsFirst: false })
      .limit(100);
    if (error) {
      setError("Failed to load results");
      setOpportunities([]);
      setLoading(false);
      return;
    }
    const rows = (data ?? []) as SearchResult[];
    const mapped: Opportunity[] = rows
      .map((r) => {
        const platform = normalizePlatform(r.platform);
        if (!platform) return null;
        const engagementObj = (r.engagement ?? {}) as Record<string, unknown>;
        const intent = deriveIntent(engagementObj, r.why_matters);
        const excerptText = (r.content ?? r.title ?? "").toString();
        const reason = r.why_matters ?? "High-signal audience overlap and actionable conversation.";
        const likes = Number(typeof engagementObj.likes === "number" ? engagementObj.likes : 0);
        const replies = Number(typeof engagementObj.comments === "number" ? engagementObj.comments : 0);
        return {
          id: Number.isNaN(Number(r.id)) ? Date.now() : Number(r.id),
          platform,
          intent,
          excerpt: excerptText,
          keyword: "",
          reason,
          timeAgo: toTimeAgo(r.discovered_at),
          engagement: { replies, likes },
        } as Opportunity;
      })
      .filter(Boolean) as Opportunity[];
    setOpportunities(mapped);
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (cancelled) return;
      await load();
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { loading, error, tier, keywordsCount, opportunities, reload: load };
}


