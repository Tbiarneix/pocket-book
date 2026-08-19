"use client";

import { use, useEffect, useId, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Handshake, Pencil, Trash2, Undo2 } from "lucide-react";
import {
  addBookCharacter,
  addBookStoryline,
  closeBookStoryline,
  createCharacter,
  createStoryline,
  deleteBook,
  getBook,
  listBookCharacters,
  listCharacters,
  listRankings,
  listStorylineComments,
  loanBook,
  removeBookCharacter,
  removeBookStoryline,
  reopenBookStoryline,
  returnBook,
  updateBookCharacter,
  updateBookStoryline,
} from "@/lib/data";
import type {
  BookCharacterRecord,
  BookStorylineRecord,
  CharacterRecord,
  ExpandedBookRecord,
  RankingRecord,
} from "@/lib/types";
import { RankingBadge } from "@/components/RankingBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { BookCover } from "@/components/BookCover";
import { LoanBookModal } from "@/components/LoanBookModal";
import { MarkdownContent } from "@/components/MarkdownContent";
import { ReturnBookModal } from "@/components/ReturnBookModal";
import { StorylineArcsSection } from "@/components/StorylineArcsSection";
import { isActiveStatus } from "@/lib/statusStyle";
import { SKETCH_RADIUS, SKETCH_UNDERLINE } from "@/lib/sketch";

