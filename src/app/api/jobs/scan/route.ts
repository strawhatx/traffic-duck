import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { resolveTierFromProfile } from "@/lib/subscription";
import { searchReddit } from "@/lib/platforms/reddit";
import { searchTwitter } from "@/lib/platforms/twitter";
import { searchHackerNews } from "@/lib/platforms/hackernews";
import type { PlatformResult } from "@/lib/platforms/types";
import { judgeQueryToPostMatch } from "@/lib/ai";
import { recencyBonusFromEngagement, engagementBonusFromEngagement } from "@/lib/scoring";

async function fetchExistingUrls(userId: string, keywordId: string): Promise<Set<string>> {
  const urls = new Set<string>();
  const { data } = await supabaseAdmin
    .from("search_results").select("url")
    .eq("user_id", userId).eq("keyword_id", keywordId);

  for (const row of (data as Array<{ url: string }> | null) ?? []) {
    urls.add(row.url);
  }
  return urls;
}

async function countTodayResultsForKeyword(userId: string, keywordId: string): Promise<number> {
  const now = new Date();
  const utcMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const since = utcMidnight.toISOString();
  const { count } = await supabaseAdmin
    .from("search_results")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("keyword_id", keywordId)
    .gte("discovered_at", since);
  return count ?? 0;
}

async function insertResults(
  userId: string,
  keywordId: string,
  platform: "reddit" | "twitter" | "hackernews",
  items: PlatformResult[],
  withAnalysis: boolean,
  analysisByUrl?: Record<string, { why?: string; path?: string }>
) {
  if (items.length === 0) return 0;
  const rows = items.map((r) => ({
    user_id: userId,
    keyword_id: keywordId,
    platform,
    title: r.title,
    content: r.content ?? null,
    author: r.author,
    url: r.url,
    engagement: r.engagement ?? {},
    why_matters: withAnalysis
      ? (analysisByUrl?.[r.url]?.why ??
        "High-signal audience overlap and actionable conversation.")
      : null,
    engagement_path: withAnalysis
      ? (analysisByUrl?.[r.url]?.path ??
        "Join thread with a concise, value-first reply.")
      : null,
  }));

  const { data, error } = await supabaseAdmin.from("search_results").insert(rows).select("id");
  if (error) {
    // Swallow DB errors to keep job running for other users/keywords
    return 0;
  }

  return data?.length ?? 0;
}

type Tier = "free" | "early" | "builder";

type UserKeyword = {
  id: string;
  keyword: string;
  platform: string[];
};

type TierConfig = {
  allowedPlatforms: ReadonlyArray<"reddit" | "twitter" | "hackernews">;
  maxPerIntentPerDay: number;
  withAnalysis: boolean;
};

function coercePlatformArray(value: unknown): string[] {
  return Array.isArray(value) ? (value as string[]) : [];
}

function buildQueryString(keyword: string): string {
  return /\s/.test(keyword) ? `"${keyword}"` : keyword;
}

const MAX_AI_EVAL = 40; // bound cost per keyword per platform

function getTierConfig(tier: Tier): TierConfig {
  const allowedPlatforms =
    tier === "free"
      ? ([] as const)
      : tier === "early"
        ? (["twitter"] as const)
        : (["reddit", "twitter", "hackernews"] as const);
  const maxPerIntentPerDay = tier === "builder" ? 7 : tier === "early" ? 3 : 0;
  const withAnalysis = tier !== "free";
  return { allowedPlatforms, maxPerIntentPerDay, withAnalysis };
}

function getRetentionDays(tier: Tier): number {
  // Free: no history (purge everything older than "now")
  // Early: 30 days
  // Builder: 60 days
  if (tier === "early") return 30;
  if (tier === "builder") return 60;
  return 0;
}

