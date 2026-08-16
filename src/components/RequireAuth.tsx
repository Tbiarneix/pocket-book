"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Client-side guard for the protected route group.
 *
 * Real data access control is enforced by PocketBase's API rules
 * (`user = @request.auth.id`); this guard only improves the UX by
 * redirecting signed-out visitors to the login page instead of showing
 * empty screens.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-10">
        <p role="status" className="text-muted">
          Chargement…
        </p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
