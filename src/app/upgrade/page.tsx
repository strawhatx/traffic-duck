"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabaseClient";
import { Crown, Zap, Check } from "lucide-react";
import Link from "next/link";
import { getUpgradePlans, type UpgradePlan, resolveTierFromProfile, type SubscriptionTier } from "@/lib/subscription";
import { useRouter } from "next/navigation";

const plans = getUpgradePlans();

export default function UpgradePage() {
  const [loadingId, setLoadingId] = useState<UpgradePlan["id"] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [tier, setTier] = useState<SubscriptionTier>("free");
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (mounted && !userData?.user) {
        router.push("/");
        return;
      }
      if (!mounted) return;
      setUserEmail(userData?.user?.email ?? null);
      const userId = userData?.user?.id;
      if (userId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("subscription_status, price_id")
          .eq("id", userId)
          .maybeSingle();
        if (mounted) setTier(resolveTierFromProfile(profile ?? undefined));
      }
    })();
    return () => {
      mounted = false;
    };
  }, [router]);

  const handleUpgrade = async (plan: UpgradePlan) => {
    try {
      setError(null);
      setLoadingId(plan.id);
      if (!plan.priceId) {
        setError("Pricing not configured");
        setLoadingId(null);
        return;
      }
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) {
        setError("You must be signed in");
        setLoadingId(null);
        return;
      }
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: plan.priceId, userId }),
      });
      const payload = await res.json();
      if (!res.ok || !payload?.url) {
        setError(payload?.error ?? "Failed to start checkout");
        setLoadingId(null);
        return;
      }
      window.location.href = payload.url as string;
    } catch (e: any) {
      setError(e?.message ?? "Error starting checkout");
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl mb-2">Upgrade</h1>
            <p className="text-slate-600">Choose a plan that fits your needs.</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/keywords">Back to Keywords</Link>
          </Button>
        </div>

        {/* Current Plan */}
        <Card className="p-6 mb-8 border-2 border-blue-200 bg-blue-50">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl">Current Plan</h2>
                <Badge
                  className={
                    tier === "pro"
                      ? "bg-purple-600 text-white"
                      : tier === "core"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-600 text-white"
                  }
                >
                  {tier.toUpperCase()}
                </Badge>
              </div>
              <p className="text-slate-700 mb-4">
                {tier === "pro"
                  ? "All platforms + highest limits"
                  : tier === "core"
                  ? "Reddit + Hacker News with weekly caps"
                  : "Reddit monitoring with basic limits"}
              </p>
              <div className="space-y-1">
                <p className="text-sm text-slate-600">
                  <strong>Account:</strong> {userEmail ?? "—"}
                </p>
              </div>
            </div>
            {tier !== "pro" && (
              <Button asChild className="gap-2">
                <Link href="/upgrade">
                  <Crown className="w-4 h-4" />
                  Upgrade Plan
                </Link>
              </Button>
            )}
          </div>
        </Card>

        {error ? (
          <Card className="p-4 mb-6 border-red-300 bg-red-50 text-red-700">{error}</Card>
        ) : null}

        <div className="grid md:grid-cols-2 gap-6">
          {plans.map((plan) => {
            const isPro = plan.id === "pro";
            return (
              <Card
                key={plan.id}
                className={`p-6 relative ${isPro ? "border-2 border-purple-300" : ""}`}
              >
                {isPro && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-purple-600 text-white gap-1">
                      <Crown className="w-3 h-3" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-4xl">{plan.priceLabel}</span>
                    <span className="text-slate-600">/{plan.period}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className={`w-full gap-2 ${isPro ? "bg-purple-600 hover:bg-purple-700" : ""}`}
                  disabled={loadingId === plan.id}
                  onClick={() => handleUpgrade(plan)}
                >
                  {isPro && <Zap className="w-4 h-4" />}
                  {loadingId === plan.id ? "Redirecting…" : `Choose ${plan.name}`}
                </Button>
              </Card>
            );
          })}
        </div>

        {/* Platform Access Summary */}
        <Card className="p-6 mt-8">
          <h2 className="text-xl mb-4">Your Platform Access</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div
              className={`p-4 rounded-lg border-2 ${
                tier === "free" || tier === "core" || tier === "pro"
                  ? "border-green-300 bg-green-50"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Reddit</h3>
                <Badge className="bg-green-600 text-white">Active</Badge>
              </div>
              <p className="text-sm text-slate-600">Available on all plans</p>
            </div>

            <div
              className={`p-4 rounded-lg border-2 ${
                tier === "core" || tier === "pro" ? "border-green-300 bg-green-50" : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Hacker News</h3>
                <Badge className={tier === "core" || tier === "pro" ? "bg-green-600 text-white" : "bg-slate-400 text-white"}>
                  {tier === "core" || tier === "pro" ? "Active" : "Locked"}
                </Badge>
              </div>
              <p className="text-sm text-slate-600">Available on Core & Pro</p>
            </div>

            <div
              className={`p-4 rounded-lg border-2 ${
                tier === "pro" ? "border-green-300 bg-green-50" : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Twitter / X</h3>
                <Badge className={tier === "pro" ? "bg-green-600 text-white" : "bg-slate-400 text-white"}>
                  {tier === "pro" ? "Active" : "Locked"}
                </Badge>
              </div>
              <p className="text-sm text-slate-600">Available on Pro only</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}


