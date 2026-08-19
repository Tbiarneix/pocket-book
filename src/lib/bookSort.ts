import type { ExpandedBookRecord } from "./types";

/**
 * Groups books by série (alphabetically), tomes within a série in reading
 * order; standalone books are grouped under their own title instead. Used
 * everywhere a library — mine or a Communauté member's — is listed, so the
 * two stay visually consistent.
 */
export function sortBooksForDisplay(books: ExpandedBookRecord[]): ExpandedBookRecord[] {
  return [...books].sort((a, b) => {
    const groupA = a.expand?.serie?.name ?? a.title;
    const groupB = b.expand?.serie?.name ?? b.title;
    const groupCompare = groupA.localeCompare(groupB, "fr", { sensitivity: "base" });
    if (groupCompare !== 0) return groupCompare;
    if (a.tome !== b.tome) return (a.tome ?? 0) - (b.tome ?? 0);
    return a.title.localeCompare(b.title, "fr", { sensitivity: "base" });
  });
}
