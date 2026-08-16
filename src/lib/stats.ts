import type { ExpandedBookRecord } from "./types";

export interface MonthlyCount {
  key: string; // "2026-08", sortable
  label: string; // "août"
  count: number;
}

/**
 * Books finished per month for the last `monthCount` months (oldest first,
 * current month last). Buckets on `finished`, so any book with a finish
 * date counts — regardless of its current status.
 */
export function monthlyReadingPace(
  books: ExpandedBookRecord[],
  monthCount = 12,
  now: Date = new Date()
): MonthlyCount[] {
  const formatter = new Intl.DateTimeFormat("fr-FR", { month: "short" });
  const months: MonthlyCount[] = [];

  for (let i = monthCount - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: formatter.format(d),
      count: 0,
    });
  }

  const byKey = new Map(months.map((month) => [month.key, month]));

  for (const book of books) {
    if (!book.finished) continue;
    const finishedDate = new Date(book.finished);
    if (Number.isNaN(finishedDate.getTime())) continue;
    const key = `${finishedDate.getFullYear()}-${String(finishedDate.getMonth() + 1).padStart(2, "0")}`;
    const bucket = byKey.get(key);
    if (bucket) bucket.count += 1;
  }

  return months;
}
