"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Copy, TriangleAlert } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { duplicateBook, findDuplicateBook, getBook, getUser, listRankings } from "@/lib/data";
import type { BookRecord, ExpandedBookRecord, RankingRecord, UserRecord } from "@/lib/types";
import { RankingBadge } from "@/components/RankingBadge";
import { BookCover } from "@/components/BookCover";
import { MarkdownContent } from "@/components/MarkdownContent";
import { SKETCH_RADIUS, SKETCH_UNDERLINE } from "@/lib/sketch";

export default function CommunityBookPage({
  params,
}: {
  params: Promise<{ userId: string; bookId: string }>;
}) {
  const { userId, bookId } = use(params);
  const { user } = useAuth();
  const router = useRouter();

  const [book, setBook] = useState<ExpandedBookRecord | null>(null);
  const [member, setMember] = useState<UserRecord | null>(null);
  const [rankings, setRankings] = useState<RankingRecord[]>([]);
  const [duplicate, setDuplicate] = useState<BookRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDuplicating, setIsDuplicating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getBook(bookId), getUser(userId), listRankings()])
      .then(([bookData, memberData, rankingList]) => {
        if (cancelled) return;
        setBook(bookData);
        setMember(memberData);
        setRankings(rankingList);
      })
      .catch(() => {
        if (!cancelled) setError("Impossible de charger ce livre.");
      });
    return () => {
      cancelled = true;
    };
  }, [bookId, userId]);

  useEffect(() => {
    if (!book || !user) return;
    let cancelled = false;
    findDuplicateBook(user.id, book).then((existing) => {
      if (!cancelled) setDuplicate(existing);
    });
    return () => {
      cancelled = true;
    };
  }, [book, user]);

  async function handleDuplicate() {
    if (!user) return;
    setIsDuplicating(true);
    try {
      const copy = await duplicateBook(bookId, user.id);
      router.push(`/library/${copy.id}`);
    } catch {
      setError("La duplication a échoué. Réessaie.");
      setIsDuplicating(false);
    }
  }

  if (error && !book) {
    return (
      <p role="alert" className="rounded-[8px] bg-accent-soft px-3 py-2 text-sm text-accent">
        {error}
      </p>
    );
  }

  if (!book) {
    return (
      <p role="status" className="text-muted">
        Chargement…
      </p>
    );
  }

  const author = book.expand?.author?.name;
  const serie = book.expand?.serie?.name;
  const serieSubtitle = serie ? (book.tome ? `${serie} · Tome ${book.tome}` : serie) : null;
  const genre = book.expand?.genre?.name;
  const subgenres = book.expand?.subgenres ?? [];
  const memberName = member?.name || member?.email || "";

  return (
    <div className="flex flex-col gap-8">
      <Link
        href={`/community/${userId}`}
        className={`inline-flex items-center gap-1.5 font-hand text-[17px] text-accent ${SKETCH_UNDERLINE}`}
      >
        <ArrowLeft aria-hidden="true" width={14} height={14} strokeWidth={2} />
        Retour à la bibliothèque{memberName ? ` de ${memberName}` : ""}
      </Link>

      <div className="flex flex-col gap-6 sm:flex-row">
        <BookCover coverUrl={book.cover_url} title={book.title} size="lg" />

        <div className="flex flex-1 flex-col gap-3.5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="font-hand text-[32px] text-foreground sm:text-[38px]">
                {book.title}
              </h1>
              {serieSubtitle && (
                <p className="mt-1 font-hand text-[18px] text-accent">{serieSubtitle}</p>
              )}
              {author && <p className="mt-1 font-hand text-[17px] text-muted">{author}</p>}
            </div>
            <button
              type="button"
              onClick={handleDuplicate}
              disabled={isDuplicating}
              className={`inline-flex min-h-11 items-center gap-1.5 border-2 border-accent bg-accent px-3.5 font-hand text-[15px] font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60 ${SKETCH_RADIUS}`}
            >
              <Copy aria-hidden="true" width={14} height={14} strokeWidth={2} />
              {isDuplicating ? "Duplication…" : "Dupliquer dans ma bibliothèque"}
            </button>
          </div>

          {duplicate && (
            <p className="flex items-center gap-1.5 font-hand text-[14px] text-accent">
              <TriangleAlert aria-hidden="true" width={14} height={14} strokeWidth={2} className="shrink-0" />
              Tu as déjà{" "}
              <Link href={`/library/${duplicate.id}`} className={SKETCH_UNDERLINE}>
                ce livre
              </Link>{" "}
              dans ta bibliothèque.
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <RankingBadge rating={book.rating} rankings={rankings} variant="full" />
            {genre && (
              <span className="inline-flex min-h-[28px] items-center rounded-[9px] border-2 border-border-field bg-background px-2.5 font-hand text-[14px] text-muted">
                {genre}
              </span>
            )}
            {subgenres.map((sub) => (
              <span
                key={sub.id}
                className="inline-flex min-h-[28px] items-center rounded-[9px] border-2 border-border-field bg-background px-2.5 font-hand text-[14px] text-muted"
              >
                {sub.name}
              </span>
            ))}
          </div>

          {book.summary && (
            <section aria-labelledby="summary-heading" className="mt-2">
              <h2 id="summary-heading" className="font-hand text-[20px] text-foreground">
                Résumé
              </h2>
              <div className="mt-1">
                <MarkdownContent text={book.summary} />
              </div>
            </section>
          )}
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-[8px] bg-accent-soft px-3 py-2 text-sm text-accent">
          {error}
        </p>
      )}

      {book.opinion && (
        <section aria-labelledby="opinion-heading">
          <h2 id="opinion-heading" className="font-hand text-[20px] text-foreground">
            Avis{memberName ? ` de ${memberName}` : ""}
          </h2>
          <div className="mt-1">
            <MarkdownContent text={book.opinion} />
          </div>
        </section>
      )}
    </div>
  );
}
