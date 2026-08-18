"use client";

import { useId, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { SKETCH_RADIUS } from "@/lib/sketch";

export function LoanBookModal({
  bookTitle,
  onConfirm,
  onClose,
}: {
  bookTitle: string;
  onConfirm: (loanedTo: string) => Promise<void>;
  onClose: () => void;
}) {
  const [loanedTo, setLoanedTo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fieldId = useId();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!loanedTo.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await onConfirm(loanedTo.trim());
    } catch {
      setError("Le prêt a échoué. Réessaie.");
      setIsSubmitting(false);
    }
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
        aria-label="Prêter un livre"
        className={`relative flex w-full max-w-sm flex-col border-2 border-border-strong bg-surface p-5 ${SKETCH_RADIUS}`}
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-hand text-[20px] text-foreground">Prêter « {bookTitle} »</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="shrink-0 p-1 text-muted hover:text-foreground"
          >
            <X aria-hidden="true" width={20} height={20} strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor={fieldId} className="font-hand text-[14px] text-muted">
              Prêter à
            </label>
            <input
              id={fieldId}
              type="text"
              value={loanedTo}
              onChange={(event) => setLoanedTo(event.target.value)}
              maxLength={30}
              autoFocus
              placeholder="Charlène…"
              className="min-h-11 w-full rounded-[8px] border-2 border-border-field bg-background px-3 font-hand text-base text-foreground"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-accent">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!loanedTo.trim() || isSubmitting}
            className={`mt-1 min-h-11 self-start border-2 border-accent bg-accent px-4 font-hand text-[15px] font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60 ${SKETCH_RADIUS}`}
          >
            {isSubmitting ? "Enregistrement…" : "Prêter"}
          </button>
        </form>
      </div>
    </div>
  );
}
