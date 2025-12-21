"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Trash2, Edit2, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";

interface Keyword {
  id: string;
  keyword: string;
  platform: "reddit" | "instagram" | "twitter" | "all";
  active: boolean;
  created_at: string;
}

const KeywordsPage = () => {
  const [keywords, setKeywords] = useState<Keyword[]>([
    {
      id: "1",
      keyword: "SaaS marketing",
      platform: "all",
      active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "2",
      keyword: "indie hacking",
      platform: "reddit",
      active: true,
      created_at: new Date().toISOString(),
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");
  const [newPlatform, setNewPlatform] = useState<
    "reddit" | "instagram" | "twitter" | "all"
  >("all");
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAddKeyword = () => {
    if (!newKeyword.trim()) {
      toast.error("Please enter a keyword");
      return;
    }

    if (editingId) {
      setKeywords((prev) =>
        prev.map((k) =>
          k.id === editingId
            ? { ...k, keyword: newKeyword, platform: newPlatform }
            : k
        )
      );
      toast.success("Keyword updated");
      setEditingId(null);
    } else {
      const keyword: Keyword = {
        id: Date.now().toString(),
        keyword: newKeyword,
        platform: newPlatform,
        active: true,
        created_at: new Date().toISOString(),
      };
      setKeywords((prev) => [keyword, ...prev]);
      toast.success("Keyword added");
    }

    setNewKeyword("");
    setNewPlatform("all");
    setIsDialogOpen(false);
  };

  const handleDeleteKeyword = (id: string) => {
    setKeywords((prev) => prev.filter((k) => k.id !== id));
    toast.success("Keyword deleted");
  };

  const handleToggleActive = (id: string) => {
    setKeywords((prev) =>
      prev.map((k) => (k.id === id ? { ...k, active: !k.active } : k))
    );
  };

  const handleEditKeyword = (keyword: Keyword) => {
    setEditingId(keyword.id);
    setNewKeyword(keyword.keyword);
    setNewPlatform(keyword.platform);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setNewKeyword("");
    setNewPlatform("all");
  };

  const getPlatformColor = (
    platform: "reddit" | "instagram" | "twitter" | "all"
  ) => {
    switch (platform) {
      case "reddit":
        return "bg-orange-500/10 text-orange-700";
      case "instagram":
        return "bg-pink-500/10 text-pink-700";
      case "twitter":
        return "bg-blue-500/10 text-blue-700";
      case "all":
        return "bg-primary/10 text-primary";
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
              Keywords
            </h1>
            <p className="text-muted-foreground">
              Manage the keywords and phrases TrafficDuck scans for you
            </p>
          </div>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            <Plus className="w-5 h-5" />
            Add Keyword
          </Button>
        </div>

        {keywords.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-4">
                No keywords yet. Add your first keyword to start scanning!
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                Add Your First Keyword
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {keywords.map((keyword) => (
              <Card key={keyword.id} className="hover:shadow-md transition-all">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-semibold text-foreground">
                        {keyword.keyword}
                      </h3>
                      <Badge className={getPlatformColor(keyword.platform)}>
                        {keyword.platform === "all"
                          ? "All Platforms"
                          : keyword.platform.charAt(0).toUpperCase() +
                            keyword.platform.slice(1)}
                      </Badge>
                      {keyword.active ? (
                        <Badge variant="default" className="bg-green-600">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Added{" "}
                      {new Date(keyword.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggleActive(keyword.id)}
                      title={
                        keyword.active
                          ? "Pause scanning"
                          : "Resume scanning"
                      }
                    >
                      {keyword.active ? (
                        <ToggleRight className="w-5 h-5 text-green-600" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditKeyword(keyword)}
                    >
                      <Edit2 className="w-5 h-5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteKeyword(keyword.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Keyword" : "Add New Keyword"}
              </DialogTitle>
              <DialogDescription>
                {editingId
                  ? "Update the keyword and platform preferences"
                  : "Add a keyword phrase to track across platforms"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Keyword
                </label>
                <Input
                  placeholder="e.g., SaaS marketing, AI tools"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  className="h-10 rounded-lg border-2 border-border"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Platform
                </label>
                <Select
                  value={newPlatform}
                  onValueChange={(value: any) => setNewPlatform(value)}
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

            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button
                onClick={handleAddKeyword}
                className="bg-primary hover:bg-primary/90"
              >
                {editingId ? "Update Keyword" : "Add Keyword"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default KeywordsPage;
