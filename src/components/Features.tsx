import { Key, TrendingUp, Lightbulb, Zap } from "lucide-react";

const features = [
  {
    icon: Key,
    title: "Keyword Optimization",
    description: "Identify the best keywords to boost ranking",
  },
  {
    icon: TrendingUp,
    title: "SEO Score",
    description: "Measure content performance and potential",
  },
  {
    icon: Lightbulb,
    title: "Content Suggestions",
    description: "Get actionable tips to improve posts",
  },
  {
    icon: Zap,
    title: "Quick & Easy",
    description: "Optimize your content in seconds, no manual work",
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
