import type { GenreRecord } from "./types";

export interface GoogleBookResult {
  id: string;
  title: string;
  authors: string[];
  publishedDate: string;
  description: string;
  categories: string[];
  thumbnail: string;
}

export async function searchGoogleBooks({
  query,
  author,
}: {
  query: string;
  author: string;
}): Promise<GoogleBookResult[]> {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (author) params.set("author", author);

  const response = await fetch(`/api/books/search?${params}`);
  if (!response.ok) throw new Error("La recherche a échoué.");

  const data: { results: GoogleBookResult[] } = await response.json();
  return data.results;
}

/**
 * Google Books descriptions carry light HTML (<p>, <br>, <b>...). The app's
 * résumé field is rendered as Markdown, so raw tags would show up literally
 * — converted to line breaks and stripped via the DOM instead of a regex,
 * which also takes care of entity-decoding (&amp;, &#39;...) for free.
 */
export function htmlDescriptionToText(html: string): string {
  if (!html) return "";
  const withBreaks = html.replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>/gi, "\n\n");
  const div = document.createElement("div");
  div.innerHTML = withBreaks;
  return (div.textContent ?? "").trim();
}

/** Best-effort match against the app's existing (French) genre list — never
 * creates a new genre, so a miss just leaves the field for manual entry. */
export function matchGenre(
  categories: string[],
  genres: GenreRecord[]
): GenreRecord | undefined {
  const haystack = categories.join(" / ").toLowerCase();
  if (!haystack) return undefined;
  return genres.find((genre) => haystack.includes(genre.name.toLowerCase()));
}
