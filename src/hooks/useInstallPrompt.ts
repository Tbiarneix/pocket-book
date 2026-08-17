"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function subscribeStandalone(callback: () => void) {
  const media = window.matchMedia("(display-mode: standalone)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

// Never changes after mount, but useSyncExternalStore still needs a
// subscribe function — a no-op unsubscribe is fine since getSnapshot's
// result can't change without a full page reload anyway.
function subscribeIos() {
  return () => {};
}

function getIosSnapshot() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

/**
 * Wraps the Android/desktop-Chrome `beforeinstallprompt` flow and adds an
 * iOS branch (Safari never fires that event — there's no native prompt to
 * trigger, only the manual Share > "Sur l'écran d'accueil" path). Callers
 * show their own install button only while `canInstall` is true, and show
 * install instructions instead of calling `promptInstall()` when `isIos`.
 *
 * Reads browser-only APIs (matchMedia, navigator.standalone/userAgent) via
 * useSyncExternalStore rather than useEffect+useState, so the safe
 * server-side default (already installed, not iOS — both hide the button)
 * is what SSR renders, and the real value takes over post-hydration
 * without a synchronous setState-in-effect.
 */
export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const installed = useSyncExternalStore(subscribeStandalone, isStandalone, () => true);
  const ios = useSyncExternalStore(subscribeIos, getIosSnapshot, () => false);

  useEffect(() => {
    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    }
    function handleAppInstalled() {
      setDeferredPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  return {
    canInstall: !installed && (deferredPrompt !== null || ios),
    isIos: ios,
    hasNativePrompt: deferredPrompt !== null,
    promptInstall,
  };
}
