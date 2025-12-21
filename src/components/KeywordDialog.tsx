import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";

type Platforms = {
  reddit: boolean;
  instagram: boolean;
  twitter: boolean;
};

export type KeywordDraft = {
  phrase: string;
  platforms: Platforms;
};

interface KeywordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValue?: KeywordDraft;
  onSubmit: (draft: KeywordDraft) => void;
  title?: string;
  submitLabel?: string;
  trigger?: React.ReactNode;
  allowInstagram?: boolean;
  allowTwitter?: boolean;
}

const defaultPlatforms: Platforms = {
  reddit: true,
  instagram: true,
  twitter: false,
};

const KeywordDialog: React.FC<KeywordDialogProps> = ({
  open,
  onOpenChange,
  initialValue,
  onSubmit,
  title,
  submitLabel,
  trigger,
  allowInstagram = true,
  allowTwitter = false,
}) => {
  const [draft, setDraft] = React.useState<KeywordDraft>({
    phrase: initialValue?.phrase ?? "",
    platforms: initialValue?.platforms ?? defaultPlatforms,
  });

  React.useEffect(() => {
    if (open) {
      setDraft({
        phrase: initialValue?.phrase ?? "",
        platforms: initialValue?.platforms ?? defaultPlatforms,
      });
    }
  }, [open, initialValue]);

  const canSubmit = draft.phrase.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      phrase: draft.phrase.trim(),
      platforms: { ...draft.platforms },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title ?? "Keyword"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="keyword-phrase">Keyword or Phrase</Label>
            <Input
              id="keyword-phrase"
              placeholder="e.g., productivity apps, CRM software"
              value={draft.phrase}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setDraft((d) => ({ ...d, phrase: e.target.value }))
              }
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") handleSubmit();
              }}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="mb-3 block">Track on Platforms</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">🔴</span>
                  </div>
                  <div>
                    <p className="font-medium">Reddit</p>
                    <p className="text-sm text-slate-600">
                      Track in subreddits and comments
                    </p>
                  </div>
                </div>
                <Switch
                  checked={draft.platforms.reddit}
                  onCheckedChange={(checked: boolean) =>
                    setDraft((d) => ({
                      ...d,
                      platforms: { ...d.platforms, reddit: checked },
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">📷</span>
                  </div>
                  <div>
                    <p className="font-medium">Instagram</p>
                    <p className="text-sm text-slate-600">
                      {allowInstagram ? "Included on Core and Pro" : "Available on Core and Pro"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={draft.platforms.instagram && allowInstagram}
                  onCheckedChange={(checked: boolean) =>
                    setDraft((d) => ({
                      ...d,
                      platforms: { ...d.platforms, instagram: checked },
                    }))
                  }
                  disabled={!allowInstagram}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">𝕏</span>
                  </div>
                  <div>
                    <p className="font-medium">Twitter / X</p>
                    <p className="text-sm text-slate-600">
                      {allowTwitter ? "Included on Pro plan" : "Available on Pro plan"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={draft.platforms.twitter}
                  onCheckedChange={(checked: boolean) =>
                    setDraft((d) => ({
                      ...d,
                      platforms: { ...d.platforms, twitter: checked },
                    }))
                  }
                  disabled={!allowTwitter}
                />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <div className="flex gap-2 w-full">
            <Button onClick={handleSubmit} disabled={!canSubmit} className="flex-1">
              {submitLabel ?? "Save"}
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default KeywordDialog;