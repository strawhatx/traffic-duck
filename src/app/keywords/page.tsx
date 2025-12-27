"use client";

import { useEffect, useState } from "react";
import { Radar, Plus, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import KeywordDialog, { type KeywordDraft as DialogKeywordDraft } from "../../components/KeywordDialog";
import { supabase } from "@/lib/supabaseClient";
import { resolveTierFromProfile, SubscriptionTier } from "@/lib/subscription";
import { toast } from "sonner";
import { useRequireAuth } from "@/hooks/use-require-auth";

interface Keyword {
  id: string;
  phrase: string;
  platforms: {
    reddit: boolean;
    hackernews: boolean;
    twitter: boolean;
  };
  createdAt: string;
}

export default function Keywords() {
  const { loading, userId } = useRequireAuth();
  const [keywords, setKeywords] = useState<Keyword[]>([]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogInitial, setDialogInitial] = useState<DialogKeywordDraft | undefined>(undefined);
  const [tier, setTier] = useState<SubscriptionTier>("free");

  // Load subscription tier for current user
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_status, price_id")
        .eq("id", userId)
        .maybeSingle();
      if (!cancelled) setTier(resolveTierFromProfile(profile ?? undefined));
    };
    init();
    return () => {
      cancelled = true;
    };
  }, []);

  // Map DB platform[] to UI booleans
  const arrayToPlatforms = (arr: string[]) => ({
    reddit: arr?.includes("reddit") ?? false,
    hackernews: arr?.includes("hackernews") ?? false,
    twitter: arr?.includes("twitter") ?? false,
  });

  // Map UI booleans to DB platform[]
  const platformsToArray = (platforms: Keyword["platforms"]) => {
    const items: string[] = [];
    if (platforms.reddit) items.push("reddit");
    if (platforms.hackernews) items.push("hackernews");
    if (platforms.twitter) items.push("twitter");
    return items.length > 0 ? items : ["reddit"];
  };

  const mapRowToKeyword = (row: {
    id: string;
    keyword: string;
    platform: string[];
    created_at: string;
  }): Keyword => ({
    id: row.id,
    phrase: row.keyword,
    platforms: arrayToPlatforms(row.platform ?? []),
    createdAt: row.created_at ?? new Date().toISOString().split("T")[0],
  });

  // Load keywords for current user
  useEffect(() => {
    if (loading || !userId) return;
    let cancelled = false;
    const fetchKeywords = async () => {
      const { data, error } = await supabase
        .from("keywords")
        .select("id, keyword, platform, created_at")
        .order("created_at", { ascending: true });
      if (error) {
        toast.error("Failed to load keywords");
        return;
      }
      if (!cancelled && data) {
        setKeywords(data.map(mapRowToKeyword));
      }
    };
    fetchKeywords();
    return () => {
      cancelled = true;
    };
  }, [loading, userId]);

  const handleDelete = (id: string) => {
    void (async () => {
      const { error } = await supabase.from("keywords").delete().eq("id", id);
      if (error) {
        toast.error("Failed to delete keyword");
        return;
      }
      setKeywords((prev) => prev.filter((k) => k.id !== id));
    })();
  };

  const openAddDialog = () => {
    // Enforce 1 keyword for free/core
    const maxKeywords = 1;
    if ((tier === "free" || tier === "core") && keywords.length >= maxKeywords) {
      toast.error("Limit reached. Upgrade to Pro for more capacity.");
      return;
    }
    setEditingId(null);
    setDialogInitial({
      phrase: "",
      platforms: { reddit: true, hackernews: false, twitter: false },
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (keyword: Keyword) => {
    setEditingId(keyword.id);
    setDialogInitial({
      phrase: keyword.phrase,
      platforms: {
        reddit: keyword.platforms.reddit,
        hackernews: false,
        twitter: keyword.platforms.twitter,
      },
    });
    setIsDialogOpen(true);
  };

  const handleSubmitDraft = (draft: DialogKeywordDraft) => {
    // Enforce platform availability by tier
    const prev = editingId ? keywords.find((k) => k.id === editingId) : undefined;
    const desiredHackerNews = prev ? prev.platforms.hackernews : true;
    const safePlatforms = {
      reddit: draft.platforms.reddit,
      hackernews: desiredHackerNews,
      twitter: tier === "pro" ? draft.platforms.twitter : false,
    } as Keyword["platforms"];
    const platformArr = platformsToArray(safePlatforms);
    void (async () => {
      if (!userId) {
        toast.error("You must be signed in");
        return;
      }
      if (editingId === null) {
        const { data, error } = await supabase
          .from("keywords")
          .insert({ user_id: userId, keyword: draft.phrase, platform: platformArr })
          .select("id, keyword, platform, created_at")
          .maybeSingle();
        if (error || !data) {
          toast.error(error?.message ?? "Failed to add keyword");
          return;
        }
        setKeywords((prev) => [...prev, mapRowToKeyword(data)]);
      } else {
        const { data, error } = await supabase
          .from("keywords")
          .update({ keyword: draft.phrase, platform: platformArr })
          .eq("id", editingId)
          .select("id, keyword, platform, created_at")
          .maybeSingle();
        if (error || !data) {
          toast.error(error?.message ?? "Failed to save changes");
          return;
        }
        setKeywords((prev) => prev.map((k) => (k.id === editingId ? mapRowToKeyword(data) : k)));
      }
      setIsDialogOpen(false);
      setEditingId(null);
      setDialogInitial(undefined);
    })();
  };

  const getPlatformCount = (platforms: Keyword["platforms"]) => {
    return Object.values(platforms).filter(Boolean).length;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {loading ? (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="p-12 text-center">
            <Radar className="w-12 h-12 text-slate-300 mx-auto mb-4 animate-pulse" />
            <h3 className="text-lg mb-2">Checking your session...</h3>
          </Card>
        </div>
      ) : (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl mb-2">Manage Keywords</h1>
          <p className="text-slate-600">
            Add keywords or phrases to track across Reddit, Hacker News, and Twitter.
          </p>
        </div>

        <div className="mb-6">
          <Button onClick={openAddDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Add Keyword
          </Button>
        </div>

        <KeywordDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          initialValue={dialogInitial}
          onSubmit={handleSubmitDraft}
          title={editingId === null ? "Add New Keyword" : "Edit Keyword"}
          submitLabel={editingId === null ? "Add Keyword" : "Save Changes"}
          allowHackerNews={true}
          allowTwitter={tier === "pro"}
        />

        {/* Keywords List */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl">
            Your Keywords ({keywords.length})
          </h2>
          <p className="text-sm text-slate-600">
            Free plan: Max 1 niche · Core plan: Max 1 niche · Pro plan: Max 1 niche
          </p>
        </div>

    
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-3 lg:col-span-2">
            {keywords.map((keyword) => (
              <Card key={keyword.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg">{keyword.phrase}</h3>
                      <Badge variant="outline">
                        {getPlatformCount(keyword.platforms)} platform
                        {getPlatformCount(keyword.platforms) !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      {keyword.platforms.reddit && (
                        <Badge className="bg-orange-100 text-orange-800">
                          Reddit
                        </Badge>
                      )}
                      {keyword.platforms.twitter && (
                        <Badge className="bg-blue-100 text-blue-800">
                          Twitter
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mt-2">
                      Added on {new Date(keyword.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(keyword)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(keyword.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {keywords.length === 0 && (
              <Card className="p-12 text-center">
                <Radar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg mb-2">No keywords yet</h3>
                <p className="text-slate-600 mb-4">
                  Add your first keyword to start tracking conversations
                </p>
              </Card>
            )}
          </div>

          <div className="lg:col-span-1">
            {/* Info Card */}
            <Card className="p-6 bg-blue-50 border-blue-200">
              <h3 className="text-lg mb-2">💡 Tips for better keyword tracking</h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>• Use specific phrases like "project management for startups" instead of just "project management"</li>
                <li>• Include common variations and abbreviations (e.g., "CRM" and "customer relationship management")</li>
                <li>• Monitor competitor names and product categories relevant to your niche</li>
                <li>• Keep keywords focused - quality over quantity leads to better results</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
