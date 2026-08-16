export interface StatBarItem {
  label: string;
  count: number;
}

/**
 * A single-measure horizontal bar breakdown (e.g. books per genre).
 * One color for every bar — see the dataviz skill's anti-patterns: coloring
 * each bar of a single series is a value-ramp-on-nominal-categories mistake.
 * Every value is also rendered as real text, so the breakdown is legible
 * without color and works as its own "table view".
 */
export function StatBarList({
  title,
  items,
  emptyLabel,
}: {
  title: string;
  items: StatBarItem[];
  emptyLabel: string;
}) {
  const sorted = [...items].sort((a, b) => b.count - a.count);
  const max = sorted.reduce((acc, item) => Math.max(acc, item.count), 0);
  const total = sorted.reduce((acc, item) => acc + item.count, 0);

  return (
    <section className="rounded-[10px] border border-border bg-surface px-5 py-[18px]">
      <h2 className="font-serif text-[15px] font-semibold text-foreground">{title}</h2>

      {sorted.length === 0 ? (
        <p className="mt-2 text-sm text-muted">{emptyLabel}</p>
      ) : (
        <ul className="mt-3.5 flex flex-col gap-2.5">
          {sorted.map((item) => {
            const percent = max > 0 ? Math.round((item.count / max) * 100) : 0;
            const share = total > 0 ? Math.round((item.count / total) * 100) : 0;
            return (
              <li key={item.label} className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between gap-3 text-[13px]">
                  <span className="text-foreground">{item.label}</span>
                  <span className="shrink-0 text-muted">
                    {item.count} · {share}%
                  </span>
                </div>
                <div
                  className="h-2.5 w-full overflow-hidden rounded-full bg-surface-muted"
                  role="img"
                  aria-label={`${item.label} : ${item.count} livre${item.count > 1 ? "s" : ""}, ${share}% du total`}
                >
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
