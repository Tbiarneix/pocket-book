"use client";

import { use, useEffect, useId, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { getUser, listBooks, listReferenceData } from "@/lib/data";
import { sortBooksForDisplay } from "@/lib/bookSort";
import type { ExpandedBookRecord, RankingRecord, UserRecord } from "@/lib/types";
import { BookCard } from "@/components/BookCard";
import { SKETCH_RADIUS, SKETCH_UNDERLINE } from "@/lib/sketch";

interface ReferenceData {
  rankings: RankingRecord[];
  genres: { id: string; name: string }[];
  series: { id: string; name: string }[];
}

const fieldClasses =
  "min-h-10 rounded-[8px] border-2 border-border-field bg-background px-3 font-hand text-base text-foreground";

export default function CommunityUserLibraryPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = use(params);
  const [member, setMember] = useState<UserRecord | null>(null);
  const [books, setBooks] = useState<ExpandedBookRecord[] | null>(null);
  const [reference, setReference] = useState<ReferenceData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [seriesFilter, setSeriesFilter] = useState("");

  const searchId = useId();
  const genreId = useId();
  const seriesId = useId();

  useEffect(() => {
    let cancelled = false;
    Promise.all([getUser(userId), listBooks(userId), listReferenceData()])
      .then(([memberData, bookList, refData]) => {
        if (cancelled) return;
        setMember(memberData);
        setBooks(bookList);
        setReference(refData);
      })
      .catch(() => {
        if (!cancelled) setError("Impossible de charger cette bibliothèque.");
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const filteredBooks = useMemo(() => {
    if (!books) return [];
    const query = search.trim().toLowerCase();

    const filtered = books.filter((book) => {
      if (genreFilter && book.genre !== genreFilter) return false;
      if (seriesFilter && book.serie !== seriesFilter) return false;
      if (query) {
        const haystack = `${book.title} ${book.expand?.author?.name ?? ""}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
    return sortBooksForDisplay(filtered);
  }, [books, search, genreFilter, seriesFilter]);

  const hasActiveFilters = search || genreFilter || seriesFilter;

  function resetFilters() {
    setSearch("");
    setGenreFilter("");
    setSeriesFilter("");
  }

  if (error) {
    return (
      <p role="alert" className="rounded-[8px] bg-accent-soft px-3 py-2 text-sm text-accent">
        {error}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/community"
        className={`inline-flex items-center gap-1.5 font-hand text-[17px] text-accent ${SKETCH_UNDERLINE}`}
      >
        <ArrowLeft aria-hidden="true" width={14} height={14} strokeWidth={2} />
        Retour à la communauté
      </Link>

      <h1 className="font-hand text-[34px] text-foreground">
        Bibliothèque de {member?.name || member?.email || "…"}
      </h1>

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

      {books === null ? (
        <p role="status" className="text-muted">
          Chargement…
        </p>
      ) : filteredBooks.length === 0 ? (
        <p className="rounded-[14px] border-2 border-dashed border-border-field bg-surface p-8 text-center font-hand text-[17px] text-muted">
          {books.length === 0
            ? "Aucun livre pour le moment."
            : "Aucun livre ne correspond à ces filtres."}
        </p>
      ) : (
        <>
          <p className="font-hand text-[15px] text-muted">
            {filteredBooks.length} livre{filteredBooks.length > 1 ? "s" : ""}
          </p>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                rankings={reference?.rankings ?? []}
                href={`/community/${userId}/books/${book.id}`}
              />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
