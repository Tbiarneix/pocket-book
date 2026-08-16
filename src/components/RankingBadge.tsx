import type { RankingRecord } from "@/lib/types";
import { getRankingTier } from "@/lib/ranking";

/**
 * Ranking badge: filled/empty diamonds carry the tier rank, but the exact
 * numeric rating is always shown alongside in digits, and in "full" variant
 * the tier name is spelled out too — no information is carried by the
 * accent-fill color alone.
 */
export function RankingBadge({
  rating,
  rankings,
  variant = "compact",
}: {
  rating: number | null | undefined;
  rankings: RankingRecord[];
  variant?: "compact" | "full";
}) {
  const tier = getRankingTier(rankings, rating);

  const sizeClasses =
    variant === "full"
      ? "min-h-[26px] gap-2 rounded-[8px] px-3 py-0.5 text-[12.5px]"
      : "min-h-[22px] gap-1.5 rounded-[7px] px-2 py-0.5 text-[11.5px]";

  if (!tier) {
    return (
      <span
        className={`inline-flex items-center border border-dashed border-border-field font-medium text-muted ${sizeClasses}`}
      >
        Non noté
      </span>
    );
  }

  const { ranking, index, total } = tier;
  const diamonds = "◆".repeat(index + 1) + "◇".repeat(Math.max(0, total - index - 1));

  return (
    <span
      className={`inline-flex items-center border-[1.5px] border-accent bg-accent-soft font-semibold text-accent ${sizeClasses}`}
      title={`${ranking.name} — note ${rating}/10`}
    >
      <span aria-hidden="true" className="text-[0.85em] leading-none">
        {diamonds}
      </span>
      {variant === "full" ? `${ranking.name} · ${rating}/10` : `${rating}/10`}
    </span>
  );
}
