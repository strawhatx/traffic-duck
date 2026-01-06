"use client";

import { useEffect, useMemo, useState } from "react";
import { Radio, CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type ScanStatus = "idle" | "starting" | "running" | "complete" | "error";
type ItemStatus = "pending" | "scanning" | "complete" | "failed";

type ScanProgress = {
  platform: string;
  status: ItemStatus;
  found: number;
};

function mapPlatformLabel(p: string): string | null {
  if (p === "reddit") return "Reddit";
  if (p === "hackernews") return "Hacker News";
  if (p === "twitter") return "X (Twitter)";
  return null;
}

export default function Page() {
  const router = useRouter();
  const [status, setStatus] = useState<ScanStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState<ScanProgress[]>([
    { platform: "Reddit", status: "pending", found: 0 },
    { platform: "Hacker News", status: "pending", found: 0 },
    { platform: "X (Twitter)", status: "pending", found: 0 },
  ]);

  const totalFound = useMemo(
    () => progress.reduce((sum, p) => sum + (p.found || 0), 0),
    [progress],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setStatus("starting");
      // Auth check
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) {
        router.push("/sign-in");
        return;
      }

      if (!cancelled) {
        setStatus("running");
        setProgress((prev) => prev.map((p) => ({ ...p, status: "scanning" })));
      }

      try {
        // Kick off scan job for this user
        const res = await fetch("/api/jobs/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(txt || "Scan request failed");
        }

        // Fetch latest results and compute per-platform counts
        const { data, error } = await supabase
          .from("search_results")
          .select("platform")
          .eq("user_id", userId)
          .order("discovered_at", { ascending: false, nullsFirst: false })
          .limit(200);
        if (error) throw error;

        const counts = { reddit: 0, hackernews: 0, twitter: 0 };
        for (const r of (data ?? []) as Array<{ platform: string }>) {
          if (r.platform === "reddit") counts.reddit += 1;
          if (r.platform === "hackernews") counts.hackernews += 1;
          if (r.platform === "twitter") counts.twitter += 1;
        }

        if (!cancelled) {
          setProgress([
            { platform: "Reddit", status: "complete", found: counts.reddit },
            { platform: "Hacker News", status: "complete", found: counts.hackernews },
            { platform: "X (Twitter)", status: "complete", found: counts.twitter },
          ]);
          setStatus("complete");
        }
      } catch (e: any) {
        if (!cancelled) {
          setErrorMessage(e?.message ?? "Unknown error");
          setProgress((prev) => prev.map((p) => ({ ...p, status: "failed" })));
          setStatus("error");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const onComplete = async () => {
    // Build mapped results for results page
    try {
      const { data } = await supabase
        .from("search_results")
        .select("id, platform, title, content, url, engagement, why_matters, discovered_at")
        .order("discovered_at", { ascending: false, nullsFirst: false })
        .limit(25);
      const rows = (data ?? []) as any[];
      const toPlatform = (p: string) => (p === "reddit" ? "Reddit" : p === "hackernews" ? "Hacker News" : p === "twitter" ? "X" : null);
      const toTimeAgo = (iso?: string | null) => {
        if (!iso) return "";
        const then = Date.parse(iso);
        if (Number.isNaN(then)) return "";
        const diff = Date.now() - then;
        const m = Math.floor(diff / 60000);
        if (m < 60) return `${m}m ago`;
        const h = Math.floor(m / 60);
        if (h < 24) return `${h}h ago`;
        return `${Math.floor(h / 24)}d ago`;
      };
      const mapped = rows
        .map((r) => {
          const platform = toPlatform(r.platform);
          if (!platform) return null;
          const eng = (r.engagement ?? {}) as Record<string, unknown>;
          const likes = Number(typeof eng.likes === "number" ? eng.likes : 0);
          const comments = Number(typeof eng.comments === "number" ? eng.comments : 0);
          const upvotes = Number(typeof eng.upvotes === "number" ? eng.upvotes : 0);
          const score = likes + comments + upvotes;
          const intent = score >= 30 ? "high" : score >= 10 ? "medium" : "low";
          return {
            id: Number.isNaN(Number(r.id)) ? Date.now() : Number(r.id),
            platform,
            intent,
            excerpt: (r.content ?? r.title ?? "").toString(),
            keyword: "",
            reason: r.why_matters ?? "High-signal audience overlap and actionable conversation.",
            timeAgo: toTimeAgo(r.discovered_at),
            engagement: { replies: comments, likes },
          };
        })
        .filter(Boolean);
      try {
        sessionStorage.setItem("td_scan_results", JSON.stringify(mapped));
      } catch {}
    } finally {
      router.push("/results");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Radio className="w-10 h-10 text-blue-600 animate-pulse" />
          </div>
          <h1 className="text-gray-900 mb-2">Scanning the Internet</h1>
          {status === "error" ? (
            <p className="text-red-600">Scan failed{errorMessage ? `: ${errorMessage}` : ""}</p>
          ) : (
            <p className="text-gray-600">Searching for high-intent conversations across platforms...</p>
          )}
        </div>

        {/* Progress Cards */}
        <div className="space-y-4 mb-8">
          {progress.map((item) => (
            <div
              key={item.platform}
              className={`bg-white border rounded-lg p-6 transition-all duration-300 ${
                item.status === "scanning"
                  ? "border-blue-500 shadow-lg"
                  : item.status === "complete"
                  ? "border-green-500"
                  : item.status === "failed"
                  ? "border-red-500"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {item.status === "pending" && <div className="w-6 h-6 rounded-full border-2 border-gray-300" />}
                  {item.status === "scanning" && <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />}
                  {item.status === "complete" && <CheckCircle2 className="w-6 h-6 text-green-600" />}
                  {item.status === "failed" && <div className="w-6 h-6 rounded-full border-2 border-red-500" />}

                  <div>
                    <div className="text-gray-900">{item.platform}</div>
                    {item.status === "scanning" && <div className="text-sm text-blue-600">Scanning now...</div>}
                    {item.status === "complete" && (
                      <div className="text-sm text-green-600">
                        Found {item.found} {item.found === 1 ? "opportunity" : "opportunities"}
                      </div>
                    )}
                    {item.status === "failed" && <div className="text-sm text-red-600">Failed</div>}
                    {item.status === "pending" && <div className="text-sm text-gray-400">Waiting...</div>}
                  </div>
                </div>

                {item.status === "complete" && <div className="text-2xl text-green-600">{item.found}</div>}
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        {status === "complete" && (
          <div className="bg-linear-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6 mb-6 animate-in fade-in duration-500">
            <div className="text-center">
              <div className="text-4xl mb-2">{totalFound}</div>
              <div className="text-gray-600 mb-4">Total opportunities found</div>
              <button onClick={onComplete} className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                View Results
              </button>
            </div>
          </div>
        )}

        {/* Live Updates */}
        {status === "running" && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
              Scanning in progress...
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-full text-sm">
              <div className="w-2 h-2 bg-red-600 rounded-full" />
              Scan failed. Please try again.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


