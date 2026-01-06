"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Search, Zap, Target, TrendingUp, Users, MessageCircle, Radar, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

const logo = "/duck-mascot.png";
const takaraAvatar = "/takara-qode.jpg";

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
      <span className="text-sm">{children}</span>
    </div>
  );
}

const LandingPage = () => {
  const [loadingPrice, setLoadingPrice] = useState<string | null>(null);

  const scrollToPricing = () => {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToWaitlist = () => {
    document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });
  };

  const priceEarly = process.env.NEXT_PUBLIC_STRIPE_PRICE_EARLY || process.env.NEXT_PUBLIC_STRIPE_PRICE_CORE;
  const priceBuilder = process.env.NEXT_PUBLIC_STRIPE_PRICE_BUILDER || process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO;

  const startCheckout = async (priceId?: string) => {
    if (!priceId) {
      toast.error("Pricing not configured yet.");
      return;
    }
    setLoadingPrice(priceId);
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) {
      setLoadingPrice(null);
      window.location.href = "/sign-in";
      return;
    }
    try {
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, userId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to start checkout");
      window.location.href = json.url;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Unable to start checkout";
      toast.error(message);
    } finally {
      setLoadingPrice(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
        <div className="absolute inset-0 bg-linear-to-b from-primary/5 to-background pointer-events-none" />
        <div className="max-w-4xl w-full mx-auto text-center space-y-10 relative z-10">
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-center">
              <img src={logo} alt="TrafficDuck" className="w-28 h-28" />
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-heading font-bold tracking-tight text-foreground leading-tight">
              Find Real <span className="text-primary bg-black px-2 py-1 rounded-md">Demand</span> Before You Build — By Watching Conversations, Not Guessing.
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              TrafficDuck scans Reddit, X, and Hacker News to surface real conversations where people are complaining about problems, asking for tools, and comparing alternatives — so you can validate ideas, join early, and turn conversations into customers.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={scrollToWaitlist}
              size="lg"
              className="h-14 px-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xl hover:shadow-2xl transition-all text-lg"
            >
              Start Free
            </Button>
            <Button
              onClick={scrollToPricing}
              size="lg"
              variant="outline"
              className="h-14 px-10 rounded-xl font-semibold text-lg"
            >
              See Pricing →
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

      {/* Who's It For */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <Badge variant="secondary" className="text-sm px-4 py-1">Who’s It For</Badge>
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground">Built for builders who move fast</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Whether you’re validating an idea or scaling early traction — TrafficDuck keeps you close to real demand.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl">Indie Hackers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Feature>Validate niches before building</Feature>
                <Feature>Find early adopters with intent</Feature>
                <Feature>Ship fast with real user language</Feature>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl">Freelancers & Agencies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Feature>Spot prospects asking for help</Feature>
                <Feature>Join conversations (not cold outreach)</Feature>
                <Feature>Position services with proof of pain</Feature>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl">SaaS Founders & PMMs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Feature>Track competitive chatter</Feature>
                <Feature>See demand patterns weekly</Feature>
                <Feature>Refine messaging with real quotes</Feature>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* See It In Action */}
      <section id="demo" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-10">
            <Badge variant="secondary" className="text-sm px-4 py-1">See It In Action</Badge>
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground">What a scan looks like</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              A quick preview of how conversations are delivered — organized by keyword and platform with context.
            </p>
          </div>
          <Card className="border-2">
            <CardContent className="p-6 md:p-8 space-y-6">
              {/* Faux search header */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                <div className="flex items-center gap-2 flex-1 rounded-lg border px-3 py-2 bg-muted/50">
                  <Search className="w-5 h-5 text-muted-foreground" />
                  <input
                    disabled
                    className="bg-transparent outline-none text-sm flex-1 text-muted-foreground"
                    placeholder="Keywords: ai onboarding, docs generator, freelance designers"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Reddit</Badge>
                  <Badge variant="outline" className="text-xs">X</Badge>
                  <Badge variant="outline" className="text-xs">Hacker News</Badge>
                </div>
              </div>

              {/* Demo results */}
              <div className="space-y-4">
                <div className="rounded-lg border p-4 bg-background">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">Reddit</Badge>
                      <span className="text-xs text-muted-foreground">r/SaaS • 2h ago</span>
                    </div>
                    <div className="text-xs text-muted-foreground">42 upvotes • 18 comments</div>
                  </div>
                  <h3 className="mt-2 font-semibold text-foreground">
                    Looking for a simple onboarding checklist tool for new users
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Context: actively asking for tools • why it matters: clear buying intent • suggested angle: share a concise checklist + quick demo.
                  </p>
                </div>

                <div className="rounded-lg border p-4 bg-background">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">X</Badge>
                      <span className="text-xs text-muted-foreground">@founder123 • 5h ago</span>
                    </div>
                    <div className="text-xs text-muted-foreground">14 replies</div>
                  </div>
                  <h3 className="mt-2 font-semibold text-foreground">
                    Why is setting up docs for small teams still so painful?
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Context: problem complaint • why it matters: frustration = opportunity • suggested angle: offer a 3-step pattern with examples.
                  </p>
                </div>

                <div className="rounded-lg border p-4 bg-background">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">Hacker News</Badge>
                      <span className="text-xs text-muted-foreground">3 days ago</span>
                    </div>
                    <div className="text-xs text-muted-foreground">128 points • 56 comments</div>
                  </div>
                  <h3 className="mt-2 font-semibold text-foreground">
                    Show HN: Lightweight AI tool for turning docs into onboarding guides
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Context: comparing alternatives • why it matters: users listing pain points • suggested angle: highlight speed + clarity.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Social Proof (moved higher) */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <Card className="border-2 border-primary/20 bg-linear-to-br from-primary/5 to-background shadow-xl">
            <CardContent className="p-8 md:p-12 text-center space-y-6">
              <div className="flex justify-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-3xl text-primary font-serif">&quot;</span>
                </div>
              </div>
              <blockquote className="text-xl md:text-2xl lg:text-3xl font-heading tracking-tight text-foreground leading-relaxed">
                &quot;The tweets you linked are on point — if your tool can find enough of these daily, I’d gladly pay.&quot;
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


      {/* The Problem */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <Badge variant="secondary" className="text-sm px-4 py-1">The Problem</Badge>
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground">
              Most founders fail because they build in silence.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">You’re told to:</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Feature>“do user research”</Feature>
                <Feature>“validate demand”</Feature>
                <Feature>“talk to users”</Feature>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">But in reality, that means:</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Feature>endless searching on X and Reddit</Feature>
                <Feature>low-signal posts</Feature>
                <Feature>switching tabs constantly</Feature>
                <Feature>guessing what people actually want</Feature>
              </CardContent>
            </Card>
          </div>
          <p className="text-center text-lg text-foreground">
            TrafficDuck automates the part everyone hates.
          </p>
        </div>
      </section>

      {/* Difference Section */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary" className="text-sm px-4 py-1">Before vs After</Badge>
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground">
              Without TrafficDuck vs With TrafficDuck
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Growing with Traffic Duck */}
            <Card className="relative overflow-hidden border-2 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 rounded-full blur-3xl" />
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">Growing with Traffic Duck</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="text-sm font-semibold text-foreground mb-1">You (5 min setup)</div>
                  <p className="text-sm text-muted-foreground">
                    Sign up, add keywords you want to monitor.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-semibold text-foreground">Traffic Duck</div>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span>Scans Reddit, X, and Hacker News to surface conversations where people are <span className="text-foreground">asking for tools</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span>Spotlights people <span className="text-foreground">complaining about problems</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span>Finds threads <span className="text-foreground">comparing alternatives</span></span>
                    </li>
                  </ul>
                </div>

                <div>
                  <div className="text-sm font-semibold text-foreground mb-1">Traffic Duck (signal filtering)</div>
                  <p className="text-sm text-muted-foreground">
                    Pulls the most recent and relevant posts, organized by keyword and platform.
                  </p>
                </div>

                <div>
                  <div className="text-sm font-semibold text-foreground mb-1">You (focused action)</div>
                  <p className="text-sm text-muted-foreground">
                    Review real conversations in one dashboard. Decide where to engage, research, or validate ideas.
                  </p>
                </div>

                <div>
                  <div className="text-sm font-semibold text-foreground mb-1">You (clarity)</div>
                  <p className="text-sm text-muted-foreground">
                    See where demand actually exists and what people are saying in their own words.
                  </p>
                </div>

                <div className="pt-2 border-t">
                  <div className="inline-flex items-center gap-2 rounded-md bg-primary/10 px-3 py-2">
                    <Badge variant="outline" className="text-xs">Result</Badge>
                    <span className="text-sm text-foreground">
                      5-minute setup → ongoing visibility into real demand
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Growing on your own */}
            <Card className="relative overflow-hidden border-2 border-red-200 bg-red-50 dark:bg-red-950/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-200/20 rounded-full blur-3xl" />
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">Growing on your own</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="text-sm font-semibold text-foreground mb-1">You (constant searching)</div>
                  <p className="text-sm text-muted-foreground">
                    Manual searching across platforms
                  </p>
                </div>

                <div>
                  <div className="text-sm font-semibold text-foreground mb-1">You (manual filtering)</div>
                  <p className="text-sm text-muted-foreground">
                    Dozens of low-signal posts
                  </p>
                </div>

                <div>
                  <div className="text-sm font-semibold text-foreground mb-1">You (context switching)</div>
                  <p className="text-sm text-muted-foreground">
                    Constant context switching
                  </p>
                </div>

                <div>
                  <div className="text-sm font-semibold text-foreground mb-1">You (guessing)</div>
                  <p className="text-sm text-muted-foreground">
                    Assumptions instead of real language
                  </p>
                </div>

                <div className="pt-2 border-t">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-sm">
                      <X className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                      <span className="text-foreground">2–3 hours per day</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <X className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                      <span className="text-foreground">Inconsistent signal</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <X className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                      <span className="text-foreground">Burnout</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* What TrafficDuck Does */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-4 mb-10">
            <Badge variant="secondary" className="text-sm px-4 py-1">What TrafficDuck Does</Badge>
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground">Your Conversation Radar</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              TrafficDuck scans public conversations to find existing demand.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-2">
              <CardContent className="p-6 space-y-3">
                <Feature>🔥 People actively complaining about problems</Feature>
                <Feature>🧠 Threads comparing tools and alternatives</Feature>
                <Feature>❓ Posts asking “what should I use for…”</Feature>
                <Feature>⏰ Fresh conversations you can join early</Feature>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-6">
                <p className="text-muted-foreground">
                  All organized by keyword and platform — in one dashboard.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary" className="text-sm px-4 py-1">How It Works</Badge>
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground">
              Set you monitors and get results.
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              No more guessing. No more switching tabs. No more wasting time.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
              <CardHeader>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <Target className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-2xl">1. Add Keywords</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  Add keywords for your niche, audience, or problem space. We generate intent clusters automatically.
                </p>
                <div className="pt-2 space-y-2">
                  <div className="text-sm font-mono bg-muted/50 px-3 py-2 rounded-lg">
                    &quot;freelance designers&quot;
                  </div>
                  <div className="text-sm font-mono bg-muted/50 px-3 py-2 rounded-lg">
                    &quot;AI tools for writers&quot;
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
                  TrafficDuck scans Reddit, X, and Hacker News for conversations that match real buying and problem intent.
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
                  Each conversation includes why it matters, context on the problem, and a suggested engagement direction. Reply naturally. Build trust. Drive traffic.
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
                Automated scanning replaces manual hunting. Context-first insights help you reply like a human — not spam. Every conversation is proof of demand (or lack of it).
              </p>
              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Save 10+ Hours Per Week</h3>
                    <p className="text-muted-foreground">No more manual searching across platforms. Get curated conversations delivered daily.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Higher Quality Engagement</h3>
                    <p className="text-muted-foreground">Context analysis helps you reply meaningfully — not spam. Build real connections.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Validate Before You Build</h3>
                    <p className="text-muted-foreground">Get ongoing visibility into demand using real user language, daily.</p>
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
                <div className="text-3xl font-bold text-foreground mb-1">2</div>
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
          <div className="text-center space-y-4 mb-6">
            <Badge variant="secondary" className="text-sm px-4 py-1">Pricing</Badge>
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start free. Upgrade when you want automation.
            </p>
          </div>
          <p className="text-sm text-center text-muted-foreground mb-10">
            Founding users get locked-in pricing as TrafficDuck evolves.
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <Card className="relative border-2 hover:shadow-lg transition-all">
              <CardHeader className="text-center pb-8">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-foreground mb-2">Free</h3>
                  <p className="text-sm text-muted-foreground">Idea Validation</p>
                </div>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-foreground">$0</span>
                </div>
                <Button variant="outline" className="w-full" onClick={scrollToWaitlist}>
                  Get Started
                </Button>
              </CardHeader>

              <CardContent className="space-y-4">
                <Feature>5 runs / month</Feature>
                <Feature>Max 3 conversations per run</Feature>
                <Feature>15 conversations / month (hard cap)</Feature>
                <Feature>Platforms: Choose 1 (Reddit or X)</Feature>
                <Feature>Up to 3 keywords</Feature>
                <Feature>Usernames blurred</Feature>
                <Feature>Export locked</Feature>
                <Feature>No saved history</Feature>

                <div className="pt-4 border-t space-y-1">
                  <p className="text-xs text-muted-foreground font-semibold">Best for</p>
                  <p className="text-xs text-muted-foreground">Idea validation • Testing niches • Learning user language</p>
                </div>
              </CardContent>
            </Card>

            {/* Early Tier */}
            <Card className="relative border-4 border-primary hover:shadow-2xl transition-all transform md:scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-6 py-1 text-sm font-semibold">
                  Most Popular
                </Badge>
              </div>

              <CardHeader className="text-center pb-8 pt-8">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-foreground mb-2">Early</h3>
                  <p className="text-sm text-muted-foreground">For founders actively validating and refining ideas.</p>
                </div>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-foreground">$9</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <Button
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => startCheckout(priceEarly)}
                  disabled={loadingPrice === priceEarly}
                >
                  {loadingPrice === priceEarly ? "Redirecting..." : "Start"}
                </Button>
              </CardHeader>

              <CardContent className="space-y-4">
                <Feature>20 runs / month</Feature>
                <Feature>100–200 conversations / month</Feature>
                <Feature>Platforms: Reddit + Hacker News</Feature>
                <Feature>Up to 5 keywords</Feature>
                <Feature>Usernames visible</Feature>
                <Feature>30-day saved history</Feature>
                <Feature>Light analysis (why it matters)</Feature>

                <div className="pt-4 border-t space-y-1">
                  <p className="text-xs text-primary font-semibold">Best for</p>
                  <p className="text-xs text-primary">Ongoing validation • Market research • Spotting demand patterns</p>
                </div>
              </CardContent>
            </Card>

            {/* Builder Tier */}
            <Card className="relative border-2 hover:shadow-lg transition-all">
              <CardHeader className="text-center pb-8">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-foreground mb-2">Builder</h3>
                  <p className="text-sm text-muted-foreground">Find Your First Users</p>
                </div>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-foreground">$19</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => startCheckout(priceBuilder)}
                  disabled={loadingPrice === priceBuilder}
                >
                  {loadingPrice === priceBuilder ? "Redirecting..." : "Unlock All Platforms"}
                </Button>
              </CardHeader>

              <CardContent className="space-y-4">
                <Feature>50 runs / month</Feature>
                <Feature>500–1,000 conversations / month</Feature>
                <Feature>Platforms: Reddit + X + Hacker News</Feature>
                <Feature>Up to 10 keywords</Feature>
                <Feature>Usernames visible</Feature>
                <Feature>Export enabled</Feature>
                <Feature>60–90 day saved history</Feature>
                <Feature>Full context + engagement paths</Feature>

                <div className="pt-4 border-t space-y-1">
                  <p className="text-xs text-muted-foreground">Best for</p>
                  <p className="text-xs text-muted-foreground">Finding early adopters • Joining conversations daily • Driving traffic and signups</p>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </section>



      {/* Waitlist CTA */}
      <section id="waitlist" className="py-24 px-4 bg-muted/30">
        <div className="max-w-xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <Badge variant="secondary" className="text-sm px-4 py-1">Join TrafficDuck</Badge>
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground">
              Start Finding Your Customers Today
            </h2>
            <p className="text-lg text-muted-foreground">
              Join TrafficDuck and get your first radar scan free. No credit card required.
            </p>
          </div>

          <Link href="/sign-up">
            <Button className="w-full bg-black text-white">Get Started →</Button>
          </Link>
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
