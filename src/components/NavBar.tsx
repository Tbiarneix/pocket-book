"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const NAV_LINKS = [
  { href: "/library", label: "Bibliothèque" },
  { href: "/library/new", label: "Ajouter" },
  { href: "/stats", label: "Statistiques" },
];

export function NavBar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <header className="border-b border-border bg-surface">
      <nav
        aria-label="Navigation principale"
        className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-2.5"
      >
        <Link href="/library" className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-accent bg-accent-soft"
          >
            <BookOpen width={15} height={15} strokeWidth={2} className="text-accent" />
          </span>
          <span className="font-serif text-base font-semibold text-foreground">
            Journal de lecture
          </span>
        </Link>

        <ul className="flex items-center gap-0.5 rounded-[8px] bg-surface-muted p-0.5">
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === "/library" ? pathname === "/library" : pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`inline-flex min-h-9 items-center rounded-[6px] px-3 text-[13px] font-semibold transition-colors ${
                    isActive ? "bg-accent-soft text-accent" : "text-muted hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-3 text-[13px]">
          {user && (
            <span className="text-muted">
              <strong className="font-semibold text-foreground">{user.name || user.email}</strong>
            </span>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="min-h-9 rounded-[8px] border border-border-strong px-3 font-semibold text-foreground hover:bg-surface-muted"
          >
            Se déconnecter
          </button>
        </div>
      </nav>
    </header>
  );
}
