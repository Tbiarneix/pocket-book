"use client";

import { use, useEffect, useId, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import {
  addBookCharacter,
  addBookStoryline,
  deleteBook,
  getBook,
  listBookCharacters,
  listBookStorylines,
  listCharacters,
  listRankings,
  listStorylines,
  removeBookCharacter,
  removeBookStoryline,
} from "@/lib/data";
import type {
  BookCharacterRecord,
  BookStorylineRecord,
  CharacterRecord,
  ExpandedBookRecord,
  RankingRecord,
  StorylineRecord,
} from "@/lib/types";
import { RankingBadge } from "@/components/RankingBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { BookCover } from "@/components/BookCover";
import { isActiveStatus } from "@/lib/statusStyle";

async function fetchBookPageData(id: string) {
  const [book, rankings, bookCharacters, bookStorylines, characters, storylines] =
    await Promise.all([
      getBook(id),
      listRankings(),
      listBookCharacters(id),
      listBookStorylines(id),
      listCharacters(),
      listStorylines(),
    ]);

  return { book, rankings, bookCharacters, bookStorylines, characters, storylines };
}

export default function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [book, setBook] = useState<ExpandedBookRecord | null>(null);
  const [rankings, setRankings] = useState<RankingRecord[]>([]);
  const [bookCharacters, setBookCharacters] = useState<BookCharacterRecord[]>([]);
  const [bookStorylines, setBookStorylines] = useState<BookStorylineRecord[]>([]);
  const [allCharacters, setAllCharacters] = useState<CharacterRecord[]>([]);
  const [allStorylines, setAllStorylines] = useState<StorylineRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchBookPageData(id)
      .then((data) => {
        if (cancelled) return;
        setBook(data.book);
        setRankings(data.rankings);
        setBookCharacters(data.bookCharacters);
        setBookStorylines(data.bookStorylines);
        setAllCharacters(data.characters);
        setAllStorylines(data.storylines);
      })
      .catch(() => {
        if (!cancelled) setError("Impossible de charger ce livre.");
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Called from event handlers (after adding/removing a relation) to refresh
  // the page's data — not part of the initial-load effect above.
  async function refresh() {
    try {
      const data = await fetchBookPageData(id);
      setBook(data.book);
      setRankings(data.rankings);
      setBookCharacters(data.bookCharacters);
      setBookStorylines(data.bookStorylines);
      setAllCharacters(data.characters);
      setAllStorylines(data.storylines);
    } catch {
      setError("Impossible de rafraîchir ce livre.");
    }
  }

  async function handleDelete() {
    if (!window.confirm("Supprimer définitivement ce livre ?")) return;
    setIsDeleting(true);
    try {
      await deleteBook(id);
      router.push("/library");
    } catch {
      setError("La suppression a échoué. Réessaie.");
      setIsDeleting(false);
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
  const genre = book.expand?.genre?.name;
  const subgenres = book.expand?.subgenres ?? [];
  const status = book.expand?.status?.name;

  return (
    <div className="flex flex-col gap-8">
      <Link
        href="/library"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-accent hover:underline"
      >
        <ArrowLeft aria-hidden="true" width={14} height={14} strokeWidth={2} />
        Retour à la bibliothèque
      </Link>

      <div className="flex flex-col gap-6 sm:flex-row">
        <BookCover
          coverUrl={book.cover_url}
          title={book.title}
          active={isActiveStatus(status)}
          size="lg"
        />

        <div className="flex flex-1 flex-col gap-3.5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="font-serif text-2xl font-semibold text-foreground sm:text-[28px]">
                {book.title}
              </h1>
              {author && <p className="mt-1 text-[15px] text-muted">{author}</p>}
            </div>
            <div className="flex gap-2">
              <Link
                href={`/library/${id}/edit`}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-[8px] border border-border-strong px-3.5 text-[13.5px] font-semibold text-foreground hover:bg-surface-muted"
              >
                <Pencil aria-hidden="true" width={14} height={14} strokeWidth={2} />
                Modifier
              </Link>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-[8px] border border-accent px-3.5 text-[13.5px] font-semibold text-accent hover:bg-accent-soft disabled:opacity-60"
              >
                <Trash2 aria-hidden="true" width={14} height={14} strokeWidth={2} />
                {isDeleting ? "Suppression…" : "Supprimer"}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <RankingBadge rating={book.rating} rankings={rankings} variant="full" />
            {status && <StatusBadge name={status} />}
            {serie && (
              <span className="inline-flex min-h-[26px] items-center rounded-full border border-border-field px-2.5 text-[12.5px] font-medium text-muted">
                Série : {serie}
              </span>
            )}
            {genre && (
              <span className="inline-flex min-h-[26px] items-center rounded-full border border-border-field px-2.5 text-[12.5px] font-medium text-muted">
                {genre}
              </span>
            )}
            {subgenres.map((sub) => (
              <span
                key={sub.id}
                className="inline-flex min-h-[26px] items-center rounded-full border border-border-field px-2.5 text-[12.5px] font-medium text-muted"
              >
                {sub.name}
              </span>
            ))}
          </div>

          {book.finished && (
            <p className="text-sm text-muted">
              Terminé le {new Date(book.finished).toLocaleDateString("fr-FR")}
            </p>
          )}

          {book.summary && (
            <section aria-labelledby="summary-heading" className="mt-2">
              <h2 id="summary-heading" className="text-[13.5px] font-semibold text-foreground">
                Résumé
              </h2>
              <p className="mt-1 whitespace-pre-wrap text-[14.5px] leading-[1.65] text-foreground">
                {book.summary}
              </p>
            </section>
          )}

          {book.opinion && (
            <section aria-labelledby="opinion-heading" className="mt-2">
              <h2 id="opinion-heading" className="text-[13.5px] font-semibold text-foreground">
                Mon avis
              </h2>
              <p className="mt-1 whitespace-pre-wrap text-[14.5px] leading-[1.65] text-foreground">
                {book.opinion}
              </p>
            </section>
          )}
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-[8px] bg-accent-soft px-3 py-2 text-sm text-accent">
          {error}
        </p>
      )}

      <RelationSection
        title="Personnages"
        emptyLabel="Aucun personnage associé pour l'instant."
        items={bookCharacters.map((bc) => ({
          id: bc.id,
          label: bc.expand?.character?.name ?? "Personnage",
          comment: bc.comment,
        }))}
        options={allCharacters}
        onAdd={async (refId, comment) => {
          await addBookCharacter(id, refId, comment);
          await refresh();
        }}
        onRemove={async (relationId) => {
          await removeBookCharacter(relationId);
          await refresh();
        }}
        addLabel="Ajouter un personnage"
        selectLabel="Personnage"
      />

      <RelationSection
        title="Arcs narratifs"
        emptyLabel="Aucun arc narratif associé pour l'instant."
        items={bookStorylines.map((bs) => ({
          id: bs.id,
          label: bs.expand?.storyline?.name ?? "Arc narratif",
          comment: bs.comment,
        }))}
        options={allStorylines}
        onAdd={async (refId, comment) => {
          await addBookStoryline(id, refId, comment);
          await refresh();
        }}
        onRemove={async (relationId) => {
          await removeBookStoryline(relationId);
          await refresh();
        }}
        addLabel="Ajouter un arc narratif"
        selectLabel="Arc narratif"
      />
    </div>
  );
}

interface RelationItem {
  id: string;
  label: string;
  comment: string;
}

function RelationSection({
  title,
  emptyLabel,
  items,
  options,
  onAdd,
  onRemove,
  addLabel,
  selectLabel,
}: {
  title: string;
  emptyLabel: string;
  items: RelationItem[];
  options: { id: string; name: string }[];
  onAdd: (refId: string, comment: string) => Promise<void>;
  onRemove: (relationId: string) => Promise<void>;
  addLabel: string;
  selectLabel: string;
}) {
  const [selected, setSelected] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectId = useId();
  const commentId = useId();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await onAdd(selected, comment);
      setSelected("");
      setComment("");
    } catch {
      setError("L'ajout a échoué. Réessaie.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section
      aria-labelledby={`${selectId}-heading`}
      className="rounded-[10px] border border-border bg-surface px-5 py-[18px]"
    >
      <h2 id={`${selectId}-heading`} className="font-serif text-[15px] font-semibold text-foreground">
        {title}
      </h2>

      {items.length === 0 ? (
        <p className="mt-2 text-sm text-muted">{emptyLabel}</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-3 rounded-[8px] bg-surface-muted px-3.5 py-2.5"
            >
              <div>
                <p className="text-[13.5px] font-semibold text-foreground">{item.label}</p>
                {item.comment && item.comment !== "N/A" && (
                  <p className="mt-0.5 text-[13px] text-muted">{item.comment}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="min-h-8 shrink-0 text-[13px] font-semibold text-accent hover:underline"
              >
                Retirer
                <span className="sr-only"> {item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="mt-4 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={selectId} className="text-xs font-semibold text-muted">
            {selectLabel}
          </label>
          <select
            id={selectId}
            value={selected}
            onChange={(event) => setSelected(event.target.value)}
            className="min-h-[38px] w-[200px] rounded-[8px] border border-border-field bg-surface px-3 text-[13.5px] text-foreground"
          >
            <option value="">Choisir…</option>
            {options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor={commentId} className="text-xs font-semibold text-muted">
            Commentaire (optionnel)
          </label>
          <input
            id={commentId}
            type="text"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            className="min-h-[38px] w-full rounded-[8px] border border-border-field bg-surface px-3 text-[13.5px] text-foreground"
          />
        </div>

        <button
          type="submit"
          disabled={!selected || isSubmitting}
          className="min-h-[38px] rounded-[8px] bg-accent px-4 text-[13.5px] font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
        >
          {isSubmitting ? "Ajout…" : addLabel}
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-2 text-sm text-accent">
          {error}
        </p>
      )}
    </section>
  );
}
