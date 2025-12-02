import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EmailModal = ({ isOpen, onClose }: EmailModalProps) => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitted(true);
    toast.success("You're on the list! 🦆 We'll notify you when we launch.");
    
    setTimeout(() => {
      setEmail("");
      setIsSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-2 border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading font-bold text-center text-foreground">
            {isSubmitted ? "You're in! 🦆" : "Get Early Access"}
          </DialogTitle>
        </DialogHeader>
        
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <p className="text-muted-foreground text-center">
              Be the first to auto-post your content with TrafficDuck.
            </p>
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 rounded-xl border-2 border-border px-4 text-base focus:border-primary bg-background transition-colors"
            />
            <Button 
              type="submit"
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg transition-all"
            >
              Join Early Access
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              No spam — just early access updates.
            </p>
          </form>
        ) : (
          <div className="py-8 text-center">
            <span className="text-5xl mb-4 block">✨</span>
            <p className="text-foreground">Check your inbox soon!</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EmailModal;
