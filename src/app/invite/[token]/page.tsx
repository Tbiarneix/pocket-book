"use client";

import { use, useEffect, useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { SKETCH_OUTLINE, SKETCH_RADIUS, SKETCH_UNDERLINE } from "@/lib/sketch";

type InviteStatus =
  | { state: "loading" }
  | { state: "invalid"; reason: string }
  | { state: "valid"; inviterName: string };

function invalidMessage(reason: string): string {
  switch (reason) {
    case "used":
      return "Cette invitation a déjà été utilisée.";
    case "expired":
      return "Cette invitation a expiré. Demande un nouveau lien à la personne qui t'a invité·e.";
    default:
      return "Ce lien d'invitation n'existe pas.";
  }
}

export default function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const { login } = useAuth();
  const router = useRouter();

  const [status, setStatus] = useState<InviteStatus>({ state: "loading" });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nameId = useId();
  const emailId = useId();
  const passwordId = useId();
  const passwordConfirmId = useId();

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/invites/${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.valid) {
          setStatus({ state: "valid", inviterName: data.inviterName ?? "" });
        } else {
          setStatus({ state: "invalid", reason: data.reason ?? "not_found" });
        }
      })
      .catch(() => {
        if (!cancelled) setStatus({ state: "invalid", reason: "not_found" });
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== passwordConfirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/invites/${token}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "La création du compte a échoué.");
        setIsSubmitting(false);
        return;
      }

      await login(email, password);
      router.replace("/library");
    } catch {
      setError("Une erreur inattendue est survenue.");
      setIsSubmitting(false);
    }
  }

  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center px-4">
      <div
        className={`w-full max-w-sm border-2 border-border-strong bg-surface p-8 rotate-[-0.3deg] ${SKETCH_RADIUS} ${SKETCH_OUTLINE}`}
      >
        <h1 className={`font-hand text-[26px] leading-tight text-foreground ${SKETCH_UNDERLINE}`}>
          La Bibliothèque de Swann’Oa
        </h1>

        {status.state === "loading" && (
          <p className="mt-6 font-hand text-[17px] text-muted">Vérification de l’invitation…</p>
        )}

        {status.state === "invalid" && (
          <p role="alert" className="mt-6 rounded-[8px] bg-accent-soft px-3 py-2 text-sm text-accent">
            {invalidMessage(status.reason)}
          </p>
        )}

        {status.state === "valid" && (
          <>
            <p className="mt-6 font-hand text-[17px] text-muted">
              {status.inviterName
                ? `${status.inviterName} t’invite à rejoindre la bibliothèque.`
                : "Tu as été invité·e à rejoindre la bibliothèque."}{" "}
              Crée ton compte pour continuer.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4" noValidate>
              <div className="flex flex-col gap-1.5">
                <label htmlFor={nameId} className="font-hand text-[15px] text-foreground">
                  Prénom
                </label>
                <input
                  id={nameId}
                  type="text"
                  autoComplete="name"
                  required
                  autoFocus
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="min-h-11 rounded-[8px] border-2 border-border-field bg-surface px-3 font-hand text-base text-foreground"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor={emailId} className="font-hand text-[15px] text-foreground">
                  Adresse e-mail
                </label>
                <input
                  id={emailId}
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="min-h-11 rounded-[8px] border-2 border-border-field bg-surface px-3 font-hand text-base text-foreground"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor={passwordId} className="font-hand text-[15px] text-foreground">
                  Mot de passe
                </label>
                <input
                  id={passwordId}
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="min-h-11 rounded-[8px] border-2 border-border-field bg-surface px-3 font-hand text-base text-foreground"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor={passwordConfirmId} className="font-hand text-[15px] text-foreground">
                  Confirmer le mot de passe
                </label>
                <input
                  id={passwordConfirmId}
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={passwordConfirm}
                  onChange={(event) => setPasswordConfirm(event.target.value)}
                  className="min-h-11 rounded-[8px] border-2 border-border-field bg-surface px-3 font-hand text-base text-foreground"
                />
              </div>

              {error && (
                <p role="alert" className="rounded-[8px] bg-accent-soft px-3 py-2 text-sm text-accent">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`mt-1 min-h-11 border-2 border-accent bg-accent px-4 font-hand text-[17px] font-semibold text-accent-foreground transition-opacity rotate-[0.3deg] hover:opacity-90 disabled:opacity-60 ${SKETCH_RADIUS}`}
              >
                {isSubmitting ? "Création du compte…" : "Créer mon compte"}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
