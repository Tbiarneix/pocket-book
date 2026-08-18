"use client";

import { useId, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { BookStorylineRecord } from "@/lib/types";
import { SKETCH_UNDERLINE, SKETCH_RADIUS } from "@/lib/sketch";

interface Arc {
  storylineId: string;
  name: string;
  comments: BookStorylineRecord[];
  closedAtTome: number | null;
  startTome: number | null;
}

/**
 * Arcs narratifs span a whole série, not one tome — this groups every
 * storyline comment across every book of the série by arc, so any tome's
 * page shows the arc's full history (see BookDetailPage, which fetches
 * `listStorylineComments` rather than filtering to the current book).
 * An arc that hasn't started yet as of the current tome is held back
 * entirely (not just collapsed) to avoid spoiling it early; once it has
 * started, later tomes keep showing it — closed or not.
 */
export function StorylineArcsSection({
  comments,
  currentBookId,
  currentBookTome,
  onAddComment,
  onCreateArc,
  onUpdateComment,
  onRemoveComment,
  onCloseComment,
  onReopenComment,
}: {
  comments: BookStorylineRecord[];
  currentBookId: string;
  currentBookTome: number | null;
  onAddComment: (storylineId: string, comment: string) => Promise<void>;
  onCreateArc: (name: string, comment: string) => Promise<void>;
  onUpdateComment: (relationId: string, comment: string) => Promise<void>;
  onRemoveComment: (relationId: string) => Promise<void>;
  onCloseComment: (storylineId: string, relationId: string) => Promise<void>;
  onReopenComment: (relationId: string) => Promise<void>;
}) {
  const arcs = useMemo(() => buildArcs(comments, currentBookTome), [comments, currentBookTome]);

  const [isCreatingArc, setIsCreatingArc] = useState(false);
  const [newArcName, setNewArcName] = useState("");
  const [newArcComment, setNewArcComment] = useState("");
  const [isSubmittingArc, setIsSubmittingArc] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const newArcNameId = useId();
  const newArcCommentId = useId();

  async function handleCreateArc(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newArcName.trim()) return;
    setIsSubmittingArc(true);
    setCreateError(null);
    try {
      await onCreateArc(newArcName.trim(), newArcComment);
      setNewArcName("");
      setNewArcComment("");
      setIsCreatingArc(false);
    } catch {
      setCreateError("La création a échoué. Réessaie.");
    } finally {
      setIsSubmittingArc(false);
    }
  }

  return (
    <section
      aria-labelledby="arcs-heading"
      className="rounded-[14px] border-2 border-dashed border-border-field bg-surface px-5 py-[18px]"
    >
      <h2 id="arcs-heading" className="font-hand text-[22px] text-foreground">
        Arcs narratifs
      </h2>

      {arcs.length === 0 ? (
        <p className="mt-2 font-hand text-[15px] text-muted">
          Aucun arc narratif associé pour l’instant.
        </p>
      ) : (
        <div className="mt-3 flex flex-col gap-3">
          {arcs.map((arc) => (
            <ArcCard
              key={arc.storylineId}
              arc={arc}
              currentBookId={currentBookId}
              onAddComment={onAddComment}
              onUpdateComment={onUpdateComment}
              onRemoveComment={onRemoveComment}
              onCloseComment={onCloseComment}
              onReopenComment={onReopenComment}
            />
          ))}
        </div>
      )}

      {isCreatingArc ? (
        <form onSubmit={handleCreateArc} className="mt-4 flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor={newArcNameId} className="font-hand text-[13px] text-muted">
              Nom de l’arc
            </label>
            <input
              id={newArcNameId}
              type="text"
              autoFocus
              value={newArcName}
              onChange={(event) => setNewArcName(event.target.value)}
              className="min-h-[38px] w-[200px] rounded-[8px] border-2 border-border-field bg-background px-3 font-hand text-[15px] text-foreground"
            />
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <label htmlFor={newArcCommentId} className="font-hand text-[13px] text-muted">
              Commentaire pour ce tome (optionnel)
            </label>
            <input
              id={newArcCommentId}
              type="text"
              value={newArcComment}
              onChange={(event) => setNewArcComment(event.target.value)}
              className="min-h-[38px] w-full rounded-[8px] border-2 border-border-field bg-background px-3 font-hand text-[15px] text-foreground"
            />
          </div>
          <button
            type="submit"
            disabled={!newArcName.trim() || isSubmittingArc}
            className={`min-h-[38px] border-2 border-accent bg-accent px-4 font-hand text-[15px] font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60 ${SKETCH_RADIUS}`}
          >
            {isSubmittingArc ? "Création…" : "Ajouter"}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsCreatingArc(false);
              setNewArcName("");
              setNewArcComment("");
              setCreateError(null);
            }}
            disabled={isSubmittingArc}
            className="min-h-[38px] font-hand text-[15px] text-muted hover:underline disabled:opacity-60"
          >
            Annuler
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setIsCreatingArc(true)}
          className="mt-4 font-hand text-[15px] text-foreground hover:underline"
        >
          + Nouvel arc narratif
        </button>
      )}

      {createError && (
        <p role="alert" className="mt-2 text-sm text-accent">
          {createError}
        </p>
      )}
    </section>
  );
}

