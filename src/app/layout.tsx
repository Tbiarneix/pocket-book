import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Journal de lecture",
  description: "Suivi personnel de lecture : livres, personnages et arcs narratifs.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className="h-full antialiased">
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
          href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;500;600;700&family=Public+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background font-sans text-foreground">
        <a href="#main-content" className="skip-link">
          Aller au contenu principal
        </a>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
