import { Plus, X } from "lucide-react";

export type UiPlatform = "X" | "Reddit" | "Hacker News";

export type PlatformKeywords = {
  platform: UiPlatform;
  keywords: string[];
  enabled: boolean;
};

interface PlatformKeywordsCardProps {
  data: PlatformKeywords;
  index: number;
  onToggle(index: number): void;
  onAdd(index: number): void;
  onRemove(index: number, keywordIndex: number): void;
  onUpdate(index: number, keywordIndex: number, value: string): void;
  disabled?: boolean;
  note?: string;
}

const platformConfig: Record<UiPlatform, { symbol: string; color: string }> = {
  X: { symbol: "𝕏", color: "bg-black" },
  Reddit: { symbol: "R", color: "bg-orange-500" },
  "Hacker News": { symbol: "Y", color: "bg-orange-600" },
};

export function PlatformKeywordsCard({
  data,
  index,
  onToggle,
  onAdd,
  onRemove,
  onUpdate,
  disabled = false,
  note,
}: PlatformKeywordsCardProps) {
  const config = platformConfig[data.platform];
  return (
    <div
      className={`border rounded-lg overflow-hidden transition-all ${
        data.enabled ? "border-gray-300" : "border-gray-200 opacity-60"
      }`}
    >
      <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded ${config.color} text-white flex items-center justify-center`}>
            {config.symbol}
          </div>
          <div>
            <div className="text-gray-900">{data.platform}</div>
            <div className="text-sm text-gray-500">
              {data.keywords.length} keyword{data.keywords.length !== 1 ? "s" : ""}
            </div>
            {note ? <div className="text-xs text-gray-500 mt-1">{note}</div> : null}
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-sm text-gray-600">Scan this platform</span>
          <input
            type="checkbox"
            checked={data.enabled}
            onChange={() => onToggle(index)}
            disabled={disabled}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </label>
      </div>

      {data.enabled && (
        <div className="p-6 space-y-3 bg-white">
          {data.keywords.map((keyword, keywordIndex) => (
            <div key={keywordIndex} className="flex gap-2">
              <input
                type="text"
                value={keyword}
                onChange={(e) => onUpdate(index, keywordIndex, e.target.value)}
                disabled={disabled}
                placeholder={`Keyword ${keywordIndex + 1} for ${data.platform}`}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              {data.keywords.length > 1 && (
                <button
                  onClick={() => onRemove(index, keywordIndex)}
                  disabled={disabled}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  aria-label="Remove keyword"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}

          <button
            onClick={() => onAdd(index)}
            disabled={disabled}
            className="w-full px-4 py-2 bg-gray-50 border border-dashed border-gray-300 text-gray-600 rounded-md hover:bg-gray-100 hover:border-gray-400 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Keyword
          </button>
        </div>
      )}
    </div>
  );
}