function buildArcs(comments: BookStorylineRecord[], currentBookTome: number | null): Arc[] {
  const groups = new Map<string, { name: string; comments: BookStorylineRecord[] }>();

  for (const comment of comments) {
    const storyline = comment.expand?.storyline;
    if (!storyline) continue;
    const group = groups.get(storyline.id) ?? { name: storyline.name, comments: [] };
    group.comments.push(comment);
    groups.set(storyline.id, group);
  }

  return Array.from(groups.entries())
    .map(([storylineId, group]) => {
      const sorted = [...group.comments].sort(
        (a, b) => (a.expand?.book?.tome ?? Infinity) - (b.expand?.book?.tome ?? Infinity)
      );
      const closing = sorted.find((c) => c.closed);
      const firstCreated = Math.min(...group.comments.map((c) => new Date(c.created).getTime()));
      const tomes = sorted
        .map((c) => c.expand?.book?.tome)
        .filter((tome): tome is number => tome != null);
      return {
        storylineId,
        name: group.name,
        comments: sorted,
        closedAtTome: closing?.expand?.book?.tome ?? null,
        startTome: tomes.length > 0 ? Math.min(...tomes) : null,
        firstCreated,
      };
    })
    .filter(
      // An arc that hasn't started yet by the current tome shouldn't spoil
      // it on earlier tomes — a closed arc from an earlier tome still shows
      // (that's the whole point of tracking closure), only arcs that start
      // *later* than the tome you're on get held back. Arcs with no
      // determinable start tome (or when the current book itself has none)
      // can't be excluded with confidence, so they stay visible.
      (arc) =>
        currentBookTome == null || arc.startTome == null || arc.startTome <= currentBookTome
    )
    .sort((a, b) => a.firstCreated - b.firstCreated);
}

