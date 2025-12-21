"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Search, Zap, Target, TrendingUp, Users, MessageCircle, Radar } from "lucide-react";
import { toast } from "sonner";

const logo = "/duck-mascot.png";
const takaraAvatar = "/takara-qode.jpg";

const LandingPage = () => {
  const [email, setEmail] = useState("");
  const [keywords, setKeywords] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email.");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success("You're on the list! We'll be in touch soon.");
      setEmail("");
      setKeywords("");
      setIsSubmitting(false);
    }, 1000);
  };

  const scrollToPricing = () => {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToWaitlist = () => {
    document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background pointer-events-none" />
        <div className="max-w-4xl w-full mx-auto text-center space-y-10 relative z-10">
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-center">
              <img src={logo} alt="TrafficDuck" className="w-28 h-28" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-heading font-bold tracking-tight text-foreground leading-tight">
              Your Conversation Radar.<br />
              <span className="text-primary">Find Customers.</span> Join Conversations.
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Stop hunting for leads. TrafficDuck scans Reddit, Instagram, and Twitter daily for conversations about your niche — then delivers them straight to you with engagement insights.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={scrollToWaitlist}
              size="lg"
              className="h-14 px-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xl hover:shadow-2xl transition-all text-lg"
            >
              Start Your Free Trial
            </Button>
            <Button
              onClick={scrollToPricing}
              size="lg"
              variant="outline"
              className="h-14 px-10 rounded-xl font-semibold text-lg"
            >
              See Pricing
            </Button>
          </div>
          <div className="flex items-center justify-center gap-8 pt-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-primary" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-primary" />
              <span>Daily automated scans</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary" className="text-sm px-4 py-1">How It Works</Badge>
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground">
              Three Steps to Traffic
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Set it once, get fresh conversations every day
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
              <CardHeader>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <Target className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-2xl">1. Enter Your Keywords</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  Tell us your niche keywords like "SaaS marketing", "indie hacking", or "content strategy". Our radar tracks these phrases across platforms.
                </p>
                <div className="pt-2 space-y-2">
                  <div className="text-sm font-mono bg-muted/50 px-3 py-2 rounded-lg">
                    "freelance designers"
                  </div>
                  <div className="text-sm font-mono bg-muted/50 px-3 py-2 rounded-lg">
                    "AI tools for writers"
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
              <CardHeader>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <Radar className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-2xl">2. Daily Scanning</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  Every day, TrafficDuck scans Reddit, Instagram, and Twitter for active conversations matching your keywords. Fresh leads while you sleep.
                </p>
                <div className="pt-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-muted-foreground">Scanning in progress...</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
              <CardHeader>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <MessageCircle className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-2xl">3. Engage & Convert</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  Get conversations with context: why it matters, suggested engagement paths, and timing insights. Reply naturally, build trust, drive traffic.
                </p>
                <div className="pt-2 space-y-2">
                  <Badge variant="outline" className="text-xs">High engagement</Badge>
                  <Badge variant="outline" className="text-xs">Fresh: 2h ago</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge variant="secondary" className="text-sm px-4 py-1">Why TrafficDuck</Badge>
              <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground leading-tight">
                Stop Chasing Traffic. Let Conversations Find You.
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Most founders waste hours hunting for places to share their content. TrafficDuck automates the hunt — so you can focus on what matters: building relationships and converting leads.
              </p>
              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Save 10+ Hours Per Week</h3>
                    <p className="text-muted-foreground">No more manual searching across platforms. Get curated conversations delivered daily.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Higher Quality Engagement</h3>
                    <p className="text-muted-foreground">Context analysis helps you reply meaningfully — not spam. Build real connections.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Turn Conversations Into Customers</h3>
                    <p className="text-muted-foreground">Every conversation is a warm lead. Join early, provide value, drive traffic to your content.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6 text-center border-2">
                <TrendingUp className="w-10 h-10 text-primary mx-auto mb-3" />
                <div className="text-3xl font-bold text-foreground mb-1">10-15</div>
                <div className="text-sm text-muted-foreground">Conversations/week</div>
              </Card>
              <Card className="p-6 text-center border-2">
                <Users className="w-10 h-10 text-primary mx-auto mb-3" />
                <div className="text-3xl font-bold text-foreground mb-1">3</div>
                <div className="text-sm text-muted-foreground">Platforms scanned</div>
              </Card>
              <Card className="p-6 text-center border-2">
                <Zap className="w-10 h-10 text-primary mx-auto mb-3" />
                <div className="text-3xl font-bold text-foreground mb-1">Daily</div>
                <div className="text-sm text-muted-foreground">Fresh scans</div>
              </Card>
              <Card className="p-6 text-center border-2">
                <Search className="w-10 h-10 text-primary mx-auto mb-3" />
                <div className="text-3xl font-bold text-foreground mb-1">Real-time</div>
                <div className="text-sm text-muted-foreground">Pro tier updates</div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary" className="text-sm px-4 py-1">Pricing</Badge>
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start free, upgrade when you're ready to scale
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <Card className="relative border-2 hover:shadow-lg transition-all">
              <CardHeader className="text-center pb-8">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-foreground mb-2">Free</h3>
                  <p className="text-sm text-muted-foreground">Sample the radar</p>
                </div>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-foreground">$0</span>
                </div>
                <Button variant="outline" className="w-full" onClick={scrollToWaitlist}>
                  Get Started
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">1 niche keyword</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Up to 3 conversations total</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Reddit only</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">One-time delivery</span>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground italic">
                    Perfect to prove the magic
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Core Tier - Popular */}
            <Card className="relative border-4 border-primary hover:shadow-2xl transition-all transform md:scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-6 py-1 text-sm font-semibold">
                  Most Popular
                </Badge>
              </div>
              <CardHeader className="text-center pb-8 pt-8">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-foreground mb-2">Core</h3>
                  <p className="text-sm text-muted-foreground">Daily Radar</p>
                </div>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-foreground">$29</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <Button className="w-full bg-primary hover:bg-primary/90" onClick={scrollToWaitlist}>
                  Start Free Trial
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">1 niche keyword</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">Daily automated scanning</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">Reddit + Instagram</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">10-15 conversations/week</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">Why-it-matters analysis</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">Suggested engagement paths</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">Email delivery or dashboard</span>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-xs text-primary font-semibold">
                    What 90% of users choose
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Pro Tier */}
            <Card className="relative border-2 hover:shadow-lg transition-all">
              <CardHeader className="text-center pb-8">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-foreground mb-2">Pro</h3>
                  <p className="text-sm text-muted-foreground">Real-time Edge</p>
                </div>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-foreground">$59</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <Button variant="outline" className="w-full" onClick={scrollToWaitlist}>
                  Get Started
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">Everything in Core</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">Twitter / X included</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">Near real-time freshness</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">Priority scans</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">Early access to new channels</span>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground italic">
                    For serious growth hackers
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background shadow-xl">
            <CardContent className="p-8 md:p-12 text-center space-y-6">
              <div className="flex justify-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-3xl text-primary font-serif">"</span>
                </div>
              </div>
              <blockquote className="text-xl md:text-2xl lg:text-3xl font-heading tracking-tight text-foreground leading-relaxed">
                "The tweets you linked are on point — if your tool can perfectly find enough of these daily{" "}
                <span className="text-primary font-semibold">I would gladly pay.</span>"
              </blockquote>
              <div className="flex items-center justify-center gap-3 pt-4">
                <img
                  src={takaraAvatar}
                  alt="Takara Qode"
                  className="h-12 w-12 rounded-full object-cover border-2 border-primary/30"
                />
                <div className="text-left">
                  <p className="font-semibold text-foreground">Takara Qode</p>
                  <a
                    href="https://twitter.com/takaraqode"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    @takaraqode
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Waitlist CTA */}
      <section id="waitlist" className="py-24 px-4 bg-muted/30">
        <div className="max-w-xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <Badge variant="secondary" className="text-sm px-4 py-1">Join the Waitlist</Badge>
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground">
              Start Finding Your Customers Today
            </h2>
            <p className="text-lg text-muted-foreground">
              Join the waitlist and get your first radar scan free. No credit card required.
            </p>
          </div>

          <form onSubmit={handleWaitlistSubmit} className="space-y-4">
            <div className="space-y-3 text-left">
              <label className="text-sm font-medium text-foreground">Your Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 rounded-xl border-2 border-border bg-background text-base"
                required
              />
            </div>
            <div className="space-y-3 text-left">
              <label className="text-sm font-medium text-foreground">
                Your Niche Keywords <span className="text-muted-foreground">(optional)</span>
              </label>
              <Input
                type="text"
                placeholder="e.g., SaaS marketing, indie hacking"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="h-14 rounded-xl border-2 border-border bg-background text-base"
              />
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all text-base"
            >
              {isSubmitting ? "Joining..." : "Join the Waitlist"}
            </Button>
            <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
              <p className="text-sm font-medium text-foreground">
                Early sign-ups get FREE access until the official launch
              </p>
            </div>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src={logo} alt="TrafficDuck" className="w-10 h-10" />
              <span className="font-bold text-lg text-foreground">TrafficDuck</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-muted-foreground mb-2">
                Questions or support?
              </p>
              <a
                href="https://x.com/heynathanielj"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                DM me on X @heynathanielj
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
