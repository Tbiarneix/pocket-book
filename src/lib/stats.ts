import type { ExpandedBookRecord } from "./types";

export interface MonthlyCount {
  key: string; // "2026-08", sortable
  label: string; // "août"
  count: number;
}

/**
 * Books finished per month of a given calendar year (January through
 * December), so the chart can page between years once there's more than
 * one year of data. Buckets on `finished`, so any book with a finish date
 * counts — regardless of its current status.
 */
export function monthlyReadingPaceForYear(
  books: ExpandedBookRecord[],
  year: number
): MonthlyCount[] {
  const formatter = new Intl.DateTimeFormat("fr-FR", { month: "short" });
  const months: MonthlyCount[] = [];

  for (let month = 0; month < 12; month += 1) {
    const d = new Date(year, month, 1);
    months.push({
      key: `${year}-${String(month + 1).padStart(2, "0")}`,
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
