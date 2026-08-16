"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const { user, isLoading, login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailId = useId();
  const passwordId = useId();
  const errorId = useId();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/library");
    }
  }, [isLoading, user, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      router.replace("/library");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur inattendue est survenue."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main
      id="main-content"
      className="flex min-h-screen items-center justify-center bg-background px-4"
    >
      <div className="w-full max-w-sm rounded-[10px] border border-border bg-surface p-8 shadow-sm">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-accent bg-accent-soft"
          >
            <BookOpen width={18} height={18} strokeWidth={1.8} className="text-accent" />
          </span>
          <h1 className="font-serif text-[19px] font-semibold text-foreground">
            Journal de lecture
          </h1>
        </div>

        <div className="mt-5 flex items-center gap-2" aria-hidden="true">
          <span className="h-px flex-1 bg-border" />
          <span className="text-[9px] text-accent">◆</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <p className="mt-5 text-[13px] text-muted">
          Connecte-toi pour accéder à ta bibliothèque.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <label htmlFor={emailId} className="text-[13px] font-semibold text-foreground">
              Adresse e-mail
            </label>
            <input
              id={emailId}
              name="email"
              type="email"
              autoComplete="email"
              required
              autoFocus
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="min-h-11 rounded-[8px] border border-border-field bg-surface px-3 text-sm text-foreground"
              aria-describedby={error ? errorId : undefined}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={passwordId} className="text-[13px] font-semibold text-foreground">
              Mot de passe
            </label>
            <input
              id={passwordId}
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="min-h-11 rounded-[8px] border border-border-field bg-surface px-3 text-sm text-foreground"
              aria-describedby={error ? errorId : undefined}
            />
          </div>

          <div role="alert" aria-live="polite" id={errorId}>
            {error && (
              <p className="rounded-[8px] bg-accent-soft px-3 py-2 text-sm text-accent">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 min-h-11 rounded-[8px] bg-accent px-4 font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {isSubmitting ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    </main>
  );
}
