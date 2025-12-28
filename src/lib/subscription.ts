export type SubscriptionTier = "free" | "core" | "pro";

export function resolveTierFromProfile(profile?: {
  subscription_status?: string | null;
  price_id?: string | null;
}): SubscriptionTier {
  const active = profile?.subscription_status === "active" || profile?.subscription_status === "trialing";
  const corePrice = process.env.NEXT_PUBLIC_STRIPE_PRICE_CORE;
  const proPrice = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO;
  if (active) {
    if (profile?.price_id && proPrice && profile.price_id === proPrice) return "pro";
    if (profile?.price_id && corePrice && profile.price_id === corePrice) return "core";
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
    case "core":
      return {
        maxKeywords: 1,
        maxWeeklyResultsPerKeyword: 12,
      };
    case "pro":
      return {
        maxKeywords: "unlimited",
        maxWeeklyResultsPerKeyword: "unlimited",
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
      id: "core",
      name: "Core",
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_CORE,
      priceLabel: "$29",
      period: "per month",
      features: [
        "Reddit + Hacker News monitoring",
        "Weekly conversation cap",
        '"Why it matters" insights',
        "3 keywords niches",
      ],
    },
    {
      id: "pro",
      name: "Pro",
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
      priceLabel: "$59",
      period: "per month",
      features: [
        "All platforms: Reddit, Hacker News, Twitter/X",
        "Higher/Unlimited conversations",
        "Priority support",
        "Advanced analytics",
        "Custom alerts",
        "10 keywords niches",
      ],
    },
  ];
}

