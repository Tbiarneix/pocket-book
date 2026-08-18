"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { SKETCH_RADIUS } from "@/lib/sketch";

export function ReturnBookModal({
  bookTitle,
  loanedTo,
  onConfirm,
  onClose,
}: {
  bookTitle: string;
  loanedTo: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setIsSubmitting(true);
    setError(null);
    try {
      await onConfirm();
    } catch {
      setError("La récupération a échoué. Réessaie.");
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
        aria-label="Récupérer un livre prêté"
        className={`relative flex w-full max-w-sm flex-col border-2 border-border-strong bg-surface p-5 ${SKETCH_RADIUS}`}
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-hand text-[20px] text-foreground">Confirmer le retour</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="shrink-0 p-1 text-muted hover:text-foreground"
          >
            <X aria-hidden="true" width={20} height={20} strokeWidth={2} />
          </button>
        </div>

        <p className="mt-3 font-hand text-[16px] text-foreground">
          « {bookTitle} » te revient de la part de {loanedTo} ?
        </p>

        {error && (
          <p role="alert" className="mt-2 text-sm text-accent">
            {error}
          </p>
        )}

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className={`min-h-11 border-2 border-accent bg-accent px-4 font-hand text-[15px] font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60 ${SKETCH_RADIUS}`}
          >
            {isSubmitting ? "Enregistrement…" : "Confirmer"}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className={`min-h-11 border-2 border-border-strong bg-background px-4 font-hand text-[15px] text-foreground hover:bg-surface-muted disabled:opacity-60 ${SKETCH_RADIUS}`}
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
