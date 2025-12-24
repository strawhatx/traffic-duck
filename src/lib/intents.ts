import { generateIntentsFromAI } from "@/lib/ai";

// Local deterministic fallback generator (no external APIs)
function localGenerateIntents(nicheDescription: string): string[] {
  const base = (nicheDescription || "").toLowerCase();
  const words = Array.from(
    new Set(
      base
        .replace(/[^\w\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length >= 4),
    ),
  ).slice(0, 6);

  const seeds = words.length > 0 ? words : ["niche", "audience", "product"];
  const head = seeds.slice(0, 3).join(" ");

  const patterns = [
    `${head} recommendations`,
    `${head} tools`,
    `${head} looking for`,
    `${head} best`,
    `${head} struggling with`,
    `advice for ${head}`,
  ];

  return Array.from(new Set(patterns))
    .map((q) => q.trim())
    .slice(0, 6);
}

// Primary generator: tries AI chain, then falls back to local
export async function generateIntentsFromNiche(nicheDescription: string): Promise<string[]> {
  // Try AI first
  const ai = await generateIntentsFromAI(nicheDescription, 12);
  if (ai.length > 0) return ai.slice(0, 12);

  // Fallback to local
  return localGenerateIntents(nicheDescription);
}


