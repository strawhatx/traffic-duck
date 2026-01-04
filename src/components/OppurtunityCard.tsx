import { ExternalLink, Check } from 'lucide-react';

export type IntentLevel = 'high' | 'medium' | 'low';
export type Platform = 'X' | 'Reddit' | 'Hacker News';

interface OpportunityCardProps {
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
  onViewOriginal: () => void;
  onMarkAsSeen: () => void;
}

export function OpportunityCard({
  platform,
  intent,
  excerpt,
  keyword,
  reason,
  timeAgo,
  engagement,
  onViewOriginal,
  onMarkAsSeen,
}: OpportunityCardProps) {
  const intentConfig = {
    high: { emoji: '🔥', label: 'High Intent', color: 'bg-red-50 text-red-700 border-red-200' },
    medium: { emoji: '🟡', label: 'Medium Intent', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    low: { emoji: '⚪', label: 'Low Intent', color: 'bg-gray-50 text-gray-700 border-gray-200' },
  };

  const platformConfig = {
    'X': { symbol: '𝕏', color: 'bg-black text-white' },
    'Reddit': { symbol: 'R', color: 'bg-orange-500 text-white' },
    'Hacker News': { symbol: 'Y', color: 'bg-orange-600 text-white' },
  };

  const config = intentConfig[intent];
  const platformStyle = platformConfig[platform];

  // Highlight keyword in excerpt (guard for empty keyword)
  const safeKeyword = (keyword ?? "").trim();
  const highlightedExcerpt =
    safeKeyword.length > 0
      ? excerpt.replace(
          new RegExp(`(${safeKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"),
          '<mark class="bg-yellow-200 px-1 rounded">$1</mark>'
        )
      : excerpt;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded ${platformStyle.color} flex items-center justify-center text-sm`}>
            {platformStyle.symbol}
          </div>
          <span className={`px-2 py-1 rounded-md border text-sm ${config.color}`}>
            {config.emoji} {config.label}
          </span>
        </div>
      </div>

      {safeKeyword.length > 0 ? (
        <div
          className="text-gray-700 mb-3 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: highlightedExcerpt }}
        />
      ) : (
        <div className="text-gray-700 mb-3 leading-relaxed">{excerpt}</div>
      )}

      <div className="flex items-start justify-between text-sm text-gray-500 mb-4">
        <div className="flex-1">
          <div className="mb-1">
            <span className="text-gray-600">Why it matters:</span> {reason}
          </div>
          <div className="flex items-center gap-4">
            <span>{timeAgo}</span>
            <span>•</span>
            <span>{engagement.replies} replies</span>
            <span>•</span>
            <span>{engagement.likes} likes</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onViewOriginal}
          className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors flex items-center gap-2 text-sm"
        >
          View Original
          <ExternalLink className="w-4 h-4" />
        </button>
        <button
          onClick={onMarkAsSeen}
          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
        >
          <Check className="w-4 h-4" />
          Mark as Seen
        </button>
      </div>
    </div>
  );
}
