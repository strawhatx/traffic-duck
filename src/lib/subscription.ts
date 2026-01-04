export type SubscriptionTier = "free" | "early" | "builder";

export function resolveTierFromProfile(profile?: {
  subscription_status?: string | null;
  price_id?: string | null;
}): SubscriptionTier {
  const active = profile?.subscription_status === "active" || profile?.subscription_status === "trialing";
  const earlyPrice = process.env.NEXT_PUBLIC_STRIPE_PRICE_EARLY || process.env.NEXT_PUBLIC_STRIPE_PRICE_CORE;
  const builderPrice = process.env.NEXT_PUBLIC_STRIPE_PRICE_BUILDER || process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO;
  if (active) {
    if (profile?.price_id && builderPrice && profile.price_id === builderPrice) return "builder";
    if (profile?.price_id && earlyPrice && profile.price_id === earlyPrice) return "early";
  }
  return "free";
}

export type PlanLimits = {
  maxKeywords: number | "unlimited";
  maxWeeklyPulls?: number | "unlimited";
  maxWeeklyResultsPerKeyword?: number | "unlimited";
  maxLifetimeResults?: number | "unlimited";
};

export function getPlanLimits(tier: SubscriptionTier): PlanLimits {
  switch (tier) {
    case "free":
      return {
        maxKeywords: 1,
        // Enforced server-side via trigger on search_results
        maxLifetimeResults: 2,
      };
    case "early":
      return {
        maxKeywords: 3,
        maxWeeklyResultsPerKeyword: 10,
      };
    case "builder":
      return {
        maxKeywords: 10,
        maxWeeklyResultsPerKeyword: 25,
        maxLifetimeResults: "unlimited",
      };
  }
}

export type UpgradePlan = {
  id: Exclude<SubscriptionTier, "free">;
  name: string;
  priceId: string | undefined;
  priceLabel: string;
  period: string;
  features: string[];
};

export function getUpgradePlans(): UpgradePlan[] {
  return [
    {
      id: "early",
      name: "Early Access",
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_EARLY || process.env.NEXT_PUBLIC_STRIPE_PRICE_CORE,
      priceLabel: "$9",
      period: "per month",
      features: [
        "Up to 3 monitors",
        "Daily automated scan",
        "2–3 high-signal conversations per day",
        "Platforms: X / Twitter only",
        "Past 7 days",
        "Email digest",
        "Relevance-sorted (default)",
      ],
    },
    {
      id: "builder",
      name: "Builder",
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_BUILDER || process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
      priceLabel: "$19",
      period: "per month",
      features: [
        "Up to 3 monitors",
        "Daily or weekly scans",
        "Platforms: All supported (X, Reddit, HackerNews, etc.)",
        "5–7 posts per day",
        "Engagement + relevance sorting",
        "60–90-day history",
        "Multiple projects",
      ],
    },
  ];
}

