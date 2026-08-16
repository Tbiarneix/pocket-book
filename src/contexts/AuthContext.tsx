"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { ClientResponseError } from "pocketbase";
import { getPocketBase } from "@/lib/pocketbase";
import type { UserRecord } from "@/lib/types";

interface AuthContextValue {
  user: UserRecord | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// PocketBase's authStore is an external store (backed by localStorage), so we
// read it with useSyncExternalStore rather than mirroring it into state via
// an effect. This also keeps the server-rendered pass (no access to
// localStorage) and the client hydration pass consistent, with React
// resyncing to the real value automatically once mounted.
//
// LocalAuthStore re-parses localStorage on every `.record`/`.token` access,
// so `.record` returns a new object reference each call — that breaks
// useSyncExternalStore's identity check (React sees a "changing" snapshot on
// every render and bails out with a "Maximum update depth exceeded" loop).
// We cache the derived snapshot and only recompute it when the (string,
// referentially-stable-by-value) token actually changes.
let cachedSnapshotToken = "";
let cachedSnapshot: UserRecord | null = null;

function subscribeToAuthStore(callback: () => void) {
  return getPocketBase().authStore.onChange(callback);
}

function getAuthSnapshot(): UserRecord | null {
  const pb = getPocketBase();
  const token = pb.authStore.token;
  if (token !== cachedSnapshotToken) {
    cachedSnapshotToken = token;
    cachedSnapshot = pb.authStore.isValid ? (pb.authStore.record as unknown as UserRecord) : null;
  }
  return cachedSnapshot;
}

function getServerAuthSnapshot(): UserRecord | null {
  return null;
}

// Small, well-known idiom to know once the client has taken over from SSR,
// without reaching for an effect + setState.
function subscribeOnce() {
  return () => {};
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const user = useSyncExternalStore(
    subscribeToAuthStore,
    getAuthSnapshot,
    getServerAuthSnapshot
  );
  const isHydrated = useSyncExternalStore(
    subscribeOnce,
    () => true,
    () => false
  );

  async function login(email: string, password: string) {
    const pb = getPocketBase();
    try {
      await pb.collection("users").authWithPassword(email, password);
    } catch (error) {
      if (error instanceof ClientResponseError) {
        throw new Error(
          "Impossible de se connecter : e-mail ou mot de passe incorrect."
        );
      }
      throw error;
    }
  }

  function logout() {
    getPocketBase().authStore.clear();
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading: !isHydrated, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
}
