import type { MonthlyCount } from "@/lib/stats";

/**
 * Monthly reading-pace bars — single accent color (nominal-by-month series,
 * not a value ramp), with each count printed as a real number above its
 * bar so the chart stays legible without relying on bar height or color.
 */
export function ReadingPaceChart({ months }: { months: MonthlyCount[] }) {
  const max = Math.max(1, ...months.map((month) => month.count));
  const summary = months.map((m) => `${m.label} : ${m.count}`).join(", ");

  return (
    <section className="rounded-[14px] border-2 border-dashed border-border-field bg-surface px-5 py-[18px]">
      <h2 className="font-hand text-[22px] text-foreground">
        Rythme de lecture
      </h2>
      <p className="mt-1 font-hand text-[14px] text-muted">
        Livres terminés par mois, 12 derniers mois
      </p>

      {/* 12 bars don't fit a phone screen without either scrolling or
          becoming illegibly thin — fixed-width bars + horizontal scroll on
          mobile, stretched to fill the row again from sm: up. */}
      <div className="mt-3.5 overflow-x-auto">
        <div
          role="img"
          aria-label={`Livres terminés par mois : ${summary}`}
          className="flex h-[110px] min-w-max items-end gap-2 sm:min-w-0"
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
              <div
                className="w-full rounded-t-[3px] bg-accent"
                style={{ height: month.count === 0 ? 2 : `${(month.count / max) * 96}px` }}
              />
              <span className="font-mono text-[10.5px] text-muted">{month.label}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-2.5 font-hand text-[13px] text-muted">
        Chaque valeur est affichée en chiffres au-dessus de sa barre — le graphique reste
        lisible sans distinction de couleur.
      </p>
    </section>
  );
}