async function fetchBookPageData(id: string) {
  const book = await getBook(id);
  const [rankings, bookCharacters, storylineComments, characters] = await Promise.all([
    listRankings(),
    listBookCharacters(id),
    listStorylineComments(book.serie, id, book.user),
    listCharacters(),
  ]);

  return { book, rankings, bookCharacters, storylineComments, characters };
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
  const [storylineComments, setStorylineComments] = useState<BookStorylineRecord[]>([]);
  const [allCharacters, setAllCharacters] = useState<CharacterRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchBookPageData(id)
      .then((data) => {
        if (cancelled) return;
        setBook(data.book);
        setRankings(data.rankings);
        setBookCharacters(data.bookCharacters);
        setStorylineComments(data.storylineComments);
        setAllCharacters(data.characters);
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
      setStorylineComments(data.storylineComments);
      setAllCharacters(data.characters);
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

  async function handleLoan(loanedTo: string) {
    await loanBook(id, loanedTo);
    setIsLoanModalOpen(false);
    await refresh();
  }

  async function handleReturn() {
    await returnBook(id);
    setIsReturnModalOpen(false);
    await refresh();
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
  const status = book.expand?.status?.name;

  // Characters are scoped to a série (reusable across every tome of that
  // série) so the picker doesn't mix in unrelated books' casts. Standalone
  // books (no série) fall back to their own `book` scope instead of
  // matching on an empty `serie`, which would otherwise lump every
  // standalone book's characters into one shared pool.
  const seriesCharacters = book.serie
    ? allCharacters.filter((c) => c.serie === book.serie)
    : allCharacters.filter((c) => c.book === id);

  return (
    <div className="flex flex-col gap-8">
      <Link
        href="/library"
        className={`inline-flex items-center gap-1.5 font-hand text-[17px] text-accent ${SKETCH_UNDERLINE}`}
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
              <h1 className="font-hand text-[32px] text-foreground sm:text-[38px]">
                {book.title}
              </h1>
              {serieSubtitle && (
                <p className="mt-1 font-hand text-[18px] text-accent">{serieSubtitle}</p>
              )}
              {author && <p className="mt-1 font-hand text-[17px] text-muted">{author}</p>}
              {book.loaned_to && (
                <p className="mt-1 font-hand text-[15px] text-accent">
                  Prêté à {book.loaned_to}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {book.loaned_to ? (
                <button
                  type="button"
                  onClick={() => setIsReturnModalOpen(true)}
                  className={`inline-flex min-h-11 items-center gap-1.5 border-2 border-border-strong bg-background px-3.5 font-hand text-[15px] text-foreground hover:bg-surface-muted ${SKETCH_RADIUS}`}
                >
                  <Undo2 aria-hidden="true" width={14} height={14} strokeWidth={2} />
                  Récupérer
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsLoanModalOpen(true)}
                  className={`inline-flex min-h-11 items-center gap-1.5 border-2 border-border-strong bg-background px-3.5 font-hand text-[15px] text-foreground hover:bg-surface-muted ${SKETCH_RADIUS}`}
                >
                  <Handshake aria-hidden="true" width={14} height={14} strokeWidth={2} />
                  Prêter
                </button>
              )}
              <Link
                href={`/library/${id}/edit`}
                className={`inline-flex min-h-11 items-center gap-1.5 border-2 border-border-strong bg-background px-3.5 font-hand text-[15px] text-foreground hover:bg-surface-muted ${SKETCH_RADIUS}`}
              >
                <Pencil aria-hidden="true" width={14} height={14} strokeWidth={2} />
                Modifier
              </Link>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className={`inline-flex min-h-11 items-center gap-1.5 border-2 border-accent bg-background px-3.5 font-hand text-[15px] text-accent hover:bg-accent-soft disabled:opacity-60 ${SKETCH_RADIUS}`}
              >
                <Trash2 aria-hidden="true" width={14} height={14} strokeWidth={2} />
                {isDeleting ? "Suppression…" : "Supprimer"}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <RankingBadge rating={book.rating} rankings={rankings} variant="full" />
            {status && <StatusBadge name={status} />}
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

          {book.finished && (
            <p className="font-mono text-sm text-muted">
              Terminé le {new Date(book.finished).toLocaleDateString("fr-FR")}
            </p>
          )}

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

      <RelationSection
        title="Personnages"
        emptyLabel="Aucun personnage associé pour l'instant."
        items={bookCharacters.map((bc) => ({
          id: bc.id,
          label: bc.expand?.character?.name ?? "Personnage",
          comment: bc.comment,
        }))}
        options={seriesCharacters}
        onAdd={async (refId, comment) => {
          await addBookCharacter(id, refId, comment);
          await refresh();
        }}
        onRemove={async (relationId) => {
          await removeBookCharacter(relationId);
          await refresh();
        }}
        onUpdate={async (relationId, comment) => {
          await updateBookCharacter(relationId, comment);
          await refresh();
        }}
        onCreateOption={async (name) =>
          createCharacter(name, book.serie, book.serie ? "" : id)
        }
        addLabel="Ajouter un personnage"
        selectLabel="Personnage"
      />

      <StorylineArcsSection
        comments={storylineComments}
        currentBookId={id}
        currentBookTome={book.tome}
        onAddComment={async (storylineId, comment) => {
          await addBookStoryline(id, storylineId, comment);
          await refresh();
        }}
        onCreateArc={async (name, comment) => {
          const created = await createStoryline(name, book.serie, book.serie ? "" : id);
          await addBookStoryline(id, created.id, comment);
          await refresh();
        }}
        onUpdateComment={async (relationId, comment) => {
          await updateBookStoryline(relationId, comment);
          await refresh();
        }}
        onRemoveComment={async (relationId) => {
          await removeBookStoryline(relationId);
          await refresh();
        }}
        onCloseComment={async (storylineId, relationId) => {
          await closeBookStoryline(storylineId, relationId, book.user);
          await refresh();
        }}
        onReopenComment={async (relationId) => {
          await reopenBookStoryline(relationId);
          await refresh();
        }}
      />

      {book.opinion && (
        <section aria-labelledby="opinion-heading">
          <h2 id="opinion-heading" className="font-hand text-[20px] text-foreground">
            Mon avis
          </h2>
          <div className="mt-1">
            <MarkdownContent text={book.opinion} />
          </div>
        </section>
      )}

      {isLoanModalOpen && (
        <LoanBookModal
          bookTitle={book.title}
          onConfirm={handleLoan}
          onClose={() => setIsLoanModalOpen(false)}
        />
      )}

      {isReturnModalOpen && (
        <ReturnBookModal
          bookTitle={book.title}
          loanedTo={book.loaned_to}
          onConfirm={handleReturn}
          onClose={() => setIsReturnModalOpen(false)}
        />
      )}
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
  onUpdate,
  onCreateOption,
  addLabel,
  selectLabel,
}: {
  title: string;
  emptyLabel: string;
  items: RelationItem[];
  options: { id: string; name: string }[];
  onAdd: (refId: string, comment: string) => Promise<void>;
  onRemove: (relationId: string) => Promise<void>;
  onUpdate: (relationId: string, comment: string) => Promise<void>;
  onCreateOption: (name: string) => Promise<{ id: string; name: string }>;
  addLabel: string;
  selectLabel: string;
}) {
  const [selected, setSelected] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isCreatingOption, setIsCreatingOption] = useState(false);
  const [newOptionName, setNewOptionName] = useState("");
  const selectId = useId();
  const commentId = useId();
  const editId = useId();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isCreatingOption ? !newOptionName.trim() : !selected) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const refId = isCreatingOption
        ? (await onCreateOption(newOptionName.trim())).id
        : selected;
      await onAdd(refId, comment);
      setSelected("");
      setComment("");
      setIsCreatingOption(false);
      setNewOptionName("");
    } catch {
      setError(isCreatingOption ? "La création a échoué. Réessaie." : "L'ajout a échoué. Réessaie.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function startEditing(item: RelationItem) {
    setEditingId(item.id);
    setEditValue(item.comment === "N/A" ? "" : item.comment);
    setError(null);
  }

  async function saveEdit(relationId: string) {
    setIsSavingEdit(true);
    setError(null);
    try {
      await onUpdate(relationId, editValue);
      setEditingId(null);
    } catch {
      setError("La modification a échoué. Réessaie.");
    } finally {
      setIsSavingEdit(false);
    }
  }

  return (
    <section
      aria-labelledby={`${selectId}-heading`}
      className="rounded-[14px] border-2 border-dashed border-border-field bg-surface px-5 py-[18px]"
    >
      <h2 id={`${selectId}-heading`} className="font-hand text-[22px] text-foreground">
        {title}
      </h2>

      {items.length === 0 ? (
        <p className="mt-2 font-hand text-[15px] text-muted">{emptyLabel}</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {items.map((item) =>
            editingId === item.id ? (
              <li
                key={item.id}
                className="flex flex-col gap-2 rounded-[8px] bg-surface-muted px-3.5 py-2.5"
              >
                <p className="font-hand text-[16px] font-semibold text-foreground">{item.label}</p>
                <label htmlFor={`${editId}-${item.id}`} className="sr-only">
                  Commentaire pour {item.label}
                </label>
                <textarea
                  id={`${editId}-${item.id}`}
                  autoFocus
                  rows={2}
                  value={editValue}
                  onChange={(event) => setEditValue(event.target.value)}
                  className="w-full rounded-[8px] border-2 border-border-field bg-background px-3 py-2 font-hand text-[15px] text-foreground"
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => saveEdit(item.id)}
                    disabled={isSavingEdit}
                    className="min-h-8 shrink-0 font-hand text-[15px] font-semibold text-accent hover:underline disabled:opacity-60"
                  >
                    {isSavingEdit ? "Enregistrement…" : "Enregistrer"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    disabled={isSavingEdit}
                    className="min-h-8 shrink-0 font-hand text-[15px] text-muted hover:underline disabled:opacity-60"
                  >
                    Annuler
                  </button>
                </div>
              </li>
            ) : (
              <li
                key={item.id}
                className="flex items-start justify-between gap-3 rounded-[8px] bg-surface-muted px-3.5 py-2.5"
              >
                <div>
                  <p className="font-hand text-[16px] font-semibold text-foreground">{item.label}</p>
                  {item.comment && item.comment !== "N/A" && (
                    <p className="mt-0.5 font-hand text-[15px] text-muted">{item.comment}</p>
                  )}
                </div>
                <div className="flex shrink-0 gap-3">
                  <button
                    type="button"
                    onClick={() => startEditing(item)}
                    className="min-h-8 font-hand text-[15px] text-foreground hover:underline"
                  >
                    Modifier
                    <span className="sr-only"> {item.label}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    className="min-h-8 font-hand text-[15px] text-accent hover:underline"
                  >
                    Retirer
                    <span className="sr-only"> {item.label}</span>
                  </button>
                </div>
              </li>
            )
          )}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="mt-4 flex flex-wrap items-end gap-3">
        {isCreatingOption ? (
          <div className="flex flex-col gap-1.5">
            <label htmlFor={selectId} className="font-hand text-[13px] text-muted">
              Nouveau : {selectLabel.toLowerCase()}
            </label>
            <input
              id={selectId}
              type="text"
              autoFocus
              value={newOptionName}
              onChange={(event) => setNewOptionName(event.target.value)}
              className="min-h-[38px] w-[200px] rounded-[8px] border-2 border-border-field bg-background px-3 font-hand text-[15px] text-foreground"
            />
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <label htmlFor={selectId} className="font-hand text-[13px] text-muted">
              {selectLabel}
            </label>
            <select
              id={selectId}
              value={selected}
              onChange={(event) => setSelected(event.target.value)}
              className="min-h-[38px] w-[200px] rounded-[8px] border-2 border-border-field bg-background px-3 font-hand text-[15px] text-foreground"
            >
              <option value="">Choisir…</option>
              {options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            setIsCreatingOption((prev) => !prev);
            setSelected("");
            setNewOptionName("");
            setError(null);
          }}
          className="min-h-[38px] shrink-0 font-hand text-[15px] text-foreground hover:underline"
        >
          {isCreatingOption ? "Choisir dans la liste" : "+ Nouveau"}
        </button>

        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor={commentId} className="font-hand text-[13px] text-muted">
            Commentaire (optionnel)
          </label>
          <input
            id={commentId}
            type="text"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            className="min-h-[38px] w-full rounded-[8px] border-2 border-border-field bg-background px-3 font-hand text-[15px] text-foreground"
          />
        </div>

        <button
          type="submit"
          disabled={(isCreatingOption ? !newOptionName.trim() : !selected) || isSubmitting}
          className={`min-h-[38px] border-2 border-accent bg-accent px-4 font-hand text-[15px] font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60 ${SKETCH_RADIUS}`}
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
