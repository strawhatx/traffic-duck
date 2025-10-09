import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const WaitlistForm = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("Welcome aboard! 🦆 We'll keep you updated on our launch.");
      setEmail("");
    }
  };

  return (
    <section id="waitlist" className="py-24 px-4 bg-gradient-to-b from-muted/30 to-background">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <h2 className="text-4xl md:text-5xl font-heading font-bold tracking-tight">
          Be the first to improve your content with{" "}
          <span className="text-secondary">Traffic Duck</span>
        </h2>
        
        <p className="text-lg text-muted-foreground">
          No spam — just early access updates
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto mt-8">
          <Input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 h-14 rounded-full border-2 px-6 text-base focus:border-secondary transition-colors"
          />
          <Button 
            type="submit"
            className="h-14 px-10 rounded-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            Join Waitlist
          </Button>
        </form>
      </div>
    </section>
  );
};

export default WaitlistForm;
