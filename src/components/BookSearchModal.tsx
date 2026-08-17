"use client";

import { useId, useState, type FormEvent } from "react";
import { BookOpen, Search, X } from "lucide-react";
import { searchGoogleBooks, type GoogleBookResult } from "@/lib/googleBooks";
import { SKETCH_RADIUS } from "@/lib/sketch";

const fieldClasses =
  "min-h-11 flex-1 rounded-[8px] border-2 border-border-field bg-background px-3 font-hand text-base text-foreground";

export function BookSearchModal({
  initialQuery,
  onConfirm,
  onClose,
}: {
  initialQuery: string;
  onConfirm: (selected: GoogleBookResult[]) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [author, setAuthor] = useState("");
  const [results, setResults] = useState<GoogleBookResult[] | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queryId = useId();
  const authorId = useId();

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!query.trim() && !author.trim()) return;

    setIsSearching(true);
    setError(null);
    try {
      const found = await searchGoogleBooks({ query: query.trim(), author: author.trim() });
      setResults(found);
      setSelectedIds(new Set());
    } catch {
      setError("La recherche a échoué. Réessaie.");
    } finally {
      setIsSearching(false);
    }
  }

  function toggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleConfirm() {
    if (!results) return;
    const selected = results.filter((result) => selectedIds.has(result.id));
    onConfirm(selected);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-4 py-8 sm:items-center">
      <button
        type="button"
        aria-label="Fermer"
        onClick={onClose}
        className="fixed inset-0 bg-black/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Rechercher un livre"
        className={`relative flex max-h-[85vh] w-full max-w-lg flex-col border-2 border-border-strong bg-surface p-5 ${SKETCH_RADIUS}`}
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-hand text-[20px] text-foreground">Rechercher un livre</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="shrink-0 p-1 text-muted hover:text-foreground"
          >
            <X aria-hidden="true" width={20} height={20} strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSearch} className="mt-4 flex flex-col gap-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor={queryId} className="font-hand text-[14px] text-muted">
              Titre ou série
            </label>
            <input
              id={queryId}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Zodiac Academy…"
              autoFocus
              className={fieldClasses}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor={authorId} className="font-hand text-[14px] text-muted">
              Auteur·rice (optionnel)
            </label>
            <input
              id={authorId}
              type="search"
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
              placeholder="Caroline Peckham…"
              className={fieldClasses}
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className={`mt-1 flex min-h-11 items-center justify-center gap-1.5 self-start border-2 border-accent bg-accent px-4 font-hand text-[15px] font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60 ${SKETCH_RADIUS}`}
          >
            <Search aria-hidden="true" width={16} height={16} strokeWidth={2} />
            {isSearching ? "Recherche…" : "Chercher"}
          </button>
        </form>

        {error && (
          <p role="alert" className="mt-3 text-sm text-accent">
            {error}
          </p>
        )}

        <div className="mt-4 flex-1 overflow-y-auto">
          {results === null && !isSearching && (
            <p className="text-sm text-muted">
              Cherche par titre, par nom de série, et affine avec l’auteur·rice si besoin.
            </p>
          )}
          {results !== null && results.length === 0 && (
            <p className="text-sm text-muted">Aucun résultat.</p>
          )}
          <ul className="flex flex-col gap-2">
            {results?.map((result) => {
              const checked = selectedIds.has(result.id);
              return (
                <li key={result.id}>
                  <label
                    className={`flex w-full cursor-pointer items-start gap-3 rounded-[8px] border-2 p-2 text-left ${
                      checked
                        ? "border-accent bg-accent-soft"
                        : "border-transparent hover:border-border-field hover:bg-surface-muted"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(result.id)}
                      className="mt-1 shrink-0"
                    />
                    {result.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={result.thumbnail}
                        alt=""
                        className="h-20 w-14 shrink-0 rounded-[4px] object-cover"
                      />
                    ) : (
                      <div className="flex h-20 w-14 shrink-0 items-center justify-center rounded-[4px] bg-surface-muted text-muted">
                        <BookOpen aria-hidden="true" width={20} height={20} strokeWidth={2} />
                      </div>
                    )}
                    <div className="flex flex-col gap-0.5">
                      <span className="font-hand text-[16px] text-foreground">{result.title}</span>
                      {result.authors.length > 0 && (
                        <span className="text-sm text-muted">{result.authors.join(", ")}</span>
                      )}
                      {result.publishedDate && (
                        <span className="font-mono text-[11px] text-muted">
                          {result.publishedDate.slice(0, 4)}
                        </span>
                      )}
                    </div>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>

        {results !== null && results.length > 0 && (
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
            <p className="text-sm text-muted">
              {selectedIds.size > 0
                ? `${selectedIds.size} sélectionné${selectedIds.size > 1 ? "s" : ""}`
                : "Coche un ou plusieurs livres"}
            </p>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={selectedIds.size === 0}
              className={`min-h-10 border-2 border-accent bg-accent px-4 font-hand text-[15px] font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-40 ${SKETCH_RADIUS}`}
            >
              Ajouter{selectedIds.size > 0 ? ` (${selectedIds.size})` : ""}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
