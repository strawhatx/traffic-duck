
const JOB_RE = /\b(job|hiring|role|position)\b/i;
const PROMO_RE =
  /\b(launch|promo|discount|coupon|sale|newsletter|subscribe|free trial)\b/i;
const PROMO2_RE = /\b(check (it|this) out|my product|my app)\b/i;
const SPAM_RE =
  /\b(crypto|forex|giveaway|airdrop|referral|whatsapp|telegram|investment)\b/i;
const HASH_SPAM_RE = /#{2,}/;

// Consider posts recent if within this many days (was 2 days; increased to avoid missing valid convos)
const RECENT_WINDOW_DAYS = 10;
const RECENT_WINDOW_MS = 1000 * 60 * 60 * 24 * RECENT_WINDOW_DAYS;

export function isRecentIso(iso?: string): boolean {
  if (!iso) return false;
  const dt = new Date(iso).getTime();
  if (Number.isNaN(dt)) return false;
  return Date.now() - dt <= RECENT_WINDOW_MS;
}

export function stripUrls(text: string): string {
  return text.replace(/https?:\/\/\S+/g, "").trim();
}

export function shouldDrop(text: string): boolean {
  const t = stripUrls(text);
  if (t.length < 10) return true; // links-only
  if (JOB_RE.test(t)) return true;
  if (PROMO_RE.test(t) || PROMO2_RE.test(t)) return true;
  if (SPAM_RE.test(t) || HASH_SPAM_RE.test(t)) return true;
  return false;
}


// Secondary bonuses for AI-first pipeline
export function recencyBonusFromEngagement(e: unknown): number {
  const engagementObj = e as Record<string, unknown> | undefined;
  const createdAt =
    typeof engagementObj?.created_at === "string" ? (engagementObj.created_at as string) : undefined;
  return isRecentIso(createdAt) ? 2 : 0;
}

export function engagementBonusFromEngagement(e: unknown): number {
  const engagementObj = e as Record<string, unknown> | undefined;
  const karma = Number(
    engagementObj?.upvotes ??
      engagementObj?.likes ??
      0,
  );
  return karma >= 50 ? 1 : 0;
}


