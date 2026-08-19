"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { SKETCH_RADIUS, SKETCH_UNDERLINE } from "@/lib/sketch";
import { ThemeToggle } from "./ThemeToggle";

const NAV_LINKS = [
  { href: "/library", label: "Bibliothèque" },
  { href: "/library/new", label: "Ajouter" },
  { href: "/community", label: "Communauté" },
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
    <header className="hidden border-b-2 border-border-strong bg-surface sm:block">
      <nav
        aria-label="Navigation principale"
        className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-5 py-3"
      >
        <Link href="/library" className="font-hand text-[22px] text-foreground">
          La Bibliothèque de Swann’Oa
        </Link>

        <ul className="flex items-center gap-5">
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === "/library" ? pathname === "/library" : pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`font-hand text-[17px] ${
                    isActive ? `font-semibold text-foreground ${SKETCH_UNDERLINE}` : "text-muted hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="flex items-center gap-3 font-hand text-[15px]">
            {user && <span className="text-muted">{user.name || user.email}</span>}
            <button
              type="button"
              onClick={handleLogout}
              className={`min-h-9 border-2 border-border-strong bg-background px-3.5 font-semibold text-foreground hover:bg-surface-muted ${SKETCH_RADIUS}`}
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
