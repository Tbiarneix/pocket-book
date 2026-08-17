"use client";

import { useEffect, useId, useMemo, useState } from "react";
import Link from "next/link";
import { LayoutGrid, List, Plus, Search } from "lucide-react";
import { listBooks, listReferenceData } from "@/lib/data";
import type { ExpandedBookRecord, RankingRecord } from "@/lib/types";
import { BookCard } from "@/components/BookCard";
import { SKETCH_RADIUS } from "@/lib/sketch";

interface ReferenceData {
  rankings: RankingRecord[];
  statuses: { id: string; name: string }[];
  genres: { id: string; name: string }[];
  series: { id: string; name: string }[];
}

const fieldClasses =
  "min-h-10 rounded-[8px] border-2 border-border-field bg-background px-3 font-hand text-base text-foreground";

export default function LibraryPage() {
  const [books, setBooks] = useState<ExpandedBookRecord[] | null>(null);
  const [reference, setReference] = useState<ReferenceData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [seriesFilter, setSeriesFilter] = useState("");

  const searchId = useId();
  const statusId = useId();
  const genreId = useId();
  const seriesId = useId();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [bookList, refData] = await Promise.all([
          listBooks(),
          listReferenceData(),
        ]);
        if (cancelled) return;
        setBooks(bookList);
        setReference(refData);
      } catch {
        if (!cancelled) {
          setError("Impossible de charger ta bibliothèque pour le moment.");
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredBooks = useMemo(() => {
    if (!books) return [];
    const query = search.trim().toLowerCase();

    return books
      .filter((book) => {
        if (statusFilter && book.status !== statusFilter) return false;
        if (genreFilter && book.genre !== genreFilter) return false;
        if (seriesFilter && book.serie !== seriesFilter) return false;
        if (query) {
          const haystack = `${book.title} ${book.expand?.author?.name ?? ""}`.toLowerCase();
          if (!haystack.includes(query)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        // Group by série (alphabetically), tomes within a série in order;
        // standalone books are grouped under their own title instead.
        const groupA = a.expand?.serie?.name ?? a.title;
        const groupB = b.expand?.serie?.name ?? b.title;
        const groupCompare = groupA.localeCompare(groupB, "fr", { sensitivity: "base" });
        if (groupCompare !== 0) return groupCompare;
        if (a.tome !== b.tome) return (a.tome ?? 0) - (b.tome ?? 0);
        return a.title.localeCompare(b.title, "fr", { sensitivity: "base" });
      });
  }, [books, search, statusFilter, genreFilter, seriesFilter]);

  const hasActiveFilters =
    search || statusFilter || genreFilter || seriesFilter;

  function resetFilters() {
    setSearch("");
    setStatusFilter("");
    setGenreFilter("");
    setSeriesFilter("");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-hand text-[34px] text-foreground">Bibliothèque</h1>

        <div className="flex gap-2.5">
          <div
            role="group"
            aria-label="Mode d'affichage"
            className="flex overflow-hidden rounded-[8px] border-2 border-border-strong"
          >
            <button
              type="button"
              aria-pressed={viewMode === "grid"}
              onClick={() => setViewMode("grid")}
              className={`flex h-11 w-11 items-center justify-center ${
                viewMode === "grid" ? "bg-accent-soft text-accent" : "text-muted hover:bg-surface-muted"
              }`}
            >
              <LayoutGrid aria-hidden="true" width={17} height={17} strokeWidth={2} />
              <span className="sr-only">Vue grille</span>
            </button>
            <button
              type="button"
              aria-pressed={viewMode === "list"}
              onClick={() => setViewMode("list")}
              className={`flex h-11 w-11 items-center justify-center border-l-2 border-border-strong ${
                viewMode === "list" ? "bg-accent-soft text-accent" : "text-muted hover:bg-surface-muted"
              }`}
            >
              <List aria-hidden="true" width={17} height={17} strokeWidth={2} />
              <span className="sr-only">Vue liste</span>
            </button>
          </div>

          <Link
            href="/library/new"
            className={`inline-flex min-h-11 items-center gap-1.5 border-2 border-accent bg-accent px-4 font-hand text-[16px] font-semibold text-accent-foreground rotate-[-0.3deg] hover:opacity-90 ${SKETCH_RADIUS}`}
          >
            <Plus aria-hidden="true" width={15} height={15} strokeWidth={2} />
            Ajouter un livre
          </Link>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-[8px] bg-accent-soft px-3 py-2 text-sm text-accent">
          {error}
        </p>
      )}

      {reference && (
        <fieldset className="flex flex-wrap items-end gap-4 rounded-[14px] border-2 border-dashed border-border-field bg-surface p-4">
          <legend className="px-1 font-hand text-[17px] text-foreground">
            Filtrer la bibliothèque
          </legend>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={searchId} className="font-hand text-[14px] text-muted">
              Titre ou auteur·rice
            </label>
            <div className="flex w-56 items-center gap-1.5 rounded-[8px] border-2 border-border-strong bg-background px-2.5">
              <Search aria-hidden="true" width={14} height={14} strokeWidth={2} className="shrink-0 text-muted" />
              <input
                id={searchId}
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="min-h-10 w-full bg-transparent font-hand text-base text-foreground outline-none"
                placeholder="Rechercher…"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={statusId} className="font-hand text-[14px] text-muted">
              Statut
            </label>
            <select
              id={statusId}
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className={fieldClasses}
            >
              <option value="">Tous</option>
              {reference.statuses.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={genreId} className="font-hand text-[14px] text-muted">
              Genre
            </label>
            <select
              id={genreId}
              value={genreFilter}
              onChange={(event) => setGenreFilter(event.target.value)}
              className={fieldClasses}
            >
              <option value="">Tous</option>
              {reference.genres.map((genre) => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={seriesId} className="font-hand text-[14px] text-muted">
              Série
            </label>
            <select
              id={seriesId}
              value={seriesFilter}
              onChange={(event) => setSeriesFilter(event.target.value)}
              className={fieldClasses}
            >
              <option value="">Toutes</option>
              {reference.series.map((serie) => (
                <option key={serie.id} value={serie.id}>
                  {serie.name}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={resetFilters}
              className={`min-h-10 border-2 border-border-strong bg-background px-3 font-hand text-[15px] font-semibold text-foreground hover:bg-surface-muted ${SKETCH_RADIUS}`}
            >
              Réinitialiser
            </button>
          ) : null}
        </fieldset>
      )}

      <div aria-live="polite">
        {books === null ? (
          <p role="status" className="text-muted">
            Chargement de ta bibliothèque…
          </p>
        ) : filteredBooks.length === 0 ? (
          <p className="rounded-[14px] border-2 border-dashed border-border-field bg-surface p-8 text-center font-hand text-[17px] text-muted">
            {books.length === 0
              ? "Aucun livre pour le moment. Ajoute ton premier livre !"
              : "Aucun livre ne correspond à ces filtres."}
          </p>
        ) : (
          <>
            <p className="font-hand text-[15px] text-muted">
              {filteredBooks.length} livre{filteredBooks.length > 1 ? "s" : ""}
            </p>
            <ul
              className={`mt-2 grid grid-cols-1 gap-4 ${viewMode === "grid" ? "sm:grid-cols-2" : ""}`}
            >
              {filteredBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  rankings={reference?.rankings ?? []}
                />
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
