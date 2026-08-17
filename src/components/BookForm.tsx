"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Search } from "lucide-react";
import {
  createAuthor,
  createGenre,
  createSeries,
  listReferenceData,
} from "@/lib/data";
import type { BookInput } from "@/lib/data";
import type {
  AuthorRecord,
  ExpandedBookRecord,
  GenreRecord,
  SeriesRecord,
  StatusRecord,
} from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { htmlDescriptionToText, matchGenre, type GoogleBookResult } from "@/lib/googleBooks";
import { SelectWithCreate } from "./SelectWithCreate";
import { MarkdownTextarea } from "./MarkdownTextarea";
import { BookSearchModal } from "./BookSearchModal";
import { AddBooksWizard } from "./AddBooksWizard";
import { SKETCH_RADIUS } from "@/lib/sketch";

const fieldClasses =
  "min-h-11 rounded-[8px] border-2 border-border-field bg-surface px-3 font-hand text-base text-foreground";
const labelClasses = "font-hand text-[16px] text-foreground";

export interface ReferenceData {
  authors: AuthorRecord[];
  series: SeriesRecord[];
  genres: GenreRecord[];
  statuses: StatusRecord[];
}

export function BookForm({
  initialBook,
  onSubmit,
  submitLabel,
}: {
  initialBook?: ExpandedBookRecord;
  onSubmit: (input: BookInput) => Promise<void>;
  submitLabel: string;
}) {
  const router = useRouter();
  const { user } = useAuth();

  const [reference, setReference] = useState<ReferenceData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [wizardResults, setWizardResults] = useState<GoogleBookResult[] | null>(null);

  const [title, setTitle] = useState(initialBook?.title ?? "");
  const [coverUrl, setCoverUrl] = useState(initialBook?.cover_url ?? "");
  const [summary, setSummary] = useState(initialBook?.summary ?? "");
  const [opinion, setOpinion] = useState(initialBook?.opinion ?? "");
  const [author, setAuthor] = useState(initialBook?.author ?? "");
  const [serie, setSerie] = useState(initialBook?.serie ?? "");
  const [tome, setTome] = useState(
    initialBook?.tome !== undefined && initialBook?.tome !== null
      ? String(initialBook.tome)
      : ""
  );
  const [genre, setGenre] = useState(initialBook?.genre ?? "");
  const [subgenres, setSubgenres] = useState<string[]>(
    initialBook?.subgenres ?? []
  );
  const [status, setStatus] = useState(initialBook?.status ?? "");
  const [rating, setRating] = useState(
    initialBook?.rating !== undefined && initialBook?.rating !== null
      ? String(initialBook.rating)
      : ""
  );
  const [finished, setFinished] = useState(
    initialBook?.finished ? initialBook.finished.slice(0, 10) : ""
  );

  const titleId = useId();
  const tomeId = useId();
  const coverId = useId();
  const summaryId = useId();
  const opinionId = useId();
  const statusId = useId();
  const ratingId = useId();
  const finishedId = useId();
  const subgenresId = useId();

  useEffect(() => {
    let cancelled = false;
    listReferenceData().then((data) => {
      if (!cancelled) setReference(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) {
      setError("Le titre est obligatoire.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        title: title.trim(),
        cover_url: coverUrl.trim(),
        summary,
        opinion,
        author,
        serie,
        tome: tome === "" ? null : Number(tome),
        genre,
        subgenres,
        rating: rating === "" ? null : Number(rating),
        status,
        finished: finished ? new Date(finished).toISOString() : "",
      });
    } catch {
      setError("L'enregistrement a échoué. Réessaie.");
      setIsSubmitting(false);
    }
  }

  async function resolveAuthorId(name: string): Promise<string> {
    const existing = reference?.authors.find(
      (a) => a.name.toLowerCase() === name.toLowerCase()
    );
    if (existing) return existing.id;
    const created = await createAuthor(name);
    setReference((prev) => (prev ? { ...prev, authors: [...prev.authors, created] } : prev));
    return created.id;
  }

  // A single pick fills in the form on screen directly. Several picks (e.g.
  // from a series or author search) open the step-by-step wizard instead,
  // so each one gets added explicitly rather than silently in the
  // background.
  async function handleSearchConfirm(selected: GoogleBookResult[]) {
    setShowSearch(false);
    if (selected.length === 0) return;

    if (selected.length > 1) {
      setWizardResults(selected);
      return;
    }

    const [result] = selected;
    setTitle(result.title);
    setCoverUrl(result.thumbnail);
    setSummary(htmlDescriptionToText(result.description));
    if (result.authors[0]) {
      setAuthor(await resolveAuthorId(result.authors[0]));
    }
    if (reference) {
      const genreMatch = matchGenre(result.categories, reference.genres);
      if (genreMatch) setGenre(genreMatch.id);
    }
  }

  if (!reference) {
    return (
      <p role="status" className="text-muted">
        Chargement du formulaire…
      </p>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
        <div>
          <button
            type="button"
            onClick={() => setShowSearch(true)}
            className={`flex min-h-10 items-center gap-1.5 border-2 border-border-strong bg-background px-3.5 font-hand text-[15px] text-foreground hover:bg-surface-muted ${SKETCH_RADIUS}`}
          >
            <Search aria-hidden="true" width={15} height={15} strokeWidth={2} />
            Rechercher un livre
          </button>
        </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={titleId} className={labelClasses}>
          Titre <span aria-hidden="true" className="text-accent">*</span>
          <span className="sr-only"> (obligatoire)</span>
        </label>
        <input
          id={titleId}
          type="text"
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
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
          value={coverUrl}
          onChange={(event) => setCoverUrl(event.target.value)}
          placeholder="https://…"
          className={fieldClasses}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <SelectWithCreate
          label="Auteur·rice"
          value={author}
          options={reference.authors}
          onChange={setAuthor}
          onCreate={async (name) => {
            const created = await createAuthor(name);
            setReference((prev) =>
              prev ? { ...prev, authors: [...prev.authors, created] } : prev
            );
            return created;
          }}
        />

        <div className="flex gap-3">
          <div className="flex-1">
            <SelectWithCreate
              label="Série"
              value={serie}
              options={reference.series}
              onChange={setSerie}
              onCreate={async (name) => {
                const created = await createSeries(name);
                setReference((prev) =>
                  prev ? { ...prev, series: [...prev.series, created] } : prev
                );
                return created;
              }}
            />
          </div>
          <div className="flex w-20 shrink-0 flex-col gap-1.5">
            <label htmlFor={tomeId} className={labelClasses}>
              Tome
            </label>
            <input
              id={tomeId}
              type="number"
              min={1}
              step={1}
              value={tome}
              onChange={(event) => setTome(event.target.value)}
              className={`${fieldClasses} font-mono`}
            />
          </div>
        </div>

        <SelectWithCreate
          label="Genre"
          value={genre}
          options={reference.genres}
          onChange={setGenre}
          onCreate={async (name) => {
            const created = await createGenre(name);
            setReference((prev) =>
              prev ? { ...prev, genres: [...prev.genres, created] } : prev
            );
            return created;
          }}
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor={statusId} className={labelClasses}>
            Statut
          </label>
          <select
            id={statusId}
            value={status}
            onChange={(event) => setStatus(event.target.value)}
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

      <fieldset className="flex flex-col gap-2">
        <legend className={labelClasses} id={`${subgenresId}-legend`}>
          Sous-genres
        </legend>
        <div className="flex flex-wrap gap-2" role="group" aria-labelledby={`${subgenresId}-legend`}>
          {reference.genres.map((option) => {
            const checkboxId = `${subgenresId}-${option.id}`;
            const checked = subgenres.includes(option.id);
            return (
              <label
                key={option.id}
                htmlFor={checkboxId}
                className={`flex min-h-9 items-center gap-1.5 border-2 border-border-field bg-surface px-3 font-hand text-base text-foreground ${SKETCH_RADIUS}`}
              >
                <input
                  id={checkboxId}
                  type="checkbox"
                  checked={checked}
                  onChange={(event) => {
                    setSubgenres((prev) =>
                      event.target.checked
                        ? [...prev, option.id]
                        : prev.filter((id) => id !== option.id)
                    );
                  }}
                />
                {option.name}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={ratingId} className={labelClasses}>
            Note (0 à 10)
          </label>
          <input
            id={ratingId}
            type="number"
            min={0}
            max={10}
            step={1}
            value={rating}
            onChange={(event) => setRating(event.target.value)}
            className={`${fieldClasses} font-mono`}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={finishedId} className={labelClasses}>
            Date de fin de lecture
          </label>
          <div className="relative">
            <CalendarDays
              aria-hidden="true"
              width={14}
              height={14}
              strokeWidth={2}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              id={finishedId}
              type="date"
              value={finished}
              onChange={(event) => setFinished(event.target.value)}
              className={`${fieldClasses} w-full pl-9`}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={summaryId} className={labelClasses}>
          Résumé
        </label>
        <MarkdownTextarea id={summaryId} value={summary} onChange={setSummary} rows={4} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={opinionId} className={labelClasses}>
          Mon avis
        </label>
        <MarkdownTextarea id={opinionId} value={opinion} onChange={setOpinion} rows={4} />
      </div>

      {error && (
        <p role="alert" className="rounded-[8px] bg-accent-soft px-3 py-2 text-sm text-accent">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`min-h-11 border-2 border-accent bg-accent px-5 font-hand text-[17px] font-semibold text-accent-foreground rotate-[-0.3deg] hover:opacity-90 disabled:opacity-60 ${SKETCH_RADIUS}`}
        >
          {isSubmitting ? "Enregistrement…" : submitLabel}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className={`min-h-11 border-2 border-border-strong bg-background px-5 font-hand text-[17px] text-foreground hover:bg-surface-muted ${SKETCH_RADIUS}`}
        >
          Annuler
        </button>
      </div>
      </form>

      {showSearch && (
        <BookSearchModal
          initialQuery={title}
          onConfirm={handleSearchConfirm}
          onClose={() => setShowSearch(false)}
        />
      )}

      {wizardResults && user && (
        <AddBooksWizard
          results={wizardResults}
          reference={reference}
          onReferenceChange={(updater) => setReference((prev) => (prev ? updater(prev) : prev))}
          userId={user.id}
          onClose={() => setWizardResults(null)}
        />
      )}
    </>
  );
}
