import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { resolveTierFromProfile, getPlanLimits, type SubscriptionTier } from "@/lib/subscription";
import type { PlatformKeywords } from "@/components/keywords/PlatformKeywordsCard";

function mapDbToUiPlatform(p: string): PlatformKeywords["platform"] | null {
    if (p === "twitter") return "X";
    if (p === "reddit") return "Reddit";
    if (p === "hackernews") return "Hacker News";
    return null;
}
function mapUiToDbPlatform(p: PlatformKeywords["platform"]): string {
    if (p === "X") return "twitter";
    if (p === "Reddit") return "reddit";
    return "hackernews";
}

export function useKeywords() {
    const [platformKeywords, setPlatformKeywords] = useState<PlatformKeywords[]>([
        // Order: Reddit, Hacker News, X
        { platform: "Reddit", enabled: true, keywords: [] },
        { platform: "Hacker News", enabled: true, keywords: [] },
        { platform: "X", enabled: true, keywords: [] },
    ]);
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [tier, setTier] = useState<SubscriptionTier>("free");
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const init = async () => {
            setLoading(true);
            const { data: userData } = await supabase.auth.getUser();
            const uid = userData?.user?.id ?? null;
            if (!uid) {
                setUserId(null);
                setLoading(false);
                return;
            }
            setUserId(uid);
            const { data: profile } = await supabase
                .from("profiles")
                .select("subscription_status, price_id")
                .eq("id", uid)
                .maybeSingle();
            if (!cancelled) setTier(resolveTierFromProfile(profile ?? undefined));

            const { data, error } = await supabase.from("keywords").select("id, keyword, platform").eq("user_id", uid);
            if (!cancelled) {
                if (error || !data) {
                    setLoading(false);
                    return;
                }
                const byPlatform: Record<PlatformKeywords["platform"], Set<string>> = {
                    X: new Set<string>(),
                    Reddit: new Set<string>(),
                    "Hacker News": new Set<string>(),
                };
                for (const row of data) {
                    const platforms: string[] = Array.isArray((row as any).platform) ? (row as any).platform : [];
                    for (const dbp of platforms) {
                        const up = mapDbToUiPlatform(dbp);
                        if (up) byPlatform[up].add((row as any).keyword as string);
                    }
                }
                setPlatformKeywords([
                    { platform: "Reddit", enabled: byPlatform["Reddit"].size > 0, keywords: Array.from(byPlatform["Reddit"]) },
                    {
                        platform: "Hacker News",
                        enabled: byPlatform["Hacker News"].size > 0,
                        keywords: Array.from(byPlatform["Hacker News"]),
                    },
                    { platform: "X", enabled: byPlatform["X"].size > 0, keywords: Array.from(byPlatform["X"]) },
                ]);
                setLoading(false);
            }
        };
        void init();
        return () => {
            cancelled = true;
        };
    }, []);

    const planLimits = getPlanLimits(tier);
    const maxKeywords = typeof planLimits.maxKeywords === "number" ? planLimits.maxKeywords : 9999;
    const allowed = useMemo(() => {
        return {
            Reddit: true,
            "Hacker News": tier !== "free",
            X: tier === "builder",
        } as Record<PlatformKeywords["platform"], boolean>;
    }, [tier]);
    const totalKeywords = useMemo(() => {
        return platformKeywords.reduce((sum, p) => {
            if (!allowed[p.platform]) return sum;
            return sum + (p.enabled ? p.keywords.filter((k) => k.trim()).length : 0);
        }, 0);
    }, [platformKeywords, allowed]);

    const addKeyword = (platformIndex: number) => {
        setPlatformKeywords((prev) => {
            const copy = [...prev];
            copy[platformIndex] = { ...copy[platformIndex], keywords: [...copy[platformIndex].keywords, ""] };
            return copy;
        });
    };
    const removeKeyword = (platformIndex: number, keywordIndex: number) => {
        setPlatformKeywords((prev) => {
            const copy = [...prev];
            copy[platformIndex] = {
                ...copy[platformIndex],
                keywords: copy[platformIndex].keywords.filter((_, i) => i !== keywordIndex),
            };
            return copy;
        });
    };
    const updateKeyword = (platformIndex: number, keywordIndex: number, value: string) => {
        setPlatformKeywords((prev) => {
            const copy = [...prev];
            const kws = [...copy[platformIndex].keywords];
            kws[keywordIndex] = value;
            copy[platformIndex] = { ...copy[platformIndex], keywords: kws };
            return copy;
        });
    };
    const togglePlatform = (platformIndex: number) => {
        setPlatformKeywords((prev) => {
            const copy = [...prev];
            copy[platformIndex] = { ...copy[platformIndex], enabled: !copy[platformIndex].enabled };
            return copy;
        });
    };

    const saveAll = async (): Promise<boolean> => {
        if (!userId) return false;
        const clean = platformKeywords.map((pk) => ({
            platform: pk.platform,
            keywords: pk.enabled ? pk.keywords.map((k) => k.trim()).filter(Boolean) : [],
        }));
        const flattened = clean.flatMap((pk) => pk.keywords.map((k) => ({ p: pk.platform, k })));
        const filtered = flattened.filter(({ p }) => allowed[p]);
        if (flattened.length === 0) throw new Error("Add at least one keyword.");
        if (filtered.length === 0) throw new Error("Your plan does not include the selected platforms.");
        if (filtered.length > maxKeywords) throw new Error(`Limit reached: ${maxKeywords} keywords on ${tier} plan.`);
        setSaving(true);
        try {
            const { error: delErr } = await supabase.from("keywords").delete().eq("user_id", userId);
            if (delErr) throw delErr;
            const rows = filtered.map(({ p, k }) => ({
                user_id: userId,
                keyword: k,
                platform: [mapUiToDbPlatform(p)],
            }));
            if (rows.length > 0) {
                const { error: insErr } = await supabase.from("keywords").insert(rows);
                if (insErr) throw insErr;
            }
            return true;
        } finally {
            setSaving(false);
        }
    };

    return {
        loading,
        saving,
        tier,
        totalKeywords,
        platformKeywords,
        addKeyword,
        removeKeyword,
        updateKeyword,
        togglePlatform,
        saveAll,
        allowed,
    };
}


