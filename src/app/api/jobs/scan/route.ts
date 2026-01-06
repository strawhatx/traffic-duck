import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { resolveTierFromProfile } from "@/lib/subscription";

import { searchReddit } from "@/lib/platforms/reddit";
import { searchTwitter } from "@/lib/platforms/twitter";
import { searchHackerNews } from "@/lib/platforms/hackernews";

import type { PlatformResult } from "@/lib/platforms/types";
import { judgeQueryToPostMatch, generateIntentsFromAI } from "@/lib/ai";
import {
  recencyBonusFromEngagement,
  engagementBonusFromEngagement,
} from "@/lib/scoring";

const supabase = supabaseAdmin;

/* ────────────────────────────────────────────────
   PRICING / USAGE POLICY (SOURCE OF TRUTH)
──────────────────────────────────────────────── */

type Tier = "free" | "early" | "builder";

type TierPolicy = {
  platforms: Array<"reddit" | "twitter" | "hackernews">;
  maxRunsPerMonth: number;
  maxConversationsPerMonth: number;
  /**
   * Light vs full analysis controls what we store:
   * - none: store no analysis
   * - light: store why_matters
   * - full: store why_matters and engagement_path
   */
  analysisLevel: "none" | "light" | "full";
  /** Per-run hard cap on new conversations inserted */
  maxConversationsPerRun?: number;
  /** Max number of keywords considered per run */
  maxKeywordsPerUser: number;
};

const TIER_POLICIES: Record<Tier, TierPolicy> = {
  free: {
    // Free users can choose ONE of Reddit or X (Twitter) per run.
    // We accept an optional `platform` in the POST body and enforce single-platform execution.
    platforms: ["reddit", "twitter"],
    maxRunsPerMonth: 5,
    maxConversationsPerMonth: 15,
    maxConversationsPerRun: 3,
    maxKeywordsPerUser: 3,
    analysisLevel: "none",
  },
  early: {
    platforms: ["reddit", "hackernews"],
    maxRunsPerMonth: 20,
    maxConversationsPerMonth: 200,
    maxKeywordsPerUser: 5,
    analysisLevel: "light",
  },
  builder: {
    platforms: ["reddit", "twitter", "hackernews"],
    maxRunsPerMonth: 50,
    maxConversationsPerMonth: 1000,
    maxKeywordsPerUser: 10,
    analysisLevel: "full",
  },
};

/* ────────────────────────────────────────────────
   HELPERS
──────────────────────────────────────────────── */

