import { RequireAuth } from "@/components/RequireAuth";
import { NavBar } from "@/components/NavBar";
import { MobileNav } from "@/components/MobileNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <div className="flex min-h-screen flex-col">
        <NavBar />
        <main
          id="main-content"
          className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24 pt-8 sm:pb-8"
        >
          {children}
        </main>
        <MobileNav />
      </div>
    </RequireAuth>
  );
}
