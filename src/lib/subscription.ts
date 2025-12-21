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


