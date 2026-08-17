import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/contexts/AuthContext";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import "./globals.css";

export const metadata: Metadata = {
  title: "La Bibliothèque de Swann’Oa",
  description: "Suivi personnel de lecture : livres, personnages et arcs narratifs.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Swann’Oa",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf6ec" },
    { media: "(prefers-color-scheme: dark)", color: "#1b1712" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className="h-full antialiased" suppressHydrationWarning>
      <head>
        {/*
          Loaded as plain <link> tags (not next/font/google) so the fetch
          happens in the visitor's browser at runtime, not during `next
          build` — this environment's build has no route to
          fonts.googleapis.com, but end users' browsers do.
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Pangolin&family=Public+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        {/*
          Applies a previously-chosen light/dark override (see
          ThemeToggle.tsx) before first paint, so switching pages or
          reloading never flashes the system-default theme first.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(function(){try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark"){document.documentElement.dataset.theme=t;}}catch(e){}})();',
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background font-sans text-foreground">
        <a href="#main-content" className="skip-link">
          Aller au contenu principal
        </a>
        <AuthProvider>{children}</AuthProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
