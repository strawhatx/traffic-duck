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
  const [manageLoading, setManageLoading] = useState(false);
  const router = useRouter();
  const [tier, setTier] = useState<SubscriptionTier>("free");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);

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
        if (mounted) {
          setTier(resolveTierFromProfile(profile ?? undefined));
          setSubscriptionStatus(profile?.subscription_status ?? null);
        }
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

  const handleManageSubscription = async () => {
    try {
      setError(null);
      setManageLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) {
        setError("You must be signed in");
        setManageLoading(false);
        return;
      }
      const res = await fetch("/api/stripe/create-portal-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const payload = await res.json();
      if (!res.ok || !payload?.url) {
        setError(payload?.error ?? "Failed to open billing portal");
        setManageLoading(false);
        return;
      }
      window.location.href = payload.url as string;
    } catch (e: any) {
      setError(e?.message ?? "Error opening billing portal");
      setManageLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl mb-2">
              {tier === "free" ? "Upgrade" : subscriptionStatus === "canceled" ? "Renew Your Plan" : "Manage Subscription"}
            </h1>
            <p className="text-slate-600">
              {tier === "free" 
                ? "Choose a plan that fits your needs." 
                : subscriptionStatus === "canceled"
                ? "Your subscription has been canceled. Reactivate it here."
                : "View and manage your current subscription."}
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/keywords">Back to Keywords</Link>
          </Button>
        </div>

        {/* Current Plan */}
        <Card className={`p-6 mb-8 border-2 ${subscriptionStatus === "canceled" ? "border-yellow-200 bg-yellow-50" : "border-blue-200 bg-blue-50"}`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl">Current Plan</h2>
                <Badge
                  className={
                    subscriptionStatus === "canceled"
                      ? "bg-yellow-600 text-white"
                      : tier === "builder"
                      ? "bg-purple-600 text-white"
                      : tier === "early"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-600 text-white"
                  }
                >
                  {subscriptionStatus === "canceled" ? "CANCELED" : tier.toUpperCase()}
                </Badge>
              </div>
              <p className="text-slate-700 mb-4">
                {subscriptionStatus === "canceled"
                  ? "Your subscription has expired. Renew to continue using premium features."
                  : tier === "builder"
                  ? "All platforms + highest limits"
                  : tier === "early"
                  ? "Reddit + Hacker News with weekly caps"
                  : "Reddit monitoring with basic limits"}
              </p>
              <div className="space-y-1">
                <p className="text-sm text-slate-600">
                  <strong>Account:</strong> {userEmail ?? "—"}
                </p>
                {subscriptionStatus && subscriptionStatus !== "canceled" && (
                  <p className="text-sm text-slate-600">
                    <strong>Status:</strong> {subscriptionStatus.charAt(0).toUpperCase() + subscriptionStatus.slice(1)}
                  </p>
                )}
              </div>
            </div>
            {(tier !== "free" || subscriptionStatus === "canceled") && (
              <Button 
                onClick={handleManageSubscription} 
                disabled={manageLoading}
                className="gap-2"
              >
                {manageLoading ? "Loading…" : subscriptionStatus === "canceled" ? "Renew Plan" : "Manage Subscription"}
              </Button>
            )}
          </div>
        </Card>

        {error ? (
          <Card className="p-4 mb-6 border-red-300 bg-red-50 text-red-700">{error}</Card>
        ) : null}

        {(tier === "free" || subscriptionStatus === "canceled") && (
          <>
            <h2 className="text-2xl mb-6">Available Plans</h2>
            <div className="grid md:grid-cols-2 gap-6">
          {plans.map((plan) => {
            const isBuilder = plan.id === "builder";
            return (
              <Card
                key={plan.id}
                className={`p-6 relative ${isBuilder ? "border-2 border-purple-300" : ""}`}
              >
                {isBuilder && (
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
                  className={`w-full gap-2 ${isBuilder ? "bg-purple-600 hover:bg-purple-700" : ""}`}
                  disabled={loadingId === plan.id}
                  onClick={() => handleUpgrade(plan)}
                >
                  {isBuilder && <Zap className="w-4 h-4" />}
                  {loadingId === plan.id ? "Redirecting…" : `Choose ${plan.name}`}
                </Button>
              </Card>
            );
          })}
            </div>
          </>
        )}

        {/* Platform Access Summary */}
        <Card className="p-6 mt-8">
          <h2 className="text-xl mb-4">Your Platform Access</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div
              className={`p-4 rounded-lg border-2 ${
                tier === "free" || tier === "early" || tier === "builder"
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
                tier === "early" || tier === "builder" ? "border-green-300 bg-green-50" : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Hacker News</h3>
                <Badge className={tier === "early" || tier === "builder" ? "bg-green-600 text-white" : "bg-slate-400 text-white"}>
                  {tier === "early" || tier === "builder" ? "Active" : "Locked"}
                </Badge>
              </div>
              <p className="text-sm text-slate-600">Available on Early & Builder</p>
            </div>

            <div
              className={`p-4 rounded-lg border-2 ${
                tier === "builder" ? "border-green-300 bg-green-50" : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Twitter / X</h3>
                <Badge className={tier === "builder" ? "bg-green-600 text-white" : "bg-slate-400 text-white"}>
                  {tier === "builder" ? "Active" : "Locked"}
                </Badge>
              </div>
              <p className="text-sm text-slate-600">Available on Builder only</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}


