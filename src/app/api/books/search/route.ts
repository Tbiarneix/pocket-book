import { NextRequest, NextResponse } from "next/server";
import { repairMojibake } from "@/lib/googleBooks";

// Server-only: an anonymous (keyless) Google Books request shares a global
// per-day quota across every caller on the internet, which is often
// already exhausted. GOOGLE_BOOKS_API_KEY (a free Google Cloud API key
// with the Books API enabled) gives this app its own quota instead.
const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;

interface GoogleBooksVolume {
  id: string;
  volumeInfo?: {
    title?: string;
    authors?: string[];
    publishedDate?: string;
    description?: string;
    categories?: string[];
    imageLinks?: { thumbnail?: string; smallThumbnail?: string };
  };
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const author = request.nextUrl.searchParams.get("author")?.trim();

  const queryParts = [];
  if (query) queryParts.push(query);
  if (author) queryParts.push(`inauthor:"${author}"`);
  if (queryParts.length === 0) {
    return NextResponse.json({ results: [] });
  }

  const params = new URLSearchParams({
    q: queryParts.join(" "),
    langRestrict: "fr",
    maxResults: "20",
  });
  if (GOOGLE_BOOKS_API_KEY) params.set("key", GOOGLE_BOOKS_API_KEY);

  const response = await fetch(`https://www.googleapis.com/books/v1/volumes?${params}`);
  if (!response.ok) {
    console.error("Google Books upstream error", response.status, await response.text());
    return NextResponse.json({ results: [], error: "upstream" }, { status: 502 });
  }

  const data: { items?: GoogleBooksVolume[] } = await response.json();

  const results = (data.items ?? [])
    .map((item) => {
      const info = item.volumeInfo ?? {};
      const thumbnail = info.imageLinks?.thumbnail ?? info.imageLinks?.smallThumbnail ?? "";
      return {
        id: item.id,
        title: repairMojibake(info.title ?? ""),
        authors: (info.authors ?? []).map(repairMojibake),
        publishedDate: info.publishedDate ?? "",
        description: repairMojibake(info.description ?? ""),
        categories: info.categories ?? [],
        thumbnail: thumbnail.replace(/^http:/, "https:"),
      };
    })
    .filter((result) => result.title);

  return NextResponse.json({ results });
}
