"use client";

import { useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";
import { createAuthor, createBook, createGenre, createSeries } from "@/lib/data";
import { htmlDescriptionToText, matchGenre, type GoogleBookResult } from "@/lib/googleBooks";
import type { ReferenceData } from "./BookForm";
import { SelectWithCreate } from "./SelectWithCreate";
import { MarkdownTextarea } from "./MarkdownTextarea";
import { SKETCH_RADIUS } from "@/lib/sketch";

const fieldClasses =
  "min-h-11 rounded-[8px] border-2 border-border-field bg-surface px-3 font-hand text-base text-foreground";
const labelClasses = "font-hand text-[15px] text-foreground";

interface Draft {
  title: string;
  coverUrl: string;
  summary: string;
  author: string;
  serie: string;
  tome: string;
  genre: string;
  status: string;
}

/**
 * Steps through every book picked in BookSearchModal one at a time —
 * pre-filled from the Google Books result, editable, "Suivant" saves the
 * current step and moves on (so leaving every field untouched still adds
 * all of them, just explicitly rather than silently in the background).
 * Résumé/couverture/auteur·rice come from the search; note/avis/date de fin
 * are left out since these are books not yet read.
 */
export function AddBooksWizard({
  results,
  reference,
  onReferenceChange,
  userId,
  onClose,
}: {
  results: GoogleBookResult[];
  reference: ReferenceData;
  onReferenceChange: (updater: (prev: ReferenceData) => ReferenceData) => void;
  userId: string;
  onClose: () => void;
}) {
  const [drafts, setDrafts] = useState<Draft[] | null>(null);
  const [step, setStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const titleId = useId();
  const coverId = useId();
  const summaryId = useId();

  // Resolving author names creates PocketBase records for any that don't
  // exist yet — a side effect that must run exactly once, not on every
  // React Strict Mode dev double-invoke of this effect.
  const hasPreparedRef = useRef(false);

  useEffect(() => {
    if (hasPreparedRef.current) return;
    hasPreparedRef.current = true;

    async function prepare() {
      const authorsByName = new Map(reference.authors.map((a) => [a.name.toLowerCase(), a]));
      const wishlistStatus = reference.statuses.find((s) => s.name === "Mes envies");
      const prepared: Draft[] = [];

      for (const result of results) {
        let authorId = "";
        const name = result.authors[0];
        if (name) {
          const existing = authorsByName.get(name.toLowerCase());
          if (existing) {
            authorId = existing.id;
          } else {
            const created = await createAuthor(name);
            authorsByName.set(name.toLowerCase(), created);
            onReferenceChange((prev) => ({ ...prev, authors: [...prev.authors, created] }));
            authorId = created.id;
          }
        }

        prepared.push({
          title: result.title,
          coverUrl: result.thumbnail,
          summary: htmlDescriptionToText(result.description),
          author: authorId,
          serie: "",
          tome: "",
          genre: matchGenre(result.categories, reference.genres)?.id ?? "",
          status: wishlistStatus?.id ?? "",
        });
      }

      setDrafts(prepared);
    }

    prepare().catch(() => {
      setError("La préparation a échoué. Ferme et réessaie.");
    });
    // Runs once with the results/reference this wizard was opened with.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function patchDraft(patch: Partial<Draft>) {
    setDrafts((prev) => {
      if (!prev) return prev;
      const next = [...prev];
      next[step] = { ...next[step], ...patch };
      return next;
    });
  }

  async function handleNext() {
    if (!drafts) return;
    const draft = drafts[step];
    if (!draft.title.trim()) {
      setError("Le titre est obligatoire.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await createBook(userId, {
        title: draft.title.trim(),
        cover_url: draft.coverUrl.trim(),
        summary: draft.summary,
        opinion: "",
        author: draft.author,
        serie: draft.serie,
        tome: draft.tome === "" ? null : Number(draft.tome),
        genre: draft.genre,
        subgenres: [],
        rating: null,
        status: draft.status,
        finished: "",
      });
      if (step + 1 < drafts.length) {
        setStep((s) => s + 1);
      } else {
        onClose();
      }
    } catch {
      setError("L'enregistrement a échoué. Réessaie.");
    } finally {
      setIsSaving(false);
    }
  }

  const draft = drafts?.[step];
  const isLast = drafts ? step === drafts.length - 1 : false;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-4 py-8 sm:items-center">
      <div className="fixed inset-0 bg-black/40" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Ajouter les livres"
        className={`relative flex max-h-[85vh] w-full max-w-2xl flex-col border-2 border-border-strong bg-surface p-5 ${SKETCH_RADIUS}`}
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-hand text-[20px] text-foreground">
            {drafts ? `Livre ${step + 1} sur ${drafts.length}` : "Préparation…"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="shrink-0 p-1 text-muted hover:text-foreground"
          >
            <X aria-hidden="true" width={20} height={20} strokeWidth={2} />
          </button>
        </div>

        {!drafts || !draft ? (
          <p role={error ? "alert" : "status"} className="mt-4 text-sm text-muted">
            {error ?? "Préparation des fiches…"}
          </p>
        ) : (
          <>
            <p className="mt-1 font-hand text-[14px] text-muted">
              Vérifie ou complète, ou passe directement au suivant.
            </p>

            <div className="mt-4 flex-1 overflow-y-auto pr-1">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor={titleId} className={labelClasses}>
                    Titre <span aria-hidden="true" className="text-accent">*</span>
                  </label>
                  <input
                    id={titleId}
                    type="text"
                    value={draft.title}
                    onChange={(event) => patchDraft({ title: event.target.value })}
                    className={fieldClasses}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor={coverId} className={labelClasses}>
                    URL de la couverture
                  </label>
                  <input
                    id={coverId}
                    type="url"
                    value={draft.coverUrl}
                    onChange={(event) => patchDraft({ coverUrl: event.target.value })}
                    className={fieldClasses}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <SelectWithCreate
                    label="Auteur·rice"
                    value={draft.author}
                    options={reference.authors}
                    onChange={(id) => patchDraft({ author: id })}
                    onCreate={async (name) => {
                      const created = await createAuthor(name);
                      onReferenceChange((prev) => ({ ...prev, authors: [...prev.authors, created] }));
                      return created;
                    }}
                  />

                  <div className="flex gap-3">
                    <div className="flex-1">
                      <SelectWithCreate
                        label="Série"
                        value={draft.serie}
                        options={reference.series}
                        onChange={(id) => patchDraft({ serie: id })}
                        onCreate={async (name) => {
                          const created = await createSeries(name);
                          onReferenceChange((prev) => ({ ...prev, series: [...prev.series, created] }));
                          return created;
                        }}
                      />
                    </div>
                    <div className="flex w-20 shrink-0 flex-col gap-1.5">
                      <label className={labelClasses}>Tome</label>
                      <input
                        type="number"
                        min={1}
                        step={1}
                        value={draft.tome}
                        onChange={(event) => patchDraft({ tome: event.target.value })}
                        className={`${fieldClasses} font-mono`}
                      />
                    </div>
                  </div>

                  <SelectWithCreate
                    label="Genre"
                    value={draft.genre}
                    options={reference.genres}
                    onChange={(id) => patchDraft({ genre: id })}
                    onCreate={async (name) => {
                      const created = await createGenre(name);
                      onReferenceChange((prev) => ({ ...prev, genres: [...prev.genres, created] }));
                      return created;
                    }}
                  />

                  <div className="flex flex-col gap-1.5">
                    <label className={labelClasses}>Statut</label>
                    <select
                      value={draft.status}
                      onChange={(event) => patchDraft({ status: event.target.value })}
                      className={fieldClasses}
                    >
                      <option value="">—</option>
                      {reference.statuses.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor={summaryId} className={labelClasses}>
                    Résumé
                  </label>
                  <MarkdownTextarea
                    id={summaryId}
                    value={draft.summary}
                    onChange={(value) => patchDraft({ summary: value })}
                    rows={4}
                  />
                </div>
              </div>
            </div>

            {error && (
              <p role="alert" className="mt-3 rounded-[8px] bg-accent-soft px-3 py-2 text-sm text-accent">
                {error}
              </p>
            )}

            <div className="mt-4 flex justify-end border-t border-border pt-4">
              <button
                type="button"
                onClick={handleNext}
                disabled={isSaving}
                className={`min-h-11 border-2 border-accent bg-accent px-5 font-hand text-[16px] font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60 ${SKETCH_RADIUS}`}
              >
                {isSaving ? "Enregistrement…" : isLast ? "Enregistrer les livres" : "Suivant"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
