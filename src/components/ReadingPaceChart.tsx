import { ChevronLeft, ChevronRight } from "lucide-react";
import type { MonthlyCount } from "@/lib/stats";
import { SKETCH_RADIUS } from "@/lib/sketch";

/**
 * Monthly reading-pace bars for one calendar year — single accent color
 * (nominal-by-month series, not a value ramp), with each count printed as
 * a real number above its bar so the chart stays legible without relying
 * on bar height or color. Year navigation is unrestricted (no bounds
 * against real data) so it's ready as soon as there's more than one year
 * of finished books to page through.
 */
export function ReadingPaceChart({
  year,
  months,
  onPrevYear,
  onNextYear,
}: {
  year: number;
  months: MonthlyCount[];
  onPrevYear: () => void;
  onNextYear: () => void;
}) {
  const max = Math.max(1, ...months.map((month) => month.count));
  const summary = months.map((m) => `${m.label} : ${m.count}`).join(", ");
  const trackHeight = 96;

  return (
    <section className="rounded-[14px] border-2 border-dashed border-border-field bg-surface px-5 py-[18px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-hand text-[22px] text-foreground">Rythme de lecture</h2>
          <p className="mt-1 font-hand text-[14px] text-muted">Livres terminés par mois</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrevYear}
            aria-label="Année précédente"
            className={`flex min-h-9 min-w-9 items-center justify-center border-2 border-border-strong bg-background text-foreground hover:bg-surface-muted ${SKETCH_RADIUS}`}
          >
            <ChevronLeft aria-hidden="true" width={16} height={16} strokeWidth={2} />
          </button>
          <span className="min-w-[3.5ch] text-center font-mono text-[15px] text-foreground">
            {year}
          </span>
          <button
            type="button"
            onClick={onNextYear}
            aria-label="Année suivante"
            className={`flex min-h-9 min-w-9 items-center justify-center border-2 border-border-strong bg-background text-foreground hover:bg-surface-muted ${SKETCH_RADIUS}`}
          >
            <ChevronRight aria-hidden="true" width={16} height={16} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* 12 bars don't fit a phone screen without either scrolling or
          becoming illegibly thin — fixed-width bars + horizontal scroll on
          mobile, stretched to fill the row again from sm: up. Each column's
          number/label sit outside the fixed-height bar track, so they're
          never at risk of being clipped by that track's own height. */}
      <div className="mt-4 overflow-x-auto">
        <div
          role="img"
          aria-label={`Livres terminés par mois en ${year} : ${summary}`}
          className="flex min-w-max items-start gap-2 sm:min-w-0"
        >
          {months.map((month) => (
            <div
              key={month.key}
              aria-hidden="true"
              className="flex w-10 flex-none flex-col items-center gap-1 sm:w-auto sm:flex-1"
            >
              <span className="font-mono text-[11px] font-medium text-muted">
                {month.count}
              </span>
              <div className="flex w-full items-end" style={{ height: trackHeight }}>
                <div
                  className="w-full rounded-t-[3px] bg-accent"
                  style={{
                    height: month.count === 0 ? 2 : (month.count / max) * trackHeight,
                  }}
                />
              </div>
              <span className="font-mono text-[10.5px] text-muted">{month.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
