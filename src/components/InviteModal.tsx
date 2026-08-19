"use client";

import { useEffect, useState } from "react";
import { Check, Copy, RefreshCw, X } from "lucide-react";
import { createInvite, getPendingInvite, revokeInvite } from "@/lib/data";
import type { InviteRecord } from "@/lib/types";
import { SKETCH_RADIUS } from "@/lib/sketch";

export function InviteModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [invite, setInvite] = useState<InviteRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const existing = await getPendingInvite(userId);
        const current = existing ?? (await createInvite(userId));
        if (!cancelled) setInvite(current);
      } catch {
        if (!cancelled) setError("Impossible de générer l’invitation.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  async function handleRegenerate() {
    if (!invite) return;
    setIsRegenerating(true);
    setError(null);
    try {
      await revokeInvite(invite.id);
      const fresh = await createInvite(userId);
      setInvite(fresh);
      setCopied(false);
    } catch {
      setError("Impossible de régénérer l’invitation.");
    } finally {
      setIsRegenerating(false);
    }
  }

  async function handleCopy(link: string) {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Impossible de copier automatiquement — sélectionne et copie le lien manuellement.");
    }
  }

  const link = invite ? `${window.location.origin}/invite/${invite.token}` : "";
  const expiresLabel = invite
    ? new Date(invite.expires_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })
    : "";

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
        aria-label="Inviter quelqu’un"
        className={`relative flex w-full max-w-md flex-col border-2 border-border-strong bg-surface p-5 ${SKETCH_RADIUS}`}
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-hand text-[20px] text-foreground">Inviter</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="shrink-0 p-1 text-muted hover:text-foreground"
          >
            <X aria-hidden="true" width={20} height={20} strokeWidth={2} />
          </button>
        </div>

        {isLoading ? (
          <p className="mt-4 font-hand text-[15px] text-muted">Génération du lien…</p>
        ) : (
          <>
            <p className="mt-3 font-hand text-[15px] text-muted">
              Envoie ce lien à la personne que tu veux inviter — il lui permettra de créer son
              compte. Valable jusqu’au {expiresLabel}, à usage unique.
            </p>

            <div className="mt-3 flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={link}
                onFocus={(event) => event.target.select()}
                className="min-h-11 flex-1 rounded-[8px] border-2 border-border-field bg-background px-3 font-mono text-[13px] text-foreground"
              />
              <button
                type="button"
                onClick={() => handleCopy(link)}
                className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 border-2 border-accent bg-accent px-3.5 font-hand text-[15px] font-semibold text-accent-foreground hover:opacity-90 ${SKETCH_RADIUS}`}
              >
                {copied ? (
                  <Check aria-hidden="true" width={16} height={16} strokeWidth={2} />
                ) : (
                  <Copy aria-hidden="true" width={16} height={16} strokeWidth={2} />
                )}
                {copied ? "Copié" : "Copier"}
              </button>
            </div>

            <button
              type="button"
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="mt-3 inline-flex min-h-9 items-center gap-1.5 self-start font-hand text-[14px] text-muted hover:text-foreground hover:underline disabled:opacity-60"
            >
              <RefreshCw aria-hidden="true" width={13} height={13} strokeWidth={2} />
              {isRegenerating ? "Génération…" : "Générer un nouveau lien (invalide l’actuel)"}
            </button>
          </>
        )}

        {error && (
          <p role="alert" className="mt-3 text-sm text-accent">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