async function runPlatformJob(params: {
  platform: "reddit" | "twitter" | "hackernews";
  userId: string;
  userKeywordRows: UserKeyword[];
  dailyCap: number;
  withAnalysisFlag: boolean;
}): Promise<number> {
  const { platform, userId, userKeywordRows, dailyCap, withAnalysisFlag } = params;

  const applicable = userKeywordRows.filter((k) => {
    const arr = k.platform || [];
    return arr.includes(platform) || arr.includes("all");
  });
  if (applicable.length === 0) return 0;

  let inserted = 0;
  for (const kw of applicable) {
    const todayCount = await countTodayResultsForKeyword(userId, kw.id);
    const maxTop = 10;
    const dailyRemaining = Math.max(0, Math.min(dailyCap, maxTop) - todayCount);
    if (dailyRemaining === 0) continue;

    const seen = await fetchExistingUrls(userId, kw.id);
    const collected: PlatformResult[] = [];
    const queryStr = buildQueryString(kw.keyword);
    let batch: PlatformResult[] = [];
    if (platform === "reddit") {
      batch = await searchReddit(queryStr, Math.max(10, dailyRemaining * 2));
    } else if (platform === "twitter") {
      batch = await searchTwitter(queryStr, Math.max(10, dailyRemaining * 3));
    } else if (platform === "hackernews") {
      batch = await searchHackerNews(queryStr, Math.max(10, dailyRemaining * 2));
    }

    for (const r of batch) {
      if (!r.url || seen.has(r.url)) continue;
      seen.add(r.url);
      collected.push(r);
    }

    const aiTargets = collected.slice(0, Math.min(collected.length, MAX_AI_EVAL));
    const analysisByUrl: Record<string, { why?: string; path?: string }> = {};
    const judged: Array<{ r: PlatformResult; ai: number; final: number }> = [];

    for (const r of aiTargets) {
      const { match, score, reason } = await judgeQueryToPostMatch(
        kw.keyword,
        r.title,
        r.content ?? "",
      );
      if (!match) continue; // drop non-matches
      const bonus = recencyBonusFromEngagement(r.engagement) + engagementBonusFromEngagement(r.engagement);
      const final = score + bonus;
      judged.push({ r, ai: score, final });
      if (withAnalysisFlag && reason) {
        analysisByUrl[r.url] = { why: reason };
      }
    }

    const ranked = judged
      .sort((a, b) => b.final - a.final)
      .slice(0, dailyRemaining)
      .map((x) => x.r);
    if (ranked.length === 0) continue;
    inserted += await insertResults(userId, kw.id, platform, ranked, withAnalysisFlag, analysisByUrl);
  }
  return inserted;
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Load active keywords for all users
    const { data: allKeywords, error: kErr } = await supabaseAdmin
      .from("keywords")
      .select("id, user_id, keyword, platform, active")
      .eq("active", true);
    if (kErr) return NextResponse.json({ error: "Failed to load keywords" }, { status: 500 });

    const userIdToKeywords = new Map<string, UserKeyword[]>();
    for (const row of (allKeywords as Array<{ id: string; user_id: string; keyword: string; platform: unknown }> | null) ?? []) {
      const list = userIdToKeywords.get(row.user_id) ?? [];
      list.push({ id: row.id, keyword: row.keyword, platform: coercePlatformArray(row.platform) });
      userIdToKeywords.set(row.user_id, list);
    }

    const userIds = Array.from(userIdToKeywords.keys());
    if (userIds.length === 0) {
      return NextResponse.json({ ok: true, inserted: 0 });
    }

    // Fetch profiles for those users to resolve tier
    const { data: profiles, error: pErr } = await supabaseAdmin
      .from("profiles")
      .select("id, subscription_status, price_id")
      .in("id", userIds);
    if (pErr) return NextResponse.json({ error: "Failed to load profiles" }, { status: 500 });

    let totalInserted = 0;
    for (const profile of (profiles as Array<{ id: string; subscription_status: string | null; price_id: string | null }> | null) ?? []) {
      const userId = profile.id as string;
      const userKeywords = userIdToKeywords.get(userId) ?? [];
      const tier = resolveTierFromProfile({
        subscription_status: profile.subscription_status,
        price_id: profile.price_id,
      });

      const { allowedPlatforms, maxPerIntentPerDay, withAnalysis } = getTierConfig(tier as Tier);

      // Platform-specific queries and ingestion (lean)
      const platformArray = Array.from(allowedPlatforms) as Array<"reddit" | "twitter" | "hackernews">;
      for (const platform of platformArray) {
        totalInserted += await runPlatformJob({
          platform,
          userId,
          userKeywordRows: userKeywords,
          dailyCap: maxPerIntentPerDay,
          withAnalysisFlag: withAnalysis,
        });
      }

      // Retention policy (FIFO by discovered_at)
      const retentionDays = getRetentionDays(tier as Tier);
      const cutoffIso =
        retentionDays > 0
          ? new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000).toISOString()
          : new Date().toISOString();
      // Delete older than cutoff for this user
      await supabaseAdmin
        .from("search_results")
        .delete()
        .eq("user_id", userId)
        .lt("discovered_at", cutoffIso);
    }

    return NextResponse.json({ ok: true, inserted: totalInserted });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Job failed" }, { status: 500 });
  }
}

export const runtime = "nodejs";