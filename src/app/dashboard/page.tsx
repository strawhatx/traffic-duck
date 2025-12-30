"use client";

import { useEffect, useMemo, useState } from "react";
import { Radar, TrendingUp, MessageSquare, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

type SearchResult = {
  id: string;
  platform: "reddit" | "twitter" | "instagram";
  title: string;
  content: string | null;
  author: string;
  url: string;
  engagement: Record<string, unknown> | null;
  why_matters: string | null;
  discovered_at: string | null;
};

export default function Dashboard() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [platformFilter, setPlatformFilter] = useState<"all" | "reddit" | "twitter">("all");
  const [search, setSearch] = useState<string>("");
  const [limit, setLimit] = useState<number>(50);

  useEffect(() => {
    let cancelled = false;
    const loadResults = async () => {
      setLoading(true);
      setError(null);
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("search_results")
        .select("id, platform, title, content, author, url, engagement, why_matters, discovered_at")
        .order("discovered_at", { ascending: false, nullsFirst: false })
        .limit(limit);

      if (cancelled) return;
      if (error) {
        setError("Failed to load results");
        setResults([]);
      } else {
        setResults((data ?? []) as SearchResult[]);
      }
      setLoading(false);
    };
    void loadResults();
    return () => {
      cancelled = true;
    };
  }, [limit]);
  
  const filteredResults = useMemo(() => {
    const text = search.trim().toLowerCase();
    return results.filter((r) => {
      const matchesPlatform = platformFilter === "all" ? true : r.platform === platformFilter;
      const hay = `${r.title ?? ""} ${r.content ?? ""} ${r.author ?? ""} ${r.why_matters ?? ""}`.toLowerCase();
      const matchesSearch = text.length === 0 ? true : hay.includes(text);
      return matchesPlatform && matchesSearch;
    });
  }, [results, platformFilter, search]);

  const weekStats = useMemo(() => {
    // eslint-disable-next-line react-hooks/purity
    const now = Date.now();
    let thisWeek = 0;
    let reddit = 0;
    let twitter = 0;
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    for (const r of results) {
      if (r.platform === "reddit") reddit += 1;
      if (r.platform === "twitter") twitter += 1;
      const ts = r.discovered_at ? Date.parse(r.discovered_at) : 0;
      if (!Number.isNaN(ts) && ts >= weekAgo) thisWeek += 1;
    }
    return { thisWeek, reddit, twitter };
  }, [results]);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-6">
        
            <div>
              <Button asChild>
                <Link href="/keywords">
                  <Radar className="w-4 h-4 mr-2 shrink-0" />
                  Manage Keywords
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">
                    This Week
                  </p>
                  <p className="text-3xl">{weekStats.thisWeek}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-600" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">
                    Reddit Results
                  </p>
                  <p className="text-3xl">{weekStats.reddit}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">
                    Twitter Results
                  </p>
                  <p className="text-3xl">{weekStats.twitter}</p>
                </div>
                <Radar className="w-8 h-8 text-purple-600" />
              </div>
            </Card>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4 items-center">
          <Input
            placeholder="Search conversations..."
            className="max-w-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex gap-2">
            <Badge
              variant="outline"
              className={`cursor-pointer ${platformFilter === "all" ? "bg-slate-200" : ""}`}
              onClick={() => setPlatformFilter("all")}
            >
              All
            </Badge>
            <Badge
              variant="outline"
              className={`cursor-pointer ${platformFilter === "reddit" ? "bg-slate-200" : ""}`}
              onClick={() => setPlatformFilter("reddit")}
            >
              Reddit
            </Badge>
            <Badge
              variant="outline"
              className={`cursor-pointer ${platformFilter === "twitter" ? "bg-slate-200" : ""}`}
              onClick={() => setPlatformFilter("twitter")}
            >
              Twitter
            </Badge>
          </div>
        </div>

        {/* Conversations List */}
        <div className="space-y-4">
          {loading && (
            <Card className="p-6">
              <p className="text-sm text-slate-600">Loading conversations…</p>
            </Card>
          )}
          {!loading && filteredResults.length === 0 && (
            <Card className="p-6">
              <p className="text-sm text-slate-600">
                {error ? error : "No conversations found. Try adjusting filters."}
              </p>
            </Card>
          )}
          {filteredResults.map((conversation) => {
            const isReddit = conversation.platform === "reddit";
            const engagement = conversation.engagement ?? {};
            const engagementObj = engagement as Record<string, unknown>;
            const upvotes = Number(
              typeof engagementObj.upvotes === "number" ? engagementObj.upvotes : 0,
            );
            const likes = Number(
              typeof engagementObj.likes === "number" ? engagementObj.likes : 0,
            );
            const comments = Number(
              typeof engagementObj.comments === "number" ? engagementObj.comments : 0,
            );
            return (
              <Card key={conversation.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                  {/* Platform Icon */}
                  <div className="shrink-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isReddit ? "bg-orange-100" : "bg-blue-100"
                      }`}
                    >
                      <MessageSquare
                        className={`w-5 h-5 ${isReddit ? "text-orange-600" : "text-blue-600"}`}
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg mb-1">{conversation.title}</h3>
                        <p className="text-sm text-slate-600">
                          {conversation.author}
                        </p>
                      </div>
                    </div>

                    {conversation.content && (
                      <p className="text-slate-700 mb-3">{conversation.content}</p>
                    )}

                    {(engagement && (conversation.why_matters || comments || upvotes || likes)) && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                        <p className="text-sm">
                          <strong>Why it matters:</strong>{" "}
                          {conversation.why_matters
                            ? conversation.why_matters
                            : "High-signal audience overlap and actionable conversation."}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex gap-4 text-sm text-slate-600">
                        <span>👍 {isReddit ? upvotes : likes}</span>
                        <span>💬 {comments} comments</span>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Save
                        </Button>
                        <Button size="sm" asChild>
                          <a href={conversation.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View & Engage
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <Button
            variant="outline"
            onClick={() => setLimit((l) => l + 50)}
            disabled={loading}
          >
            Load More Conversations
          </Button>
        </div>
      </div>
    </div>
  );
}