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

// Markers that only ever appear in this specific corruption pattern — real
// French/English prose never contains them, so their presence is a safe
// signal that repairMojibake should run.
const MOJIBAKE_MARKERS = /A\(c\)|A\(R\)|A\]|A\[|A-|a \(TM\)|A0\/00/;

const MOJIBAKE_TOKENS: [string, string][] = [
  ["a (TM)", "’"],
  ["A0/00", "É"],
  ["A(c)", "é"],
  ["A(R)", "î"],
  ["A]", "è"],
  ["A[", "â"],
  ["A-", "œ"],
  ["Aa", "ê"],
  ["Ane", "ône"],
];

/**
 * Some Google Books search-result entries (mostly bare-bones print-catalog
 * records, as opposed to proper ebook editions) already carry corrupted
 * French text at the source: their description went through a UTF-8 →
 * Windows-1252 misread, and the resulting Latin-1-supplement characters
 * (©, ®, NBSP, …) were then transliterated to ASCII approximations —
 * "é" ends up as "A(c)", "î" as "A(R)", "à" as a bare "A", etc. Verified
 * against real corrupted/clean sibling entries for the same book.
 * Confirmed to round-trip exactly for the samples this was built from —
 * only ever called on text that matches MOJIBAKE_MARKERS.
 */
export function repairMojibake(text: string): string {
  if (!text || !MOJIBAKE_MARKERS.test(text)) return text;

  let result = text;
  for (const [bad, good] of MOJIBAKE_TOKENS) {
    result = result.split(bad).join(good);
  }
  // "oà" as its own word is always the corrupted "où"
  result = result.replace(/\boA\b/g, "où");
  // a word made only of lowercase letters plus a trailing capital "A" is a
  // glued/standalone corrupted à (e.g. "lA" -> "là", "delA" -> "delà")
  result = result.replace(
    /\b([a-zàâîôûüéèêëïöçœ]*)A\b/g,
    (_match, prefix: string) => `${prefix}à`
  );
  result = result.replace(/ +([.,;:!?])/g, "$1");
  // a lone "à" standing in for its own sentence (preceded by end
  // punctuation or start of text, followed by a capitalized word) is a
  // stray paragraph-break artifact, not the real word "à"
  result = result.replace(/(^|[.!?])\s*(à\s+)+(?=[A-ZÉÈÀ])/g, "$1 ");
  result = result.replace(/ {2,}/g, " ");
  return result.trim();
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
