"use client";

import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp } from 'lucide-react';
import { OpportunityCard, type Platform, type IntentLevel } from '@/components/OppurtunityCard';
import { useRouter } from 'next/navigation';

interface Opportunity {
  id: number;
  platform: Platform;
  intent: IntentLevel;
  excerpt: string;
  keyword: string;
  reason: string;
  timeAgo: string;
  engagement: {
    replies: number;
    likes: number;
  };
}

interface ResultsScreenProps {
  opportunities: Opportunity[];
  onContinueToDashboard: () => void;
}

export function ResultsScreen({ opportunities, onContinueToDashboard }: ResultsScreenProps) {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    // Animate results appearing one by one
    if (visibleCount < opportunities.length) {
      const timer = setTimeout(() => {
        setVisibleCount(prev => prev + 1);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [visibleCount, opportunities.length]);

  const highIntentCount = opportunities.filter(o => o.intent === 'high').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl">🦆</div>
            <span className="text-gray-900">TrafficDuck</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Results Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-8 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-6 h-6" />
                <h1 className="text-white">Scan Complete!</h1>
              </div>
              <p className="text-blue-100 mb-6">
                We found {opportunities.length} conversations where people are discussing your problem.
              </p>
              
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <div className="text-3xl mb-1">{opportunities.length}</div>
                  <div className="text-blue-100 text-sm">Total Opportunities</div>
                </div>
                <div>
                  <div className="text-3xl mb-1">{highIntentCount}</div>
                  <div className="text-blue-100 text-sm">High-Intent Leads</div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <div>
                    <div className="text-3xl mb-1">+37%</div>
                    <div className="text-blue-100 text-sm">vs. Last Scan</div>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={onContinueToDashboard}
              className="px-6 py-3 bg-white text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>

        {/* Quick Insight */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <div className="text-sm text-yellow-900 mb-1">Quick Insight</div>
              <div className="text-yellow-900">
                Most high-intent leads are on <span className="font-semibold">X</span> discussing <span className="font-semibold">"looking for a tool"</span>. 
                These are warm leads actively seeking solutions.
              </div>
            </div>
          </div>
        </div>

        {/* Results Feed */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-gray-900">Your Opportunities</h2>
            <div className="text-sm text-gray-600">
              Showing {visibleCount} of {opportunities.length}
            </div>
          </div>

          <div className="space-y-4">
            {opportunities.slice(0, visibleCount).map((opportunity, index) => (
              <div
                key={opportunity.id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <OpportunityCard
                  platform={opportunity.platform}
                  intent={opportunity.intent}
                  excerpt={opportunity.excerpt}
                  keyword={opportunity.keyword}
                  reason={opportunity.reason}
                  timeAgo={opportunity.timeAgo}
                  engagement={opportunity.engagement}
                  onViewOriginal={() => console.log('View original:', opportunity.id)}
                  onMarkAsSeen={() => console.log('Mark as seen:', opportunity.id)}
                />
              </div>
            ))}
          </div>

          {visibleCount < opportunities.length && (
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-2 text-gray-500">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                Loading more results...
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function Page() {
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('td_scan_results');
      if (raw) {
        const parsed = JSON.parse(raw) as Opportunity[];
        if (Array.isArray(parsed)) setOpportunities(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  return (
    <ResultsScreen
      opportunities={opportunities}
      onContinueToDashboard={() => router.push('/dashboard')}
    />
  );
}
