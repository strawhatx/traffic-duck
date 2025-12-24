"use server";

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { resolveTierFromProfile, getPlanLimits } from "@/lib/subscription";
import { searchReddit } from "@/lib/platforms/reddit";
import { searchTwitter } from "@/lib/platforms/twitter";
import type { PlatformResult } from "@/lib/platforms/types";
import { generateIntentsFromNiche } from "@/lib/intents";

async function fetchExistingUrls(userId: string, intent: string): Promise<Set<string>> {
  const urls = new Set<string>();
  const { data } = await supabaseAdmin
    .from("search_results").select("url")
    .eq("user_id", userId).eq("intent", intent);
  
  (data ?? []).forEach((r: any) => urls.add(r.url));
  return urls;
}

async function insertResults(
  userId: string,
  intent: string,
  platform: "reddit"| "twitter",
  items: PlatformResult[],
  withAnalysis: boolean
) {
  if (items.length === 0) return 0;
  const rows = items.map((r) => ({
    user_id: userId,
    intent,
    platform,
    title: r.title,
    content: r.content ?? null,
    author: r.author,
    url: r.url,
    engagement: r.engagement ?? {},
    why_matters: withAnalysis ? "High-signal audience overlap and actionable conversation." : null,
    engagement_path: withAnalysis ? "Join thread with a concise, value-first reply." : null,
  }));
  
  const { data, error } = await supabaseAdmin.from("search_results").insert(rows).select("id");
  if (error) {
    // Swallow DB errors to keep job running for other users/keywords
    return 0;
  }

  return data?.length ?? 0;
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch users with niche descriptions
    const { data: profiles, error: pErr } = await supabaseAdmin
      .from("profiles")
      .select("id, niche_description, subscription_status, price_id")
      .not("niche_description", "is", null);
    if (pErr) return NextResponse.json({ error: "Failed to load profiles" }, { status: 500 });

    let totalInserted = 0;
    for (const profile of profiles ?? []) {
      const userId = profile.id as string;
      const niche = (profile.niche_description as string) || "";
      const tier = resolveTierFromProfile({
        subscription_status: profile.subscription_status,
        price_id: profile.price_id,
      });
      
      const limits = getPlanLimits(tier);
      const allowedTierPlatforms =
        tier === "free" ? (["reddit"] as const) : tier === "core" ? (["reddit"] as const) : (["reddit", "twitter"] as const);
      const maxPerKeyword =
        tier === "pro" ? 20 : tier === "core" ? (typeof limits.maxWeeklyResultsPerKeyword === "number" ? limits.maxWeeklyResultsPerKeyword : 12) : 2;
      const withAnalysis = tier !== "free";

      // Generate intents and respect maxKeywords per tier (niches mapped to intent count)
      const intents = await generateIntentsFromNiche(niche);
      const maxKeywords = limits.maxKeywords === "unlimited" ? Infinity : limits.maxKeywords;
      const selectedIntents = intents.slice(0, Math.max(0, maxKeywords));

      for (const intent of selectedIntents) {
        // Scan platforms
        const platformArray = Array.from(allowedTierPlatforms) as Array<"reddit" | "twitter">;
        const seen = await fetchExistingUrls(userId, intent);
        const toInsert: { [P in "reddit" | "twitter"]?: PlatformResult[] } = {};

        for (const p of platformArray) {
          const remaining = Math.max(0, maxPerKeyword);
          if (remaining === 0) continue;
          let results: PlatformResult[] = [];
          if (p === "reddit") {
            results = await searchReddit(intent, remaining);
          } else if (p === "twitter") {
            results = await searchTwitter(intent, remaining);
          }
          // Dedupe by URL and trim to remaining
          const filtered: PlatformResult[] = [];
          for (const r of results) {
            if (!r.url || seen.has(r.url)) continue;
            seen.add(r.url);
            filtered.push(r);
            if (filtered.length >= remaining) break;
          }
          if (filtered.length > 0) {
            toInsert[p] = filtered;
          }
        }

        for (const p of Object.keys(toInsert) as Array<"reddit" | "twitter">) {
          totalInserted += await insertResults(userId, intent, p, toInsert[p]!, withAnalysis);
        }
      }
    }

    return NextResponse.json({ ok: true, inserted: totalInserted });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Job failed" }, { status: 500 });
  }
}

export const runtime = "nodejs";


