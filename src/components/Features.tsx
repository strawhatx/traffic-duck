import { Key, TrendingUp, Lightbulb, Zap } from "lucide-react";

const features = [
  {
    icon: Key,
    title: "Find Missing Keywords",
    description: "Discover high-impact keywords your competitors are ranking for — but you're not using yet",
  },
  {
    icon: TrendingUp,
    title: "Get Your SEO Score",
    description: "See exactly where you stand and what's keeping you from page one rankings",
  },
  {
    icon: Lightbulb,
    title: "Actionable Fixes",
    description: "No vague advice — get specific improvements you can implement in minutes",
  },
  {
    icon: Zap,
    title: "Instant Analysis",
    description: "Paste your content, get results in seconds. No complex tools or hours of research",
  },
];

const Features = () => {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-card p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 animate-fade-in border border-border/50"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-heading font-semibold mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
