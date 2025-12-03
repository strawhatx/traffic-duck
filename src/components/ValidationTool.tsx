import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

type ViewState = "input" | "email" | "loading" | "result";

const PLACEHOLDER_RESULTS = {
  reddit: ["r/Placeholder1", "r/Placeholder2", "r/Placeholder3"],
  facebookGroups: ["FB Group Placeholder A", "FB Group Placeholder B"],
  communities: ["Discord Community Placeholder 1", "Niche Forum Placeholder 2"],
  newsletters: ["Newsletter Placeholder One"]
};

const ValidationTool = () => {
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [viewState, setViewState] = useState<ViewState>("input");

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setViewState("email");
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setViewState("loading");

    setTimeout(() => {
      setViewState("result");
      toast.success("Recommendations sent to your email! 🦆");
    }, 2000);
  };

  const handleReset = () => {
    setUrl("");
    setEmail("");
    setViewState("input");
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-20 bg-background">
      <div className="max-w-2xl w-full mx-auto text-center space-y-8">
        {/* Hero */}
        <div className="space-y-4 animate-fade-in">
          <span className="text-4xl">🦆</span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold tracking-tight text-foreground">
            Where Should You Post This?
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
            TrafficDuck finds the best communities and channels to share your content for maximum reach.
          </p>
        </div>

        {/* Step 1: URL Input */}
        {viewState === "input" && (
          <form onSubmit={handleUrlSubmit} className="space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <Input
                type="url"
                placeholder="Paste your content link here…"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                className="flex-1 h-14 rounded-xl border-2 border-border px-5 text-base focus:border-primary bg-card transition-colors"
              />
              <Button 
                type="submit"
                className="h-14 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Find My Channels
              </Button>
            </div>
          </form>
        )}

        {/* Step 2: Email Collection */}
        {viewState === "email" && (
          <div className="space-y-6 animate-fade-in">
            <Card className="max-w-lg mx-auto border-2 border-border bg-card">
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-heading font-bold text-foreground">
                    Where should we send your recommendations?
                  </h2>
                  <p className="text-muted-foreground">
                    We'll email you a copy plus a follow-up with more channel ideas tomorrow.
                  </p>
                </div>

                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-14 rounded-xl border-2 border-border px-5 text-base focus:border-primary bg-background transition-colors"
                  />
                  <Button 
                    type="submit"
                    className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all text-lg"
                  >
                    Get My Channels
                  </Button>
                </form>

                <button 
                  onClick={() => setViewState("input")}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Back
                </button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Loading State */}
        {viewState === "loading" && (
          <div className="space-y-6 animate-fade-in">
            <Card className="max-w-lg mx-auto border-2 border-border bg-card">
              <CardContent className="p-8">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <span className="text-5xl animate-bounce">🦆</span>
                  </div>
                  <p className="text-lg font-medium text-foreground">Finding the best communities for your content…</p>
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 4: Result State */}
        {viewState === "result" && (
          <div className="space-y-6 animate-fade-in">
            <Card className="max-w-lg mx-auto border-2 border-primary/30 bg-card shadow-xl">
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-heading font-bold text-foreground">
                    Your Recommended Channels
                  </h2>
                  <div className="w-12 h-1 bg-primary mx-auto rounded-full"></div>
                </div>

                <div className="space-y-4 text-left">
                  {/* Reddit */}
                  <div className="p-4 bg-muted rounded-xl">
                    <p className="text-sm font-semibold text-primary mb-2">Reddit</p>
                    <ul className="space-y-1">
                      {PLACEHOLDER_RESULTS.reddit.map((sub, i) => (
                        <li key={i} className="text-foreground">{sub}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Facebook Groups */}
                  <div className="p-4 bg-muted rounded-xl">
                    <p className="text-sm font-semibold text-primary mb-2">Facebook Groups</p>
                    <ul className="space-y-1">
                      {PLACEHOLDER_RESULTS.facebookGroups.map((group, i) => (
                        <li key={i} className="text-foreground">{group}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Communities */}
                  <div className="p-4 bg-muted rounded-xl">
                    <p className="text-sm font-semibold text-primary mb-2">Communities</p>
                    <ul className="space-y-1">
                      {PLACEHOLDER_RESULTS.communities.map((community, i) => (
                        <li key={i} className="text-foreground">{community}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Newsletters */}
                  <div className="p-4 bg-muted rounded-xl">
                    <p className="text-sm font-semibold text-primary mb-2">Newsletters</p>
                    <ul className="space-y-1">
                      {PLACEHOLDER_RESULTS.newsletters.map((newsletter, i) => (
                        <li key={i} className="text-foreground">{newsletter}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Why These Work */}
                  <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
                    <p className="text-sm font-semibold text-primary mb-1">Why These Channels Work</p>
                    <p className="text-foreground text-sm">
                      Your content matches the audience interests inside these communities.
                      <span className="block text-muted-foreground text-xs mt-1">(This is a placeholder — real logic will be applied later.)</span>
                    </p>
                  </div>
                </div>

                {/* Email Confirmation */}
                <div className="p-4 bg-muted/50 rounded-xl border border-border text-center">
                  <p className="text-sm text-foreground font-medium">📬 Check your email</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    A copy has been sent to {email}
                  </p>
                </div>

                {/* CTA */}
                <div className="pt-4 space-y-4 border-t border-border">
                  <p className="text-lg font-medium text-foreground">
                    Want early access to advanced channel discovery?
                  </p>
                  <Button 
                    className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all text-lg"
                  >
                    Join the Waitlist
                  </Button>
                </div>
              </CardContent>
            </Card>

            <button 
              onClick={handleReset}
              className="text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
            >
              Try another link
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ValidationTool;
