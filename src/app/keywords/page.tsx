"use client";

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useKeywords } from '@/hooks/use-keywords';
import { PlatformKeywordsCard } from '@/components/keywords/PlatformKeywordsCard';
import { Button } from '@/components/ui/button';

export function Keywords() {
  const router = useRouter();
  const {
    loading,
    saving,
    tier,
    totalKeywords,
    platformKeywords,
    allowed,
    addKeyword,
    removeKeyword,
    updateKeyword,
    togglePlatform,
    saveAll,
  } = useKeywords();

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {loading ? (
        <div className="text-gray-600">Loading keywords…</div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="mb-8 w-1/2">
              <h2 className="text-gray-900 mb-2">Configure Keywords by Platform</h2>
              <p className="text-gray-600">
                Set different keywords for each platform. Use problem phrases your users would say, not product names.
              </p>
            </div>

            <div className="mb-4 flex items-center gap-2">
              <Button
                onClick={async () => {
                  try {
                    const ok = await saveAll();
                    if (ok) {
                      toast.success('Keywords saved.');
                    }
                  } catch (e: any) {
                    toast.error(e?.message ?? 'Failed to save keywords.');
                  }
                }}
                disabled={saving}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:bg-gray-200 disabled:text-gray-400"
              >
                Save
              </Button>
              <Button
                onClick={async () => {
                  try {
                    const ok = await saveAll();
                    if (ok) {
                       toast.success('Keywords saved. Opening scanner…');
                       router.push('/scanning');
                    }
                  } catch (e: any) {
                    toast.error(e?.message ?? 'Failed to save keywords.');
                  }
                }}
                disabled={totalKeywords === 0 || saving}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
              >
                Save & Scan
              </Button>
            </div>
          </div>


          <div className="space-y-6">
            {platformKeywords.map((platformData, platformIndex) => {
              const disabled = !allowed[platformData.platform];
              const note =
                platformData.platform === 'X'
                  ? (tier === 'builder' ? undefined : 'Available on Builder')
                  : platformData.platform === 'Hacker News'
                    ? (tier !== 'free' ? undefined : 'Available on Early')
                    : undefined;
              return (
                <PlatformKeywordsCard
                  key={platformData.platform}
                  data={platformData}
                  index={platformIndex}
                  onToggle={togglePlatform}
                  onAdd={addKeyword}
                  onRemove={removeKeyword}
                  onUpdate={updateKeyword}
                  disabled={disabled}
                  note={note}
                />
              );
            })}
          </div>

          <div className="mt-8 flex items-center justify-start">
            <div className="text-sm text-gray-600">
              Total: {totalKeywords} keyword{totalKeywords !== 1 ? 's' : ''} across{' '}
              {platformKeywords.filter(p => p.enabled).length} platform{platformKeywords.filter(p => p.enabled).length !== 1 ? 's' : ''}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function KeywordsPage() {
  return (
    <Keywords />
  );
}