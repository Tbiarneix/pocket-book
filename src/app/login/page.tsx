"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { SKETCH_OUTLINE, SKETCH_RADIUS, SKETCH_UNDERLINE } from "@/lib/sketch";

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
      className="flex min-h-screen items-center justify-center px-4"
    >
      <div
        className={`w-full max-w-sm border-2 border-border-strong bg-surface p-8 rotate-[-0.3deg] ${SKETCH_RADIUS} ${SKETCH_OUTLINE}`}
      >
        <h1 className={`font-hand text-[30px] text-foreground ${SKETCH_UNDERLINE}`}>
          Journal de lecture
        </h1>

        <p className="mt-6 font-hand text-[17px] text-muted">
          Connecte-toi pour accéder à ta bibliothèque.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <label htmlFor={emailId} className="font-hand text-[15px] text-foreground">
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
              className="min-h-11 rounded-[8px] border-2 border-border-field bg-surface px-3 font-hand text-base text-foreground"
              aria-describedby={error ? errorId : undefined}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={passwordId} className="font-hand text-[15px] text-foreground">
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
              className="min-h-11 rounded-[8px] border-2 border-border-field bg-surface px-3 font-hand text-base text-foreground"
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
            className={`mt-1 min-h-11 border-2 border-accent bg-accent px-4 font-hand text-[17px] font-semibold text-accent-foreground transition-opacity rotate-[0.3deg] hover:opacity-90 disabled:opacity-60 ${SKETCH_RADIUS}`}
          >
            {isSubmitting ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    </main>
  );
}
