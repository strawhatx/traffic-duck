"use client";

import { useMemo, useState } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { OpportunityCard, type Platform, type IntentLevel } from "@/components/OppurtunityCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import Link from "next/link";

export default function Dashboard() {
  const [selectedPlatform, setSelectedPlatform] = useState<string>("All Platforms");
  const [selectedIntent, setSelectedIntent] = useState<string>("All Levels");
  const [view, setView] = useState<"dashboard" | "setup">("dashboard");
  const { loading, error, opportunities } = useDashboardData();

  // Data and counts provided by useDashboardData()
  const filteredOpportunities = opportunities.filter((opp) => {
    const platformMatch = selectedPlatform === "All Platforms" || opp.platform === (selectedPlatform as Platform);
    const intentMatch = selectedIntent === "All Levels" || opp.intent === (selectedIntent.toLowerCase() as IntentLevel);
    return platformMatch && intentMatch;
  });

  const stats = useMemo(() => {
    const total = opportunities.length;
    const high = opportunities.filter((o) => o.intent === "high").length;
    const byPlatform: Record<string, number> = {};
    for (const o of opportunities) byPlatform[o.platform] = (byPlatform[o.platform] ?? 0) + 1;
    const bestPlatform = Object.entries(byPlatform).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
    const strongest = opportunities.find((o) => o.intent === "high")?.reason ?? opportunities[0]?.reason ?? "—";
    return { total, high, bestPlatform, strongest: strongest.slice(0, 30) };
  }, [opportunities]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="max-w-7xl  mx-auto px-6 py-6 flex items-center justify-end gap-3">
        <Link href="/keywords" 
          className="text-sm bg-black text-white px-4 py-3 rounded-md"
        >
          Manage Keywords
        </Link>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-0">
        {/* Decision Header */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h1 className="text-gray-900 mb-2">Today's Demand Radar</h1>
          <p className="text-gray-600 mb-6">Live conversations where people are actively discussing your problem.</p>

          <div className="grid grid-cols-4 gap-4">
            <StatCard label="Total Opportunities Today" value={stats.total} />
            <StatCard label="High-Intent Leads" value={stats.high} variant="highlight" />
            <StatCard label="Best Platform Today" value={stats.bestPlatform} />
            <StatCard label="Strongest Signal" value={stats.strongest} />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <FilterBar
            selectedPlatform={selectedPlatform}
            selectedIntent={selectedIntent}
            onPlatformChange={setSelectedPlatform}
            onIntentChange={setSelectedIntent}
          />
        </div>

        {/* Opportunity Feed */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-gray-600">Loading…</div>
          ) : error ? (
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-red-600">{error}</div>
          ) : filteredOpportunities.length > 0 ? (
            filteredOpportunities.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                platform={opportunity.platform}
                intent={opportunity.intent}
                excerpt={opportunity.excerpt}
                keyword={opportunity.keyword}
                reason={opportunity.reason}
                timeAgo={opportunity.timeAgo}
                engagement={opportunity.engagement}
                onViewOriginal={() => console.log("View original:", opportunity.id)}
                onMarkAsSeen={() => console.log("Mark as seen:", opportunity.id)}
              />
            ))
          ) : (
            <EmptyState />
          )}
        </div>
      </main>
    </div>
  );
}