"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Download, Library, Menu, Plus, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { SKETCH_RADIUS } from "@/lib/sketch";
import { ThemeToggle } from "./ThemeToggle";

const TABS = [
  { href: "/library", label: "Bibliothèque", icon: Library },
  { href: "/library/new", label: "Ajouter", icon: Plus },
  { href: "/stats", label: "Statistiques", icon: BarChart3 },
];

/**
 * Mobile-only bottom tab bar (sm:hidden — NavBar.tsx covers desktop). The
 * fourth tab, "Plus", opens a bottom sheet with the app name, the
 * light/dark switch, and sign-out — the stuff the desktop header fits
 * inline but a narrow screen doesn't have room for.
 */
export function MobileNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  function handleLogout() {
    setIsMoreOpen(false);
    logout();
    router.push("/login");
  }

  return (
    <>
      <nav
        aria-label="Navigation principale"
        className="fixed inset-x-0 bottom-0 z-40 flex border-t-2 border-border-strong bg-surface sm:hidden"
      >
        {TABS.map((tab) => {
          const isActive =
            tab.href === "/library" ? pathname === "/library" : pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 font-hand text-[12px] ${
                isActive ? "text-accent" : "text-muted"
              }`}
            >
              <Icon aria-hidden="true" width={20} height={20} strokeWidth={2} />
              {tab.label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setIsMoreOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={isMoreOpen}
          className="flex flex-1 flex-col items-center gap-1 py-2.5 font-hand text-[12px] text-muted"
        >
          <Menu aria-hidden="true" width={20} height={20} strokeWidth={2} />
          Plus
        </button>
      </nav>

      {isMoreOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={() => setIsMoreOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="absolute inset-x-0 bottom-0 rounded-t-[20px] border-t-2 border-border-strong bg-surface p-5 pb-8"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-hand text-[20px] leading-tight text-foreground">
                La Bibliothèque de Swann’Oa
              </span>
              <button
                type="button"
                onClick={() => setIsMoreOpen(false)}
                aria-label="Fermer le menu"
                className="shrink-0 p-1 text-muted hover:text-foreground"
              >
                <X aria-hidden="true" width={20} height={20} strokeWidth={2} />
              </button>
            </div>

            {user && (
              <p className="mt-2 font-hand text-[15px] text-muted">{user.name || user.email}</p>
            )}

            <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
              <span className="font-hand text-[16px] text-foreground">Mode clair / sombre</span>
              <ThemeToggle />
            </div>

            <button
              type="button"
              disabled
              className={`mt-4 flex min-h-11 w-full items-center justify-center gap-2 border-2 border-border-strong bg-background px-4 font-hand text-[15px] text-muted disabled:opacity-60 ${SKETCH_RADIUS}`}
            >
              <Download aria-hidden="true" width={16} height={16} strokeWidth={2} />
              Télécharger l’application
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className={`mt-3 flex min-h-11 w-full items-center justify-center border-2 border-accent bg-background px-4 font-hand text-[15px] font-semibold text-accent hover:bg-accent-soft ${SKETCH_RADIUS}`}
            >
              Se déconnecter
            </button>
          </div>
        </div>
      )}
    </>
  );
}
