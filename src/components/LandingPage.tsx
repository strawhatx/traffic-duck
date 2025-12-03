import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import logo from "@/assets/duck-mascot.png";

type ViewState = "input" | "email" | "loading" | "result";

const PLACEHOLDER_RESULTS = {
  reddit: ["r/Placeholder1", "r/Placeholder2", "r/Placeholder3"],
  facebookGroups: ["FB Group Placeholder A", "FB Group Placeholder B"],
  communities: ["Discord Community Placeholder 1", "Niche Forum Placeholder 2"],
  newsletters: ["Newsletter Placeholder One"]
};

const LandingPage = () => {
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [viewState, setViewState] = useState<ViewState>("input");

  const encode = (data: Record<string, string>) =>
    Object.keys(data)
      .map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
      .join("&");

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setViewState("email");
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setViewState("loading");

    try {
      const formData = {
        "form-name": "email-submission",
        email,
        url
      };
      const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encode(formData)
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      setViewState("result");
      toast.success("Thanks! We received your request. 🦆");
    } catch (err) {
      setViewState("email");
      toast.error("Sorry, something went wrong submitting the form.");
    }
  };

  const handleReset = () => {
    setUrl("");
    setEmail("");
    setViewState("input");
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* (A) Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-2xl w-full mx-auto text-center space-y-8">
          <div className="space-y-4 animate-fade-in">
            <img src={logo} alt="TrafficDuck" className="w-24 h-24 mx-auto" />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold tracking-tight text-foreground">
              Where should you post your content to get traffic?
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
              TrafficDuck analyzes your content and recommends the best communities, forums, subreddits, and groups where it will actually get attention.
            </p>
          </div>

          {/* Step 1: URL Input */}
          {viewState === "input" && (
            <div className="space-y-4 animate-fade-in">
              <form onSubmit={handleUrlSubmit} className="space-y-4" name="url-submission" data-netlify="true">
                <input type="hidden" name="form-name" value="url-submission" />
                <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                  <Input
                    type="url"
                    name="url"
                    placeholder="Paste your link here…"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                    className="flex-1 h-14 rounded-xl border-2 border-border px-5 text-base focus:border-primary bg-card transition-colors"
                  />
                  <Button 
                    type="submit"
                    className="h-14 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    🟩 Paste your link
                  </Button>
                </div>
              </form>
              
              <button className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline">
                Upload screenshot instead
              </button>

              {/* (B) Micro Trust Section */}
              <p className="text-sm text-muted-foreground pt-4">
                No sign-up. No fluff.<br />
                Just drop your link and get instant distribution recommendations.
              </p>
            </div>
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

                  <form onSubmit={handleEmailSubmit} className="space-y-4" name="email-submission" data-netlify="true">
                    <input type="hidden" name="form-name" value="email-submission" />
                    <input type="hidden" name="url" value={url} />
                    <Input
                      type="email"
                      name="email"
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
                    <span className="text-5xl animate-bounce">🦆</span>
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
                    <div className="p-4 bg-muted rounded-xl">
                      <p className="text-sm font-semibold text-primary mb-2">Reddit</p>
                      <ul className="space-y-1">
                        {PLACEHOLDER_RESULTS.reddit.map((sub, i) => (
                          <li key={i} className="text-foreground">{sub}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 bg-muted rounded-xl">
                      <p className="text-sm font-semibold text-primary mb-2">Facebook Groups</p>
                      <ul className="space-y-1">
                        {PLACEHOLDER_RESULTS.facebookGroups.map((group, i) => (
                          <li key={i} className="text-foreground">{group}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 bg-muted rounded-xl">
                      <p className="text-sm font-semibold text-primary mb-2">Communities</p>
                      <ul className="space-y-1">
                        {PLACEHOLDER_RESULTS.communities.map((community, i) => (
                          <li key={i} className="text-foreground">{community}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 bg-muted rounded-xl">
                      <p className="text-sm font-semibold text-primary mb-2">Newsletters</p>
                      <ul className="space-y-1">
                        {PLACEHOLDER_RESULTS.newsletters.map((newsletter, i) => (
                          <li key={i} className="text-foreground">{newsletter}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
                      <p className="text-sm font-semibold text-primary mb-1">Why These Channels Work</p>
                      <p className="text-foreground text-sm">
                        Your content matches the audience interests inside these communities.
                        <span className="block text-muted-foreground text-xs mt-1">(This is a placeholder — real logic will be applied later.)</span>
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-xl border border-border text-center">
                    <p className="text-sm text-foreground font-medium">📬 Check your email</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      A copy has been sent to {email}
                    </p>
                  </div>

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

      {/* (C) What You Get Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-3xl mx-auto text-center space-y-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
            What You Get
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <span className="text-4xl">🎯</span>
              <h3 className="text-lg font-semibold text-foreground">Find Your Audience</h3>
              <p className="text-muted-foreground">
                The top places online where your audience already hangs out
              </p>
            </div>
            
            <div className="space-y-3">
              <span className="text-4xl">🚀</span>
              <h3 className="text-lg font-semibold text-foreground">Faster Traction</h3>
              <p className="text-muted-foreground">
                Get traction faster by posting in the right channels
              </p>
            </div>
            
            <div className="space-y-3">
              <span className="text-4xl">🔍</span>
              <h3 className="text-lg font-semibold text-foreground">AI-Powered Matching</h3>
              <p className="text-muted-foreground">
                AI-powered relevance matching (manual for now, automated later)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* (D) Example Output Section */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
            Sample Recommendations
          </h2>
          <p className="text-muted-foreground">Here's exactly what you'll see:</p>
          
          <Card className="border-2 border-border bg-card">
            <CardContent className="p-6 text-left space-y-2">
              <p className="text-foreground">• r/Placeholder1</p>
              <p className="text-foreground">• r/Placeholder2</p>
              <p className="text-foreground">• Discord Community Placeholder 1</p>
              <p className="text-foreground">• FB Group Placeholder A</p>
              <p className="text-foreground">• Newsletter Placeholder One</p>
              <p className="text-muted-foreground italic">And more…</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* (E) Social Proof Section */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-lg text-muted-foreground">
            Over <span className="font-semibold text-foreground">27 builders</span> have already used TrafficDuck in early access.
          </p>
        </div>
      </section>

      {/* (F) Bottom CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-lg mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
            Ready to find your audience?
          </h2>
          <Button 
            onClick={scrollToTop}
            className="h-14 px-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all text-lg"
          >
            🟩 Paste your link
          </Button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
