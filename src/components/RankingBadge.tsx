import type { RankingRecord } from "@/lib/types";
import { getRankingTier } from "@/lib/ranking";

const DIAMOND_COUNT = 5;

/**
 * Ranking badge: filled/empty diamonds visualize the /10 rating on a 5-mark
 * scale (2 points per diamond) — independent of how many ranking tiers
 * exist, so the glyph always reads the same way regardless of tier count.
 * The exact numeric rating is always shown alongside in digits, and in
 * "full" variant the tier name is spelled out too — no information is
 * carried by the accent-fill color alone.
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
      ? "min-h-[28px] gap-2 rounded-[9px] px-3 py-0.5 text-[15px]"
      : "min-h-[24px] gap-1.5 rounded-[8px] px-2.5 py-0.5 text-[13px]";

  if (!tier) {
    return (
      <span
        className={`inline-flex items-center border-2 border-dashed border-border-strong bg-background font-hand text-muted ${sizeClasses}`}
      >
        Non noté
      </span>
    );
  }

  const { ranking } = tier;
  const filled = Math.round((rating as number) / 2);
  const diamonds = "◆".repeat(filled) + "◇".repeat(DIAMOND_COUNT - filled);

  return (
    <span
      className={`inline-flex items-center border-[1.5px] border-accent bg-accent-soft font-hand font-semibold text-accent ${sizeClasses}`}
      title={`${ranking.name} — note ${rating}/10`}
    >
      <span aria-hidden="true" className="text-[0.75em] leading-none">
        {diamonds}
      </span>
      {variant === "full" ? `${ranking.name} · ${rating}/10` : `${rating}/10`}
    </span>
  );
}
