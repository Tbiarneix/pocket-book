"use client";

import { useId, useRef } from "react";
import { SKETCH_RADIUS } from "@/lib/sketch";

function wrapSelection(
  textarea: HTMLTextAreaElement,
  value: string,
  onChange: (next: string) => void,
  prefix: string,
  suffix: string = prefix
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = value.slice(start, end);
  const next = value.slice(0, start) + prefix + selected + suffix + value.slice(end);
  onChange(next);
  requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(start + prefix.length, end + prefix.length);
  });
}

function insertBulletList(
  textarea: HTMLTextAreaElement,
  value: string,
  onChange: (next: string) => void
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = value.slice(start, end) || "Élément";
  const lines = selected
    .split("\n")
    .map((line) => (line.startsWith("- ") ? line : `- ${line}`))
    .join("\n");
  const next = value.slice(0, start) + lines + value.slice(end);
  onChange(next);
  requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(start, start + lines.length);
  });
}

const TOOLBAR_BUTTON_CLASSES =
  "min-h-7 min-w-7 border border-border-field bg-background px-2 font-hand text-[13px] text-foreground hover:bg-surface-muted";

/**
 * Textarea for `summary`/`opinion`-style fields: content is stored as
 * Markdown (rendered back via MarkdownContent on the detail page), and this
 * toolbar wraps the current selection with the matching syntax instead of
 * requiring visitors to type it by hand.
 */
export function MarkdownTextarea({
  id,
  value,
  onChange,
  rows = 4,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const toolbarId = useId();

  return (
    <div className="flex flex-col gap-1.5">
      <div
        role="toolbar"
        aria-controls={id}
        aria-label="Mise en forme"
        className="flex gap-1.5"
        id={toolbarId}
      >
        <button
          type="button"
          onClick={() => ref.current && wrapSelection(ref.current, value, onChange, "**")}
          className={`${TOOLBAR_BUTTON_CLASSES} font-bold ${SKETCH_RADIUS}`}
        >
          Gras
        </button>
        <button
          type="button"
          onClick={() => ref.current && wrapSelection(ref.current, value, onChange, "*")}
          className={`${TOOLBAR_BUTTON_CLASSES} italic ${SKETCH_RADIUS}`}
        >
          Italique
        </button>
        <button
          type="button"
          onClick={() => ref.current && insertBulletList(ref.current, value, onChange)}
          className={`${TOOLBAR_BUTTON_CLASSES} ${SKETCH_RADIUS}`}
        >
          Liste
        </button>
      </div>
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-[8px] border-2 border-border-field bg-surface px-3 py-2 font-hand text-[17px] leading-[1.7] text-foreground"
      />
      <p className="font-hand text-[13px] text-muted">
        Mise en forme : **gras**, *italique*, tirets pour une liste, ligne vide pour un nouveau
        paragraphe.
      </p>
    </div>
  );
}
