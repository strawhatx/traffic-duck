import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import logo from "@/assets/duck-mascot.png";

type UserGoal = "traffic" | "growth" | "expertise";

type Metrics = {
  comments?: number;
  likes?: number;
  upvotes?: number;
};

type RedditItem = {
  title: string;
  subreddit: string;
  relevance: string;
  preview: string;
  link: string;
  metrics: Metrics;
};

type TwitterItem = {
  creator: string;
  summary: string;
  relevance: string;
  title: string;
  preview: string;
  link: string;
  metrics: Metrics;
};

type LinkedInItem = {
  author: string;
  subject: string;
  angle: string;
  preview: string;
  link: string;
  metrics: Metrics;
};

type DistributionMap = {
  reddit: RedditItem[];
  twitter: TwitterItem[];
  linkedin: LinkedInItem[];
};

const LandingPage = () => {
  const [niche, setNiche] = useState("");
  const [audience, setAudience] = useState("");
  const [goal, setGoal] = useState<UserGoal>("traffic");
  const [isGenerating, setIsGenerating] = useState(false);
  const [map, setMap] = useState<DistributionMap | null>(null);
  const [step, setStep] = useState<number>(1);
  const formRef = useRef<HTMLDivElement | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const [replyDraftByKey, setReplyDraftByKey] = useState<Record<string, string>>({});
  const [enhanceInputByKey, setEnhanceInputByKey] = useState<Record<string, string>>({});
  const [enhanceResultByKey, setEnhanceResultByKey] = useState<Record<string, string>>({});
  const [openGenerateKey, setOpenGenerateKey] = useState<string | null>(null);
  const [openEnhanceKey, setOpenEnhanceKey] = useState<string | null>(null);
  const [intentEmail, setIntentEmail] = useState("");
  const [intentPlatforms, setIntentPlatforms] = useState<string[]>([]);
  const [intentUrgency, setIntentUrgency] = useState<number>(3);
  const [isSubmittingIntent, setIsSubmittingIntent] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const generateDistributionMap = (topic: string, target: string): DistributionMap => {
    const topicCap = topic.trim() || "your niche";
    const targetCap = target.trim() || "your audience";
    const nowHint = "this week";

    const reddit: RedditItem[] = [
      {
        title: `Best practices for ${topicCap} that actually moved the needle`,
        subreddit: `r/${topicCap.replace(/\s+/g, '')}Growth`,
        relevance: `Members are sharing what's working ${nowHint} for ${targetCap}.`,
        preview: `We tested three ${topicCap} tactics across two cohorts. Here’s what actually improved outcomes for ${targetCap}...`,
        link: `https://www.reddit.com/${topicCap.replace(/\s+/g, '').toLowerCase()}growth/comments/abc123`,
        metrics: { upvotes: 184, comments: 37 }
      },
      {
        title: `Help me improve my ${topicCap} strategy for ${targetCap}`,
        subreddit: `r/${topicCap.replace(/\s+/g, '')}Advice`,
        relevance: `High comment velocity; perfect for adding your perspective.`,
        preview: `Current plan focuses on two channels; results are flat. Looking for feedback from folks targeting ${targetCap}...`,
        link: `https://www.reddit.com/${topicCap.replace(/\s+/g, '').toLowerCase()}advice/comments/def456`,
        metrics: { upvotes: 96, comments: 52 }
      },
      {
        title: `${topicCap} tools roundup ${nowHint}`,
        subreddit: `r/${topicCap.replace(/\s+/g, '')}Tools`,
        relevance: `Tool comparisons are trending; you can contribute pros/cons.`,
        preview: `Roundup of tools helping ${targetCap} implement ${topicCap}. Pros/cons from hands-on trials...`,
        link: `https://www.reddit.com/${topicCap.replace(/\s+/g, '').toLowerCase()}tools/comments/ghi789`,
        metrics: { upvotes: 142, comments: 28 }
      },
      {
        title: `Case study: How we reached ${targetCap} using ${topicCap}`,
        subreddit: `r/CaseStudies`,
        relevance: `Case studies pull strong engagement and invite thoughtful discussion.`,
        preview: `From zero to traction: our ${topicCap} rollout plan with hard numbers and what we’d change...`,
        link: `https://www.reddit.com/r/casestudies/comments/jkl012`,
        metrics: { upvotes: 211, comments: 44 }
      },
      {
        title: `What did you try this week in ${topicCap}?`,
        subreddit: `r/WeeklyWins`,
        relevance: `Weekly open thread — easy entry to join relevant conversations.`,
        preview: `Drop your quick wins and fails in ${topicCap}. What moved the needle for ${targetCap}?`,
        link: `https://www.reddit.com/r/weeklywins/comments/mno345`,
        metrics: { upvotes: 73, comments: 63 }
      }
    ];

    const twitter: TwitterItem[] = [
      {
        creator: `@${topicCap.replace(/\s+/g, '')}Insider`,
        summary: `Thread on actionable ${topicCap} tactics that resonate with ${targetCap}.`,
        relevance: `Reply with a concrete example or mini case study.`,
        title: `Actionable ${topicCap} tactics`,
        preview: `“We shipped 3 micro-experiments in ${topicCap}. Here’s the one that stuck with ${targetCap}...”`,
        link: `https://twitter.com/${topicCap.replace(/\s+/g, '')}Insider/status/1234567890`,
        metrics: { likes: 320, comments: 41 }
      },
      {
        creator: `@buildinpublic_${topicCap.replace(/\s+/g, '').toLowerCase()}`,
        summary: `Sharing behind-the-scenes metrics after testing ${topicCap} frameworks.`,
        relevance: `Add a metric or lesson learned to spark follow-up questions.`,
        title: `Behind-the-scenes metrics`,
        preview: `“Tried 2 frameworks for ${topicCap}. One got 3x CTR from ${targetCap}. Why we think it worked...”`,
        link: `https://twitter.com/buildinpublic_${topicCap.replace(/\s+/g, '').toLowerCase()}/status/2345678901`,
        metrics: { likes: 188, comments: 27 }
      },
      {
        creator: `@${topicCap.split(" ")[0] || "pro"}_daily`,
        summary: `Short list of common mistakes ${targetCap} make with ${topicCap}.`,
        relevance: `Offer a corrective checklist; people love saveable replies.`,
        title: `Mistakes ${targetCap} make`,
        preview: `“Top 5 ${topicCap} mistakes we keep seeing from ${targetCap} — and how to fix them...”`,
        link: `https://twitter.com/${(topicCap.split(" ")[0] || "pro")}_daily/status/3456789012`,
        metrics: { likes: 254, comments: 33 }
      },
      {
        creator: `@${targetCap.replace(/\s+/g, '')}Hub`,
        summary: `Curated links about ${topicCap} trends ${nowHint}.`,
        relevance: `Point to an under-discussed angle and ask for takes.`,
        title: `${topicCap} trends ${nowHint}`,
        preview: `“Handpicked ${topicCap} reads for ${targetCap}. The under-discussed angle: lifecycle timing...”`,
        link: `https://twitter.com/${targetCap.replace(/\s+/g, '')}Hub/status/4567890123`,
        metrics: { likes: 147, comments: 18 }
      },
      {
        creator: `@ops_${topicCap.replace(/\s+/g, '').toLowerCase()}`,
        summary: `Ops view: implementation pitfalls when rolling out ${topicCap}.`,
        relevance: `Suggest a playbook step or a pre-mortem question.`,
        title: `Implementation pitfalls`,
        preview: `“Rolling out ${topicCap}? These 3 ops pitfalls cost us time with ${targetCap}...”`,
        link: `https://twitter.com/ops_${topicCap.replace(/\s+/g, '').toLowerCase()}/status/5678901234`,
        metrics: { likes: 101, comments: 15 }
      }
    ];

    const linkedin: LinkedInItem[] = [
      {
        author: `${topicCap} Practitioner`,
        subject: `A practical framework for ${topicCap} targeting ${targetCap}`,
        angle: `Share a 3-step checklist and invite others to add steps.`,
        preview: `We’ve been iterating a simple ${topicCap} framework for ${targetCap}. Here’s the 3-step version...`,
        link: `https://www.linkedin.com/feed/update/urn:li:activity:111222333`,
        metrics: { likes: 289, comments: 22 }
      },
      {
        author: `Head of ${topicCap} @ GrowthCo`,
        subject: `What changed for us after focusing on ${targetCap}`,
        angle: `Comment with a counterintuitive lesson or a small win.`,
        preview: `Switching to ${targetCap}-first changed our roadmap. Biggest surprise and the metric that moved...`,
        link: `https://www.linkedin.com/feed/update/urn:li:activity:222333444`,
        metrics: { likes: 173, comments: 19 }
      },
      {
        author: `${targetCap} Community Manager`,
        subject: `Top challenges ${targetCap} face with ${topicCap}`,
        angle: `Add a quick fix and ask if others have tried it.`,
        preview: `The three friction points we keep hearing from ${targetCap} around ${topicCap}...`,
        link: `https://www.linkedin.com/feed/update/urn:li:activity:333444555`,
        metrics: { likes: 142, comments: 24 }
      },
      {
        author: `Founder working on ${topicCap}`,
        subject: `How we validated a ${topicCap} idea with ${targetCap}`,
        angle: `Offer a leaner validation step or alternate channel.`,
        preview: `Validation notes from building in public: what resonated with ${targetCap} and what fell flat...`,
        link: `https://www.linkedin.com/feed/update/urn:li:activity:444555666`,
        metrics: { likes: 118, comments: 14 }
      },
      {
        author: `Analyst covering ${topicCap}`,
        subject: `Trends report: ${topicCap} adoption and what's next`,
        angle: `Pull out a stat and connect it to a practical action.`,
        preview: `Latest data on ${topicCap} adoption. One chart ${targetCap} should care about and why...`,
        link: `https://www.linkedin.com/feed/update/urn:li:activity:555666777`,
        metrics: { likes: 205, comments: 17 }
      }
    ];

    return { reddit, twitter, linkedin };
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!niche.trim() || !audience.trim() || !goal) {
      toast.error("Please fill in both fields.");
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      const result = generateDistributionMap(niche, audience);
      setMap(result);
      setIsGenerating(false);
      toast.success("Your Distribution Map is ready!");
      resultsRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 900);
  };

  const improveReply = (text: string, topic: string, target: string) => {
    const trimmed = text.trim();
    if (!trimmed) return "";
    const opener = `For ${target || "your audience"} interested in ${topic || "this topic"}, here's a sharper take:`;
    const improved = [
      opener,
      "",
      trimmed
        .replace(/\s+/g, " ")
        .replace(/^i\s/g, "I ")
        .replace(/\.?$/, "."),
      "",
      "Quick upgrades:",
      "• Lead with 1 tangible outcome",
      "• Add 1 number or example",
      "• End with a specific question to invite replies"
    ].join("\n");
    return improved;
  };

  const itemKey = (platform: "reddit" | "twitter" | "linkedin", idx: number) =>
    `${platform}-${idx}`;

  const generateReplyDraft = (
    platform: "reddit" | "twitter" | "linkedin",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    item: any,
    userGoal: UserGoal
  ): string => {
    const context =
      platform === "reddit"
        ? `${item.title} — ${item.preview} (${item.subreddit})`
        : platform === "twitter"
          ? `${item.title} by ${item.creator} — ${item.preview}`
          : `${item.subject} by ${item.author} — ${item.preview}`;
    const goalLine =
      userGoal === "traffic"
        ? "I'll add a clear outcome and CTA to drive clicks."
        : userGoal === "growth"
          ? "I'll focus on curiosity and reply-magnet phrasing to spark a thread."
          : "I'll tighten authority signals and make it concise, confident, and helpful.";
    return [
      `Jumping in on this conversation about ${niche} for ${audience}.`,
      "",
      `Context: ${context}`,
      "",
      "Draft reply:",
      `• Quick insight: a specific tactic that works for ${audience} in ${niche}.`,
      "• 1 number/example to anchor credibility.",
      "• Invite discussion with a focused question.",
      "",
      goalLine
    ].join("\n");
  };

  const handleGenerateReply = (
    platform: "reddit" | "twitter" | "linkedin",
    idx: number
  ) => {
    if (!map) return;
    const key = itemKey(platform, idx);
    const item =
      platform === "reddit"
        ? map.reddit[idx]
        : platform === "twitter"
          ? map.twitter[idx]
          : map.linkedin[idx];
    const draft = generateReplyDraft(platform, item, goal);
    setReplyDraftByKey((prev) => ({ ...prev, [key]: draft }));
    setOpenGenerateKey(key);
    toast.success("Draft reply generated.");
  };

  const handleEnhanceForItem = (
    platform: "reddit" | "twitter" | "linkedin",
    idx: number
  ) => {
    const key = itemKey(platform, idx);
    const text = enhanceInputByKey[key] || "";
    const result = improveReply(text, niche, audience);
    if (!result) {
      toast.error("Paste a reply to enhance.");
      return;
    }
    setEnhanceResultByKey((prev) => ({ ...prev, [key]: result }));
    toast.success("Enhanced reply ready.");
  };

  const totalSteps = 3;
  const progressValue = Math.round((step / totalSteps) * 100);

  const handleWizardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!niche.trim()) {
        toast.error("Please enter what you talk about.");
        return;
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!audience.trim()) {
        toast.error("Please enter your audience.");
        return;
      }
      setStep(3);
      return;
    }
    if (step === 3) {
      void handleGenerate(e);
    }
  };

  const encode = (data: Record<string, string>) =>
    Object.keys(data)
      .map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
      .join("&");

  const handleIntentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!intentEmail.trim()) {
      toast.error("Please enter your email.");
      return;
    }
    setIsSubmittingIntent(true);
    try {
      const payload = {
        "form-name": "waitlist-intent",
        email: intentEmail.trim(),
        niche: niche.trim(),
        audience: audience.trim(),
        goal,
        platforms: intentPlatforms.join(","),
        urgency: String(intentUrgency)
      };
      const res = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encode(payload)
      });
      if (!res.ok) throw new Error("Submit failed");
      toast.success("You're on the waitlist — thanks!");
      setIntentEmail("");
      setIntentPlatforms([]);
      setIntentUrgency(3);
    } catch {
      toast.error("Could not submit right now. Please try again.");
    } finally {
      setIsSubmittingIntent(false);
    }
  };

  const parseKey = (key: string | null): { platform: "reddit" | "twitter" | "linkedin"; idx: number } | null => {
    if (!key) return null;
    const [platform, idxStr] = key.split("-");
    const idx = Number(idxStr);
    if (platform !== "reddit" && platform !== "twitter" && platform !== "linkedin") return null;
    if (Number.isNaN(idx)) return null;
    return { platform, idx };
  };

  const getItemForKey = (
    key: string | null
  ):
    | { platform: "reddit" | "twitter" | "linkedin"; idx: number; item: unknown; title: string }
    | null => {
    const parsed = parseKey(key);
    if (!parsed || !map) return null;
    const { platform, idx } = parsed;
    if (platform === "reddit") {
      const item = map.reddit[idx];
      if (!item) return null;
      return { platform, idx, item, title: item.title };
    }
    if (platform === "twitter") {
      const item = map.twitter[idx];
      if (!item) return null;
      return { platform, idx, item, title: item.title };
    }
    const item = map.linkedin[idx];
    if (!item) return null;
    return { platform: "linkedin", idx, item, title: item.subject };
  };
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-2xl w-full mx-auto text-center space-y-8">
          <div className="space-y-4 animate-fade-in">
            <img src={logo} alt="TrafficDuck" className="w-24 h-24 mx-auto" />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold tracking-tight text-foreground">
              Find active conversations in your niche — get traffic without an audience.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
              TrafficDuck shows you live-feeling Reddit, X, and LinkedIn conversations tailored to your niche.
            </p>
          </div>
          <Button
            onClick={scrollToForm}
            className="h-14 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Get Early Access — Join Waitlist
          </Button>
        </div>
      </section>

      {/* Wizard Form */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-2xl mx-auto">
          <Card className="border-0 shadow-none bg-transparent">
            <CardContent className="p-8 space-y-6">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-heading font-bold text-foreground">Tell us your niche</h2>
                  <span className="text-xs text-muted-foreground">Step {step} of {totalSteps}</span>
                </div>
                <Progress value={progressValue} className="h-2" />
                <p className="text-muted-foreground">We’ll generate a fictional but realistic Distribution Map to validate the flow.</p>
              </div>
              <form onSubmit={handleWizardSubmit} className="space-y-5">
                {step === 1 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">What do you talk about?</label>
                    <Input
                      type="text"
                      placeholder="e.g., AI content marketing, indie hacking, dev tools"
                      value={niche}
                      onChange={(e) => setNiche(e.target.value)}
                      className="h-12 rounded-xl border-2 border-border px-4 bg-background"
                    />
                  </div>
                )}
                {step === 2 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Who is your audience?</label>
                    <Input
                      type="text"
                      placeholder="e.g., SaaS founders, senior engineers, creators, marketers"
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      className="h-12 rounded-xl border-2 border-border px-4 bg-background"
                    />
                  </div>
                )}
                {step === 3 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">What is your goal?</label>
                      <Select value={goal} onValueChange={(v: UserGoal) => setGoal(v)}>
                        <SelectTrigger className="h-12 rounded-xl border-2 border-border bg-background">
                          <SelectValue placeholder="Select goal" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="traffic">Drive traffic</SelectItem>
                          <SelectItem value="growth">Spark growth</SelectItem>
                          <SelectItem value="expertise">Show expertise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="rounded-xl bg-muted p-4 text-sm text-foreground">
                      <p><span className="font-semibold">You talk about:</span> {niche || "—"}</p>
                      <p><span className="font-semibold">Your audience:</span> {audience || "—"}</p>
                      <p><span className="font-semibold">Goal:</span> {goal}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <Button type="button" variant="secondary" disabled={step === 1} onClick={() => setStep((s) => Math.max(1, s - 1))}>
                    ← Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={isGenerating}
                    className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    {step < totalSteps ? "Next" : (isGenerating ? "Generating…" : "Generate Distribution Map")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Distribution Map Output */}
      {map && (
        <section ref={resultsRef} className="py-16 px-4">
          <div className="max-w-4xl mx-auto space-y-10">
            <div className="text-center space-y-2">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">Your Distribution Map</h2>
              <p className="text-muted-foreground">Based on "{niche}" for "{audience}"</p>
            </div>

            {/* Reddit */}
            <Card className="border-0 shadow-none bg-transparent">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xl font-semibold text-foreground">Reddit</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {map.reddit.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-muted space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-primary uppercase">Reddit</span>
                        <span className="text-xs text-muted-foreground">⬆ {item.metrics.upvotes} · 💬 {item.metrics.comments}</span>
                      </div>
                      <p className="font-medium text-foreground">{item.title}</p>
                      <p className="text-sm text-muted-foreground">Subreddit: {item.subreddit}</p>
                      <p className="text-sm text-foreground">{item.preview}</p>
                      <p className="text-sm text-primary">{item.relevance}</p>
                      <a href={item.link} target="_blank" rel="noreferrer" className="text-sm underline underline-offset-4 text-foreground">
                        Open Conversation →
                      </a>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <Button size="sm" onClick={() => handleGenerateReply("reddit", idx)}>
                          Generate Reply
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => setOpenEnhanceKey(itemKey("reddit", idx))}>
                          Enhance My Reply
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Twitter/X */}
            <Card className="border-0 shadow-none bg-transparent">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xl font-semibold text-foreground">Twitter / X</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {map.twitter.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-muted space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-primary uppercase">Twitter / X</span>
                        <span className="text-xs text-muted-foreground">❤️ {item.metrics.likes} · 💬 {item.metrics.comments}</span>
                      </div>
                      <p className="font-medium text-foreground">{item.title}</p>
                      <p className="text-sm text-muted-foreground">Creator: {item.creator}</p>
                      <p className="text-sm text-foreground">{item.preview}</p>
                      <p className="text-sm text-primary">{item.relevance}</p>
                      <a href={item.link} target="_blank" rel="noreferrer" className="text-sm underline underline-offset-4 text-foreground">
                        Open Conversation →
                      </a>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <Button size="sm" onClick={() => handleGenerateReply("twitter", idx)}>
                          Generate Reply
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => setOpenEnhanceKey(itemKey("twitter", idx))}>
                          Enhance My Reply
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* LinkedIn */}
            <Card className="border-0 shadow-none bg-transparent">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xl font-semibold text-foreground">LinkedIn</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {map.linkedin.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-muted space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-primary uppercase">LinkedIn</span>
                        <span className="text-xs text-muted-foreground">👍 {item.metrics.likes} · 💬 {item.metrics.comments}</span>
                      </div>
                      <p className="font-medium text-foreground">{item.subject}</p>
                      <p className="text-sm text-muted-foreground">Author: {item.author}</p>
                      <p className="text-sm text-foreground">{item.preview}</p>
                      <p className="text-sm text-primary">{item.angle}</p>
                      <a href={item.link} target="_blank" rel="noreferrer" className="text-sm underline underline-offset-4 text-foreground">
                        Open Conversation →
                      </a>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <Button size="sm" onClick={() => handleGenerateReply("linkedin", idx)}>
                          Generate Reply
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => setOpenEnhanceKey(itemKey("linkedin", idx))}>
                          Enhance My Reply
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Reply Modals */}
      <Dialog open={!!openGenerateKey} onOpenChange={(open) => { if (!open) setOpenGenerateKey(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generated Reply</DialogTitle>
            <DialogDescription>Use this as a high-engagement starting point.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-muted/50 border border-border whitespace-pre-wrap text-sm text-foreground">
              {openGenerateKey ? (replyDraftByKey[openGenerateKey] || "Generating...") : ""}
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpenGenerateKey(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!openEnhanceKey} onOpenChange={(open) => { if (!open) setOpenEnhanceKey(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enhance My Reply</DialogTitle>
            <DialogDescription>Paste your draft; we’ll make it clearer and more compelling.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea
              value={openEnhanceKey ? (enhanceInputByKey[openEnhanceKey] || "") : ""}
              onChange={(e) => {
                if (!openEnhanceKey) return;
                setEnhanceInputByKey((prev) => ({ ...prev, [openEnhanceKey]: e.target.value }));
              }}
              placeholder="Paste your reply to enhance…"
              className="min-h-[140px] rounded-xl border-2 border-border bg-background"
            />
            {openEnhanceKey && (
              <Button
                onClick={() => {
                  const parsed = parseKey(openEnhanceKey);
                  if (!parsed) return;
                  handleEnhanceForItem(parsed.platform, parsed.idx);
                }}
              >
                Enhance
              </Button>
            )}
            {openEnhanceKey && enhanceResultByKey[openEnhanceKey] && (
              <div className="p-3 rounded-lg bg-muted/50 border border-border whitespace-pre-wrap text-sm text-foreground">
                {enhanceResultByKey[openEnhanceKey]}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpenEnhanceKey(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* (D) Example Output Section */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
            Why this works
          </h2>
          <p className="text-muted-foreground">We point you to live-feeling conversations to validate distribution quickly.</p>

          <Card className="border-2 border-border bg-card">
            <CardContent className="p-6 text-left space-y-2">
              <p className="text-foreground">• Find relevant threads fast</p>
              <p className="text-foreground">• Drop helpful replies that get attention</p>
              <p className="text-foreground">• Iterate with AI to sound clearer and more authoritative</p>
              <p className="text-muted-foreground italic">No API calls yet — this is a validation build.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonial (before Bottom CTA) */}
      <section className="py-14 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-6">
            <div className="relative max-w-3xl mx-auto">
              <p className="text-2xl md:text-3xl lg:text-4xl font-heading tracking-tight text-foreground">
                TrafficDuck has been{" "}
                <span className="text-primary">invaluable</span> for finding conversations.
                I highly{" "}
                <span className="text-primary">recommend it</span> to anyone looking for
                speed without compromising on quality.
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Takara Qode</p>
              <p className="text-xs text-muted-foreground">Founder</p>
            </div>
            <div className="flex items-center justify-center gap-3">
              {/* Subtle avatar rail to echo social proof */}
              {[0,1,2,3,4,5,6,7,8].map((i) => (
                <div
                  key={i}
                  className={`h-10 w-10 rounded-full overflow-hidden border ${
                    i === 4 ? "border-primary ring-2 ring-primary/40" : "border-border opacity-60"
                  }`}
                  style={{ filter: i === 4 ? "none" : "grayscale(100%)" }}
                >
                  <img
                    src={i === 4 ? logo : "/placeholder.svg"}
                    alt="avatar"
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* (F) Bottom CTA Section */}
      <section ref={formRef} className="py-20 px-4">
        <div className="max-w-lg mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
            Ready to find your audience?
          </h2>
          <form
            name="waitlist-intent"
            method="POST"
            data-netlify="true"
            netlify-honeypot="bot-field"
            onSubmit={handleIntentSubmit}
            className="space-y-5"
          >
            <input type="hidden" name="form-name" value="waitlist-intent" />
            <input type="text" name="bot-field" className="hidden" />
            <input type="hidden" name="niche" value={niche} />
            <input type="hidden" name="audience" value={audience} />
            <input type="hidden" name="goal" value={goal} />
            <input type="hidden" name="platforms" value={intentPlatforms.join(",")} />
            <input type="hidden" name="urgency" value={intentUrgency} />
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={intentEmail}
                onChange={(e) => setIntentEmail(e.target.value)}
                className="h-12 rounded-xl border-2 border-border bg-background"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Which platform(s) do you want traffic from?</label>
              <div className="flex flex-wrap gap-4">
                {["Twitter / X", "Reddit", "LinkedIn"].map((label) => {
                  const value = label.toLowerCase().includes("twitter") ? "twitter" : label.toLowerCase();
                  const checked = intentPlatforms.includes(value);
                  return (
                    <label key={value} className="flex items-center gap-2 text-sm text-foreground">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) => {
                          const isChecked = v === true;
                          setIntentPlatforms((prev) =>
                            isChecked ? [...new Set([...prev, value])] : prev.filter((p) => p !== value)
                          );
                        }}
                      />
                      {label}
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">How urgently do you need traffic? (1–5)</label>
                <span className="text-sm text-muted-foreground">{intentUrgency}</span>
              </div>
              <Slider
                value={[intentUrgency]}
                min={1}
                max={5}
                step={1}
                onValueChange={(v) => setIntentUrgency(v[0] ?? 3)}
                className="mt-2"
              />
            </div>
            <Button
              type="submit"
              disabled={isSubmittingIntent}
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              {isSubmittingIntent ? "Submitting…" : "Join Waitlist"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Get early access — includes FREE weekly audits until the MVP is live.
            </p>
          </form>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
