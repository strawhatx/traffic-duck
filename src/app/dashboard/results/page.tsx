"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExternalLink, Trash2, MessageCircle, Heart, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";

interface SearchResult {
  id: string;
  keyword: string;
  platform: "reddit" | "instagram" | "twitter";
  title: string;
  content: string;
  author: string;
  url: string;
  engagement: { upvotes?: number; likes?: number; comments?: number };
  why_matters: string;
  engagement_path: string;
  discovered_at: string;
}

const ResultsPage = () => {
  const [filterKeyword, setFilterKeyword] = useState("all");
  const [filterPlatform, setFilterPlatform] = useState<
    "all" | "reddit" | "instagram" | "twitter"
  >("all");

  const [results] = useState<SearchResult[]>([
    {
      id: "1",
      keyword: "SaaS marketing",
      platform: "reddit",
      title: "Best practices for SaaS marketing that actually moved the needle",
      content:
        "We tested three SaaS tactics across two cohorts. Here's what actually improved outcomes for founders...",
      author: "u/GrowthHacker",
      url: "https://reddit.com/r/saas/comments/abc123",
      engagement: { upvotes: 184, comments: 37 },
      why_matters:
        "Members are actively sharing what's working this week for SaaS founders. High comment velocity.",
      engagement_path:
        "Reply with a concrete tactic that worked for your SaaS product.",
      discovered_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "2",
      keyword: "SaaS marketing",
      platform: "twitter",
      title: "Actionable SaaS marketing tactics",
      content:
        "Thread on actionable SaaS tactics that resonate with founders. Here are the 5 that get consistent engagement...",
      author: "@SaaS_Insider",
      url: "https://twitter.com/SaaS_Insider/status/1234567890",
      engagement: { likes: 320, comments: 41 },
      why_matters:
        "Thread gaining momentum. Founder audience is actively discussing tactics.",
      engagement_path:
        "Reply with a micro-case study or specific metric from your SaaS.",
      discovered_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "3",
      keyword: "indie hacking",
      platform: "reddit",
      title: "Help me improve my indie hacking strategy",
      content:
        "Current plan focuses on two channels; results are flat. Looking for feedback from folks targeting indie hackers...",
      author: "u/StartupFounder",
      url: "https://reddit.com/r/indiehackers/comments/def456",
      engagement: { upvotes: 96, comments: 52 },
      why_matters:
        "High comment velocity on a strategy post. Perfect for adding your perspective.",
      engagement_path:
        "Suggest one tactic you've seen work for indie hackers.",
      discovered_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  const keywords = ["all", ...new Set(results.map((r) => r.keyword))];

  const filteredResults = results.filter((result) => {
    const keywordMatch =
      filterKeyword === "all" || result.keyword === filterKeyword;
    const platformMatch =
      filterPlatform === "all" || result.platform === filterPlatform;
    return keywordMatch && platformMatch;
  });

  const handleDelete = (id: string) => {
    toast.success("Result archived");
  };

  const getPlatformColor = (
    platform: "reddit" | "instagram" | "twitter"
  ) => {
    switch (platform) {
      case "reddit":
        return "bg-orange-500/10 text-orange-700";
      case "instagram":
        return "bg-pink-500/10 text-pink-700";
      case "twitter":
        return "bg-blue-500/10 text-blue-700";
    }
  };

  const getPlatformIcon = (platform: "reddit" | "instagram" | "twitter") => {
    switch (platform) {
      case "reddit":
        return "🔗";
      case "instagram":
        return "📷";
      case "twitter":
        return "𝕏";
    }
  };

  const getEngagementMetrics = (
    engagement: SearchResult["engagement"],
    platform: string
  ) => {
    const metrics = [];
    if (engagement.upvotes) {
      metrics.push({ label: "Upvotes", value: engagement.upvotes, icon: "⬆️" });
    }
    if (engagement.likes) {
      metrics.push({ label: "Likes", value: engagement.likes, icon: "❤️" });
    }
    if (engagement.comments) {
      metrics.push({
        label: "Comments",
        value: engagement.comments,
        icon: "💬",
      });
    }
    return metrics;
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diff = Math.floor((now.getTime() - then.getTime()) / 1000 / 60);

    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2">
            Search Results
          </h1>
          <p className="text-muted-foreground">
            Posts and comments from your daily scans
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium text-foreground">
              Filter by Keyword
            </label>
            <Select value={filterKeyword} onValueChange={setFilterKeyword}>
              <SelectTrigger className="h-10 rounded-lg border-2 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {keywords.map((keyword) => (
                  <SelectItem key={keyword} value={keyword}>
                    {keyword === "all" ? "All Keywords" : keyword}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium text-foreground">
              Filter by Platform
            </label>
            <Select
              value={filterPlatform}
              onValueChange={(value: any) => setFilterPlatform(value)}
            >
              <SelectTrigger className="h-10 rounded-lg border-2 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="reddit">Reddit</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="twitter">Twitter / X</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredResults.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">
                No results found. Results will appear here as TrafficDuck scans
                for your keywords.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {filteredResults.length} result{filteredResults.length !== 1 ? "s" : ""} found
            </p>

            {filteredResults.map((result) => (
              <Card key={result.id} className="hover:shadow-lg transition-all">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge className={getPlatformColor(result.platform)}>
                          {getPlatformIcon(result.platform)}{" "}
                          {result.platform.charAt(0).toUpperCase() +
                            result.platform.slice(1)}
                        </Badge>
                        <Badge variant="outline">{result.keyword}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {getTimeAgo(result.discovered_at)}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">
                          {result.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {result.content}
                        </p>
                      </div>

                      <p className="text-sm text-foreground">
                        by <span className="font-medium">{result.author}</span>
                      </p>

                      <div className="flex flex-wrap gap-3 pt-2">
                        {getEngagementMetrics(
                          result.engagement,
                          result.platform
                        ).map((metric) => (
                          <div
                            key={metric.label}
                            className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full"
                          >
                            {metric.icon} {metric.value}
                          </div>
                        ))}
                      </div>

                      <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                        <div>
                          <p className="text-xs font-semibold text-foreground mb-1">
                            Why It Matters
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {result.why_matters}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground mb-1">
                            Suggested Engagement
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {result.engagement_path}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          title="Open original post"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </a>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(result.id)}
                        className="text-destructive hover:text-destructive"
                        title="Archive this result"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ResultsPage;