function monthStartISO() {
  const d = new Date();
  d.setUTCDate(1);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

async function getMonthlyUsage(userId: string) {
  const since = monthStartISO();

  const [{ count: runs }, { count: conversations }] = await Promise.all([
    supabase
      .from("runs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", since),

    supabase
      .from("search_results")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("discovered_at", since),
  ]);

  return {
    runs: runs ?? 0,
    conversations: conversations ?? 0,
  };
}

function assertUsageAllowed(
  usage: { runs: number; conversations: number },
  policy: TierPolicy
) {
  if (usage.runs >= policy.maxRunsPerMonth) {
    throw new Error("RUN_LIMIT_REACHED");
  }
  if (usage.conversations >= policy.maxConversationsPerMonth) {
    throw new Error("CONVERSATION_LIMIT_REACHED");
  }
}

async function startRun(userId: string) {
  await supabase.from("runs").insert({ user_id: userId });
}

function buildQuery(keyword: string) {
  return /\s/.test(keyword) ? `"${keyword}"` : keyword;
}

/* ────────────────────────────────────────────────
   CORE SEARCH EXECUTION
──────────────────────────────────────────────── */

const MAX_AI_EVAL = 40;

async function runPlatformSearch(args: {
  platform: "reddit" | "twitter" | "hackernews";
  userId: string;
  keywords: Array<{ id: string; keyword: string }>;
  remaining: number;
  analysisLevel: "none" | "light" | "full";
  intents?: string[];
}) {
  const { platform, userId, keywords, remaining, analysisLevel, intents } = args;

  let inserted = 0;
  const seenUrls = new Set<string>();
  const MAX_INTENTS_PER_CANDIDATE = 6;

  for (const kw of keywords) {
    if (inserted >= remaining) break;

    const query = buildQuery(kw.keyword);

    let batch: PlatformResult[] = [];
    if (platform === "reddit") batch = await searchReddit(query, 50);
    if (platform === "twitter") batch = await searchTwitter(query, 30);
    if (platform === "hackernews") batch = await searchHackerNews(query, 50);

    // Deduplicate within the fetched batch by URL
    const byUrlBatch = new Map<string, PlatformResult>();
    for (const r of batch) {
      if (!r?.url) continue;
      if (!byUrlBatch.has(r.url)) {
        byUrlBatch.set(r.url, r);
      }
    }

    // Filter out URLs we've already processed in this run
    const candidateUrls = Array.from(byUrlBatch.keys()).filter(
      (u) => !seenUrls.has(u)
    );
    if (candidateUrls.length === 0) continue;

    // Filter out URLs that already exist for this user/platform in DB
    const { data: existing } = await supabase
      .from("search_results")
      .select("url")
      .eq("user_id", userId)
      .eq("platform", platform)
      .in("url", candidateUrls);

    const existingUrlSet = new Set<string>((existing ?? []).map((r: any) => r.url));
    const filteredUrls = candidateUrls.filter((u) => !existingUrlSet.has(u));
    if (filteredUrls.length === 0) continue;

    // Mark these URLs as seen so we don't judge them again for other keywords this run
    for (const u of filteredUrls) seenUrls.add(u);

    const filteredCandidates = filteredUrls
      .map((u) => byUrlBatch.get(u)!)
      .slice(0, MAX_AI_EVAL);

    const judged: Array<{ r: PlatformResult; score: number; why?: string }> =
      [];

    for (const r of filteredCandidates) {
      let finalMatch = false;
      let finalScore = 0;
      let finalReason = "";

      const intentsToUse =
        Array.isArray(intents) && intents.length > 0
          ? intents.slice(0, MAX_INTENTS_PER_CANDIDATE)
          : [kw.keyword];

      for (const intentStr of intentsToUse) {
        const { match, score, reason } = await judgeQueryToPostMatch(
          intentStr,
          r.title,
          r.content ?? ""
        );
        if (match && score >= finalScore) {
          finalMatch = true;
          finalScore = score;
          finalReason = intents && intents.length > 0 ? `Intent: ${intentStr} — ${reason}` : reason;
        }
      }

      if (!finalMatch) continue;

      const bonus =
        recencyBonusFromEngagement(r.engagement) +
        engagementBonusFromEngagement(r.engagement);

      judged.push({
        r,
        score: finalScore + bonus,
        why: finalReason,
      });
    }

    const ranked = judged
      .sort((a, b) => b.score - a.score)
      .slice(0, remaining - inserted);

    if (!ranked.length) continue;

    const rows = ranked.map(({ r, why }) => ({
      user_id: userId,
      keyword_id: kw.id,
      platform,
      title: r.title,
      content: r.content ?? null,
      author: r.author,
      url: r.url,
      engagement: r.engagement ?? {},
      why_matters: analysisLevel !== "none" ? why ?? null : null,
      engagement_path:
        analysisLevel === "full"
          ? "Join the thread with a concise, value-first reply."
          : null,
    }));

    const { data } = await supabase
      .from("search_results")
      .upsert(rows, {
        onConflict: "user_id,platform,url",
        ignoreDuplicates: true,
      })
      .select("id");

    inserted += data?.length ?? 0;
  }

  return inserted;
}

/* ────────────────────────────────────────────────
   API HANDLER
──────────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId: string = body.userId;
    const requestedPlatform: "reddit" | "twitter" | "hackernews" | undefined =
      body.platform;
    const bodyIntents: string[] | undefined = Array.isArray(body.intents)
      ? body.intents.map((s: unknown) => String(s || "").trim()).filter(Boolean)
      : body.intent
      ? [String(body.intent)]
      : undefined;

    // 1. Resolve tier
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, subscription_status, price_id, niche, audience_intent")
      .eq("id", userId)
      .single();

    const tier = resolveTierFromProfile(profile ?? {}) as Tier;
    const policy = TIER_POLICIES[tier];

    // 2. Enforce usage
    const usage = await getMonthlyUsage(userId);
    assertUsageAllowed(usage, policy);

    // Remaining conversations available this month
    let monthlyRemaining =
      policy.maxConversationsPerMonth - usage.conversations;

    // 4. Load keywords
    const { data: keywords } = await supabase
      .from("keywords")
      .select("id, keyword")
      .eq("user_id", userId);

    if (!keywords?.length || monthlyRemaining <= 0) {
      return NextResponse.json({ ok: true, inserted: 0 });
    }

    // Enforce per-tier keyword cap
    const limitedKeywords = keywords.slice(0, policy.maxKeywordsPerUser);

    // Determine platforms to run:
    // - Free: allow user to choose ONE of allowed platforms; default to reddit.
    // - Others: run all platforms for the tier.
    let platformsToRun = policy.platforms;
    if (tier === "free") {
      const defaultFree = "reddit" as const;
      const chosen =
        requestedPlatform && policy.platforms.includes(requestedPlatform)
          ? requestedPlatform
          : defaultFree;
      platformsToRun = [chosen];
    }

    // Per-run cap (e.g., Free: 3)
    let runRemaining =
      policy.maxConversationsPerRun ?? Number.POSITIVE_INFINITY;

    // Prepare intents:
    // Priority: body.intents/body.intent > auto-generated from profile.niche/audience_intent
    let intentsToUse: string[] | undefined = bodyIntents;
    if ((!intentsToUse || intentsToUse.length === 0) && profile) {
      const niche = String((profile as any)?.niche || "").trim();
      const audienceIntent = String((profile as any)?.audience_intent || "").trim();
      const seed = [niche, audienceIntent].filter(Boolean).join(" ").trim();
      if (seed) {
        const generated = await generateIntentsFromAI(seed, 8);
        intentsToUse = generated;
      }
    }

    // 5. Execute searches
    let totalInserted = 0;

    for (const platform of platformsToRun) {
      const allowed = Math.min(monthlyRemaining, runRemaining);
      if (allowed <= 0) break;

      const inserted = await runPlatformSearch({
        platform,
        userId,
        keywords: limitedKeywords,
        remaining: allowed,
        analysisLevel: policy.analysisLevel,
        intents: intentsToUse,
      });

      totalInserted += inserted;
      monthlyRemaining -= inserted;
      runRemaining -= inserted;
    }

    // Count the run only if we actually inserted new conversations
    if (totalInserted > 0) {
      await startRun(userId);
    }

    return NextResponse.json({
      ok: true,
      tier,
      inserted: totalInserted,
      remaining: monthlyRemaining,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Job failed" },
      { status: 400 }
    );
  }
}

export const runtime = "nodejs";
