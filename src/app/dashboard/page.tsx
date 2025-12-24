"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Radar, TrendingUp, MessageSquare, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import NicheDialog from "@/components/NicheDialog";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

// Mock data for conversations
const mockConversations = [
  {
    id: 1,
    platform: "reddit",
    title: "Looking for a good email marketing tool for small business",
    excerpt:
      "I've been using MailChimp but it's getting too expensive. Any recommendations for something similar but more affordable?",
    relevance: "high",
    upvotes: 47,
    comments: 23,
    timeAgo: "2 hours ago",
    subreddit: "r/smallbusiness",
    engagement: "Medium traffic - Quick response recommended",
  },
  {
    id: 2,
    platform: "twitter",
    title: "Thread asking for productivity tools for remote teams",
    excerpt:
      "Looking for the best productivity tools for remote teams — what's working for you?",
    relevance: "medium",
    likes: 134,
    comments: 45,
    timeAgo: "5 hours ago",
    handle: "@productivityhacks",
    engagement: "High engagement - Audience is active",
  },
  {
    id: 3,
    platform: "reddit",
    title: "Struggling with project management software",
    excerpt:
      "Our team of 10 is growing fast and Trello isn't cutting it anymore. What do you guys use?",
    relevance: "high",
    upvotes: 89,
    comments: 56,
    timeAgo: "6 hours ago",
    subreddit: "r/startups",
    engagement: "Hot thread - Many similar pain points expressed",
  },
];

export default function Dashboard() {
  const [niche, setNiche] = useState<string>("");
  const [nicheOpen, setNicheOpen] = useState(false);
  const [nicheInitial, setNicheInitial] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("niche_description")
        .eq("id", userId)
        .maybeSingle();
      if (!cancelled) setNiche(profile?.niche_description ?? "");
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const openNicheDialog = () => {
    setNicheInitial(niche || "");
    setNicheOpen(true);
  };

  const handleSaveNiche = (value: string) => {
    void (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) {
        toast.error("You must be signed in");
        return;
      }
      const { error } = await supabase.from("profiles").update({ niche_description: value }).eq("id", userId);
      if (error) {
        toast.error("Failed to save niche");
        return;
      }
      setNiche(value);
      setNicheOpen(false);
      toast.success("Niche updated");
    })();
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl mb-2">Conversation Radar</h1>
              <p className="text-slate-600">
                Tracking conversations for: <strong>SaaS productivity tools</strong>
              </p>
            </div>
            <div>
              <Button onClick={openNicheDialog}>
                <Radar className="w-4 h-4 mr-2 shrink-0" />
                Update Niche
              </Button>
              <NicheDialog
                open={nicheOpen}
                onOpenChange={setNicheOpen}
                initialValue={nicheInitial}
                onSubmit={handleSaveNiche}
                title="Describe Your Niche"
                submitLabel="Save Niche"
              />
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
                  <p className="text-3xl">12</p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-600" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">
                    High Relevance
                  </p>
                  <p className="text-3xl">8</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">
                    Avg. Response Time
                  </p>
                  <p className="text-3xl">4.2h</p>
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
          />
          <div className="flex gap-2">
            <Badge variant="outline" className="cursor-pointer">All</Badge>
            <Badge variant="outline" className="cursor-pointer">Reddit</Badge>
            <Badge variant="outline" className="cursor-pointer">Twitter</Badge>
          </div>
        </div>

        {/* Conversations List */}
        <div className="space-y-4">
          {mockConversations.map((conversation) => (
            <Card key={conversation.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex gap-4">
                {/* Platform Icon */}
                <div className="shrink-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      conversation.platform === "reddit"
                        ? "bg-orange-100"
                        : "bg-blue-100"
                    }`}
                  >
                    <MessageSquare
                      className={`w-5 h-5 ${
                        conversation.platform === "reddit"
                          ? "text-orange-600"
                          : "text-blue-600"
                      }`}
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg mb-1">{conversation.title}</h3>
                      <p className="text-sm text-slate-600">
                        {conversation.platform === "reddit"
                          ? conversation.subreddit
                          : conversation.handle}{" "}
                        · {conversation.timeAgo}
                      </p>
                    </div>
                    <Badge
                      className={
                        conversation.relevance === "high"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {conversation.relevance === "high" ? "High" : "Medium"} Relevance
                    </Badge>
                  </div>

                  <p className="text-slate-700 mb-3">{conversation.excerpt}</p>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                    <p className="text-sm">
                      <strong>Why it matters:</strong> {conversation.engagement}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-4 text-sm text-slate-600">
                      <span>
                        👍 {conversation.platform === "reddit" ? conversation.upvotes : conversation.likes}
                      </span>
                      <span>💬 {conversation.comments} comments</span>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Save
                      </Button>
                      <Button size="sm">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View & Engage
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <Button variant="outline">Load More Conversations</Button>
        </div>
      </div>
    </div>
  );
}