import { FileText, Search, Sparkles } from "lucide-react";

const steps = [
  {
    icon: FileText,
    step: "1",
    title: "Paste Your Content",
    description: "Copy any blog post, article, or webpage you want to optimize",
  },
  {
    icon: Search,
    step: "2",
    title: "Get AI Analysis",
    description: "Traffic Duck scans for SEO gaps, keyword opportunities, and ranking factors",
  },
  {
    icon: Sparkles,
    step: "3",
    title: "Apply & Rank",
    description: "Implement the suggested improvements and watch your traffic grow",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            SEO optimization in <span className="text-primary">3 simple steps</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            No technical knowledge required. No hours of research. Just paste, analyze, and improve.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((item, index) => (
            <div
              key={index}
              className="relative text-center animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
                <item.icon className="w-8 h-8 text-primary" />
              </div>
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-secondary text-white rounded-full flex items-center justify-center font-heading font-bold text-lg">
                {item.step}
              </div>
              <h3 className="text-xl font-heading font-semibold mb-3">
                {item.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
