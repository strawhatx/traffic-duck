import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import duckMascot from "@/assets/duck-mascot.png";

const Hero = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("Thanks for joining! We'll be in touch soon 🦆");
      setEmail("");
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
        <div className="flex justify-center mb-6">
          <img 
            src={duckMascot} 
            alt="Traffic Duck" 
            className="w-24 h-24 animate-scale-in"
          />
        </div>
        
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold tracking-tight leading-tight">
          Optimize your content for{" "}
          <span className="text-primary">higher SEO rankings</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Traffic Duck analyzes your posts, identifies SEO opportunities, and suggests 
          actionable improvements — instantly.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mt-8">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 h-12 rounded-full border-2 px-6 focus:border-primary transition-colors"
          />
          <Button 
            type="submit"
            className="h-12 px-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            Join the Waitlist
          </Button>
        </form>
        
        <p className="text-sm text-muted-foreground">
          Get early access and improve your content today
        </p>
      </div>
    </section>
  );
};

export default Hero;
