"use client";

import { useSyncExternalStore } from "react";
import { SKETCH_RADIUS } from "@/lib/sketch";

type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

// Small local pub/sub: localStorage's own "storage" event only fires in
// *other* tabs, never the one that called setItem, so toggling here
// wouldn't otherwise notify this component's own subscription.
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot(): boolean {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light") return false;
  if (stored === "dark") return true;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function getServerSnapshot(): boolean {
  return false;
}

function setTheme(theme: Theme) {
  window.localStorage.setItem(STORAGE_KEY, theme);
  document.documentElement.dataset.theme = theme;
  for (const listener of listeners) listener();
}

/**
 * Explicit light/dark switch in the header. Defaults to following the
 * system preference until the visitor picks a side — see the inline
 * script in layout.tsx that applies any stored choice before first paint,
 * to avoid a flash.
 */
export function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-pressed={isDark}
      aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
      className={`flex h-9 w-9 shrink-0 items-center justify-center border-2 border-border-strong bg-background text-[15px] text-foreground rotate-[-0.3deg] hover:bg-surface-muted ${SKETCH_RADIUS}`}
    >
      <span aria-hidden="true">{isDark ? "☾" : "☀"}</span>
    </button>
  );
}
