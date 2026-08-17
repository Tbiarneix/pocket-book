"use client";

import { useEffect, useMemo, useState } from "react";
import { listBooks, listRankings } from "@/lib/data";
import { findRankingForRating, sortRankingsByRating } from "@/lib/ranking";
import { monthlyReadingPaceForYear } from "@/lib/stats";
import type { ExpandedBookRecord, RankingRecord } from "@/lib/types";
import { StatBarList } from "@/components/StatBarList";
import { StatTile } from "@/components/StatTile";
import { ReadingPaceChart } from "@/components/ReadingPaceChart";

export default function StatsPage() {
  const [books, setBooks] = useState<ExpandedBookRecord[] | null>(null);
  const [rankings, setRankings] = useState<RankingRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [paceYear, setPaceYear] = useState(() => new Date().getFullYear());

  useEffect(() => {
    let cancelled = false;
    Promise.all([listBooks(), listRankings()])
      .then(([bookList, rankingList]) => {
        if (cancelled) return;
        setBooks(bookList);
        setRankings(sortRankingsByRating(rankingList));
      })
      .catch(() => {
        if (!cancelled) setError("Impossible de charger les statistiques.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    if (!books) return null;

    const ratedBooks = books.filter(
      (book) => book.rating !== null && book.rating !== undefined
    );
    const averageRating =
      ratedBooks.length > 0
        ? ratedBooks.reduce((acc, book) => acc + book.rating, 0) / ratedBooks.length
        : null;

    const byGenre = countBy(books, (book) => book.expand?.genre?.name);
    const byStatus = countBy(books, (book) => book.expand?.status?.name);
    const byRanking = countBy(books, (book) => {
      const ranking = findRankingForRating(rankings, book.rating);
      return ranking?.name;
    });
    const readingPace = monthlyReadingPaceForYear(books, paceYear);

    return { averageRating, byGenre, byStatus, byRanking, readingPace };
  }, [books, rankings, paceYear]);

  if (error) {
    return (
      <p role="alert" className="rounded-[8px] bg-accent-soft px-3 py-2 text-sm text-accent">
        {error}
      </p>
    );
  }

  if (!books || !stats) {
    return (
      <p role="status" className="text-muted">
        Chargement des statistiques…
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-hand text-[34px] text-foreground">Statistiques</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Livres au total" value={String(books.length)} />
        <StatTile
          label="Note moyenne"
          value={stats.averageRating !== null ? `${stats.averageRating.toFixed(1)}/10` : "—"}
        />
        <StatTile
          label="Livres notés"
          value={String(books.filter((b) => b.rating !== null && b.rating !== undefined).length)}
        />
      </div>

      <ReadingPaceChart
        year={paceYear}
        months={stats.readingPace}
        onPrevYear={() => setPaceYear((y) => y - 1)}
        onNextYear={() => setPaceYear((y) => y + 1)}
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <StatBarList
          title="Par classement"
          items={stats.byRanking}
          emptyLabel="Aucun livre noté pour l'instant."
        />
        <StatBarList
          title="Par statut"
          items={stats.byStatus}
          emptyLabel="Aucune donnée pour l'instant."
        />
        <StatBarList
          title="Par genre"
          items={stats.byGenre}
          emptyLabel="Aucune donnée pour l'instant."
        />
      </div>
    </div>
  );
}

function countBy<T>(
  items: T[],
  getKey: (item: T) => string | undefined
): { label: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = getKey(item);
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([label, count]) => ({ label, count }));
}
