"use client";

import { useId, useState } from "react";

interface Option {
  id: string;
  name: string;
}

const fieldClasses =
  "min-h-11 rounded-[8px] border border-border-field bg-surface px-3 text-sm text-foreground";

export function SelectWithCreate({
  label,
  value,
  options,
  onChange,
  onCreate,
  allowEmpty = true,
}: {
  label: string;
  value: string;
  options: Option[];
  onChange: (id: string) => void;
  onCreate: (name: string) => Promise<Option>;
  allowEmpty?: boolean;
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectId = useId();
  const newNameId = useId();

  async function handleCreate() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const created = await onCreate(trimmed);
      onChange(created.id);
      setNewName("");
      setIsCreating(false);
    } catch {
      setError("La création a échoué.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={selectId} className="text-[13.5px] font-semibold text-foreground">
        {label}
      </label>

      {!isCreating ? (
        <div className="flex gap-2">
          <select
            id={selectId}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className={`w-full ${fieldClasses}`}
          >
            {allowEmpty && <option value="">—</option>}
            {options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="min-h-11 shrink-0 rounded-[8px] border border-border-strong px-3.5 text-sm font-semibold text-foreground hover:bg-surface-muted"
          >
            Nouveau
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <label htmlFor={newNameId} className="sr-only">
            Nom pour {label}
          </label>
          <input
            id={newNameId}
            type="text"
            autoFocus
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            placeholder={`Nouveau : ${label.toLowerCase()}`}
            className={`w-full ${fieldClasses}`}
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={isSubmitting || !newName.trim()}
            className="min-h-11 shrink-0 rounded-[8px] bg-accent px-3.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
          >
            {isSubmitting ? "…" : "Créer"}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsCreating(false);
              setNewName("");
              setError(null);
            }}
            className="min-h-11 shrink-0 rounded-[8px] border border-border-strong px-3.5 text-sm font-semibold text-foreground hover:bg-surface-muted"
          >
            Annuler
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-accent">
          {error}
        </p>
      )}
    </div>
  );
}
