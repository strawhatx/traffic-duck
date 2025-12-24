import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type NicheDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValue?: string;
  onSubmit: (niche: string) => void;
  title?: string;
  submitLabel?: string;
};

export default function NicheDialog({
  open,
  onOpenChange,
  initialValue,
  onSubmit,
  title = "Describe Your Niche",
  submitLabel = "Save Niche",
}: NicheDialogProps) {
  const [value, setValue] = useState(initialValue ?? "");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setValue(initialValue ?? "");
  }, [initialValue]);

  const handleSubmit = () => {
    if (!value.trim()) return;
    setSubmitting(true);
    onSubmit(value.trim());
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <p className="text-sm text-slate-600">
            Tell us about your niche, audience, product, and problems you solve. We’ll generate intent clusters and scan platforms for relevant conversations.
          </p>
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g., AI tools for indie developers; looking for threads about launching, pricing, growth, and productivity in small teams."
            className="min-h-40"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!value.trim() || submitting}>
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


