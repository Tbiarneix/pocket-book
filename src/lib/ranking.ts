import type { RankingRecord } from "./types";

/**
 * Finds the ranking tier that a given rating falls into
 * (e.g. rating 8 -> "Récits majeurs" for a 7-8 range).
 */
export function findRankingForRating(
  rankings: RankingRecord[],
  rating: number | null | undefined
): RankingRecord | null {
  if (rating === null || rating === undefined) return null;

  return (
    rankings.find(
      (ranking) => rating >= ranking.rating_min && rating <= ranking.rating_max
    ) ?? null
  );
}

/** Sorts rankings from lowest to highest rating range. */
export function sortRankingsByRating(
  rankings: RankingRecord[]
): RankingRecord[] {
  return [...rankings].sort((a, b) => a.rating_min - b.rating_min);
}

export interface RankingTier {
  ranking: RankingRecord;
  /** 0-based position among all tiers, lowest rating range first. */
  index: number;
  /** Total number of tiers, for rendering a "3 of 4" diamond count. */
  total: number;
}

/**
 * Resolves a rating to its tier plus its rank among all tiers, so the UI can
 * render a filled/empty diamond count (◆◆◆◇) alongside the tier name — the
 * rank is always paired with the exact numeric rating, never color alone.
 */
export function getRankingTier(
  rankings: RankingRecord[],
  rating: number | null | undefined
): RankingTier | null {
  if (rating === null || rating === undefined) return null;

  const sorted = sortRankingsByRating(rankings);
  const index = sorted.findIndex(
    (ranking) => rating >= ranking.rating_min && rating <= ranking.rating_max
  );
  if (index === -1) return null;

  return { ranking: sorted[index], index, total: sorted.length };
}
