"use client";

import { useState } from "react";
import Link from "next/link";
import { Radar, Plus, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import KeywordDialog from "@/components/KeywordDialog";

interface Keyword {
  id: number;
  phrase: string;
  platforms: {
    reddit: boolean;
    instagram: boolean;
    twitter: boolean;
  };
  createdAt: string;
}

export default function Keywords() {
  const [keywords, setKeywords] = useState<Keyword[]>([
    {
      id: 1,
      phrase: "SaaS productivity tools",
      platforms: { reddit: true, instagram: true, twitter: false },
      createdAt: "2025-01-10",
    },
    {
      id: 2,
      phrase: "project management software",
      platforms: { reddit: true, instagram: false, twitter: false },
      createdAt: "2025-01-10",
    },
    {
      id: 3,
      phrase: "email marketing automation",
      platforms: { reddit: true, instagram: true, twitter: false },
      createdAt: "2025-01-12",
    },
  ]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  type KeywordDraft = Pick<Keyword, "phrase" | "platforms">;
  const [dialogInitial, setDialogInitial] = useState<KeywordDraft | undefined>(undefined);

  const handleDelete = (id: number) => {
    setKeywords(keywords.filter((k) => k.id !== id));
  };

  const openAddDialog = () => {
    setEditingId(null);
    setDialogInitial({
      phrase: "",
      platforms: { reddit: true, instagram: true, twitter: false },
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (keyword: Keyword) => {
    setEditingId(keyword.id);
    setDialogInitial({
      phrase: keyword.phrase,
      platforms: { ...keyword.platforms },
    });
    setIsDialogOpen(true);
  };

  const handleSubmitDraft = (draft: KeywordDraft) => {
    if (editingId === null) {
      const newKeyword: Keyword = {
        id: Date.now(),
        phrase: draft.phrase,
        platforms: { ...draft.platforms },
        createdAt: new Date().toISOString().split("T")[0],
      };
      setKeywords((prev) => [...prev, newKeyword]);
    } else {
      setKeywords((prev) =>
        prev.map((k) =>
          k.id === editingId ? { ...k, phrase: draft.phrase, platforms: { ...draft.platforms } } : k
        )
      );
    }
    setIsDialogOpen(false);
    setEditingId(null);
    setDialogInitial(undefined);
  };

  const getPlatformCount = (platforms: Keyword["platforms"]) => {
    return Object.values(platforms).filter(Boolean).length;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
              <Radar className="w-8 h-8 text-blue-600" />
              <span className="text-2xl tracking-tight">Traffic Duck</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Button variant="ghost">Settings</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl mb-2">Manage Keywords</h1>
          <p className="text-slate-600">
            Add keywords or phrases to track across Reddit, Instagram, and Twitter.
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

        <div className="space-y-3">
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
                    {keyword.platforms.instagram && (
                      <Badge className="bg-pink-100 text-pink-800">
                        Instagram
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

        {/* Info Card */}
        <Card className="p-6 mt-8 bg-blue-50 border-blue-200">
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
  );
}
