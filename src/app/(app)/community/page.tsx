"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { listBooks, listCommunityUsers } from "@/lib/data";
import type { UserRecord } from "@/lib/types";
import { SKETCH_OUTLINE, SKETCH_RADIUS } from "@/lib/sketch";

interface CommunityMember {
  user: UserRecord;
  bookCount: number;
}

export default function CommunityPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<CommunityMember[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function load() {
      try {
        const users = await listCommunityUsers(user!.id);
        const bookLists = await Promise.all(users.map((u) => listBooks(u.id)));
        if (cancelled) return;
        setMembers(users.map((u, index) => ({ user: u, bookCount: bookLists[index].length })));
      } catch {
        if (!cancelled) setError("Impossible de charger la communauté pour le moment.");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-hand text-[34px] text-foreground">Communauté</h1>

      {error && (
        <p role="alert" className="rounded-[8px] bg-accent-soft px-3 py-2 text-sm text-accent">
          {error}
        </p>
      )}

      {members === null ? (
        <p role="status" className="text-muted">
          Chargement…
        </p>
      ) : members.length === 0 ? (
        <p className="rounded-[14px] border-2 border-dashed border-border-field bg-surface p-8 text-center font-hand text-[17px] text-muted">
          Aucun autre compte pour le moment.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {members.map(({ user: member, bookCount }) => (
            <li key={member.id}>
              <Link
                href={`/community/${member.id}`}
                className={`group flex items-center gap-4 border-2 border-border-strong bg-background p-4 transition-shadow rotate-[-0.3deg] hover:shadow-md ${SKETCH_RADIUS} ${SKETCH_OUTLINE}`}
              >
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-border-strong bg-surface-muted text-muted">
                  <Users aria-hidden="true" width={22} height={22} strokeWidth={2} />
                </span>
                <div>
                  <p className="font-hand text-xl text-foreground">
                    {member.name || member.email}
                  </p>
                  <p className="font-hand text-[15px] text-muted">
                    {bookCount} livre{bookCount > 1 ? "s" : ""}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
