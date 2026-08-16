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
    <section className="rounded-[10px] border border-border bg-surface px-5 py-[18px]">
      <h2 className="font-serif text-[15px] font-semibold text-foreground">
        Rythme de lecture
      </h2>
      <p className="mt-1 text-[12.5px] text-muted">
        Livres terminés par mois, 12 derniers mois
      </p>

      <div
        role="img"
        aria-label={`Livres terminés par mois : ${summary}`}
        className="mt-3.5 flex h-[110px] items-end gap-2"
      >
        {months.map((month) => (
          <div
            key={month.key}
            aria-hidden="true"
            className="flex flex-1 flex-col items-center gap-1"
          >
            <span className="font-mono text-[11px] font-medium text-muted">
              {month.count}
            </span>
            <div
              className="w-full rounded-t-[3px] bg-accent"
              style={{ height: month.count === 0 ? 2 : `${(month.count / max) * 96}px` }}
            />
            <span className="text-[10.5px] text-muted">{month.label}</span>
          </div>
        ))}
      </div>

      <p className="mt-2.5 text-xs text-muted">
        Chaque valeur est affichée en chiffres au-dessus de sa barre — le graphique reste
        lisible sans distinction de couleur.
      </p>
    </section>
  );
}