function ArcCard({
  arc,
  currentBookId,
  onAddComment,
  onUpdateComment,
  onRemoveComment,
  onCloseComment,
  onReopenComment,
}: {
  arc: Arc;
  currentBookId: string;
  onAddComment: (storylineId: string, comment: string) => Promise<void>;
  onUpdateComment: (relationId: string, comment: string) => Promise<void>;
  onRemoveComment: (relationId: string) => Promise<void>;
  onCloseComment: (storylineId: string, relationId: string) => Promise<void>;
  onReopenComment: (relationId: string) => Promise<void>;
}) {
  const [isExpanded, setIsExpanded] = useState(() => arc.closedAtTome === null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const editId = useId();
  const newCommentId = useId();

  const hasCommentForCurrentBook = arc.comments.some((c) => c.book === currentBookId);

  function startEditing(comment: BookStorylineRecord) {
    setEditingId(comment.id);
    setEditValue(comment.comment);
    setError(null);
  }

  async function saveEdit(id: string) {
    setIsSavingEdit(true);
    setError(null);
    try {
      await onUpdateComment(id, editValue);
      setEditingId(null);
    } catch {
      setError("La modification a échoué. Réessaie.");
    } finally {
      setIsSavingEdit(false);
    }
  }

  async function handleClose(id: string) {
    setPendingId(id);
    setError(null);
    try {
      await onCloseComment(arc.storylineId, id);
    } catch {
      setError("La clôture a échoué. Réessaie.");
    } finally {
      setPendingId(null);
    }
  }

  async function handleReopen(id: string) {
    setPendingId(id);
    setError(null);
    try {
      await onReopenComment(id);
    } catch {
      setError("La réouverture a échoué. Réessaie.");
    } finally {
      setPendingId(null);
    }
  }

  async function handleRemove(id: string) {
    setPendingId(id);
    setError(null);
    try {
      await onRemoveComment(id);
    } catch {
      setError("La suppression a échoué. Réessaie.");
      setPendingId(null);
    }
  }

  async function handleAddComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmittingComment(true);
    setError(null);
    try {
      await onAddComment(arc.storylineId, newComment);
      setNewComment("");
      setIsAddingComment(false);
    } catch {
      setError("L’ajout a échoué. Réessaie.");
    } finally {
      setIsSubmittingComment(false);
    }
  }

  return (
    <div className="rounded-[10px] bg-surface-muted">
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-expanded={isExpanded}
        className="flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left"
      >
        <span className="flex items-center gap-2">
          <ChevronRight
            aria-hidden="true"
            width={16}
            height={16}
            strokeWidth={2}
            className={`shrink-0 text-muted transition-transform ${isExpanded ? "rotate-90" : ""}`}
          />
          <span className="font-hand text-[17px] font-semibold text-foreground">{arc.name}</span>
        </span>
        {arc.closedAtTome !== null && (
          <span className="shrink-0 rounded-[8px] border border-border-field bg-background px-2 py-0.5 font-hand text-[13px] text-muted">
            Arc clôturé au tome {arc.closedAtTome}
          </span>
        )}
      </button>

      {isExpanded && (
        <div className="flex flex-col gap-2 px-3.5 pb-3.5">
          {arc.comments.map((comment) => {
            const bookTitle = comment.expand?.book?.title ?? "Livre";
            const tome = comment.expand?.book?.tome;
            const heading = tome ? `Tome ${tome} : ${bookTitle}` : bookTitle;
            const isCurrentBook = comment.book === currentBookId;
            const isPending = pendingId === comment.id;

            if (editingId === comment.id) {
              return (
                <div
                  key={comment.id}
                  className="flex flex-col gap-2 rounded-[8px] bg-background px-3 py-2.5"
                >
                  <p className="font-hand text-[15px] font-semibold text-foreground">{heading}</p>
                  <label htmlFor={`${editId}-${comment.id}`} className="sr-only">
                    Commentaire pour {heading}
                  </label>
                  <textarea
                    id={`${editId}-${comment.id}`}
                    autoFocus
                    rows={2}
                    value={editValue}
                    onChange={(event) => setEditValue(event.target.value)}
                    className="w-full rounded-[8px] border-2 border-border-field bg-surface px-3 py-2 font-hand text-[15px] text-foreground"
                  />
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => saveEdit(comment.id)}
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
                </div>
              );
            }

            return (
              <div
                key={comment.id}
                className={`flex flex-col gap-1 rounded-[8px] px-3 py-2.5 ${
                  isCurrentBook ? "bg-accent-soft" : "bg-background"
                }`}
              >
                <Link
                  href={`/library/${comment.book}`}
                  className={`self-start font-hand text-[15px] font-semibold text-foreground ${SKETCH_UNDERLINE}`}
                >
                  {heading}
                </Link>
                {comment.comment && (
                  <p className="font-hand text-[15px] text-muted">{comment.comment}</p>
                )}
                <div className="mt-1 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => startEditing(comment)}
                    className="min-h-7 font-hand text-[14px] text-foreground hover:underline"
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(comment.id)}
                    disabled={isPending}
                    className="min-h-7 font-hand text-[14px] text-accent hover:underline disabled:opacity-60"
                  >
                    Retirer
                  </button>
                  {comment.closed ? (
                    <button
                      type="button"
                      onClick={() => handleReopen(comment.id)}
                      disabled={isPending}
                      className="min-h-7 font-hand text-[14px] text-foreground hover:underline disabled:opacity-60"
                    >
                      Rouvrir l’arc
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleClose(comment.id)}
                      disabled={isPending}
                      className="min-h-7 font-hand text-[14px] text-foreground hover:underline disabled:opacity-60"
                    >
                      Clôturer l’arc
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {!hasCommentForCurrentBook &&
            (isAddingComment ? (
              <form
                onSubmit={handleAddComment}
                className="flex flex-col gap-2 rounded-[8px] bg-background px-3 py-2.5"
              >
                <label htmlFor={newCommentId} className="font-hand text-[13px] text-muted">
                  Commentaire pour ce tome (optionnel)
                </label>
                <textarea
                  id={newCommentId}
                  autoFocus
                  rows={2}
                  value={newComment}
                  onChange={(event) => setNewComment(event.target.value)}
                  className="w-full rounded-[8px] border-2 border-border-field bg-surface px-3 py-2 font-hand text-[15px] text-foreground"
                />
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isSubmittingComment}
                    className="min-h-8 shrink-0 font-hand text-[15px] font-semibold text-accent hover:underline disabled:opacity-60"
                  >
                    {isSubmittingComment ? "Ajout…" : "Ajouter"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingComment(false);
                      setNewComment("");
                    }}
                    disabled={isSubmittingComment}
                    className="min-h-8 shrink-0 font-hand text-[15px] text-muted hover:underline disabled:opacity-60"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingComment(true)}
                className="self-start font-hand text-[14px] text-foreground hover:underline"
              >
                + Ajouter un commentaire pour ce tome
              </button>
            ))}

          {error && (
            <p role="alert" className="text-sm text-accent">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
