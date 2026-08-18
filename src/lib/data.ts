import { getPocketBase } from "./pocketbase";
import { COLLECTIONS } from "./types";
import type {
  AuthorRecord,
  BookCharacterRecord,
  BookRecord,
  BookStorylineRecord,
  CharacterRecord,
  ExpandedBookRecord,
  GenreRecord,
  RankingRecord,
  SeriesRecord,
  StatusRecord,
  StorylineRecord,
} from "./types";

const BOOK_EXPAND = "author,serie,genre,subgenres,status";

export async function listBooks(): Promise<ExpandedBookRecord[]> {
  const pb = getPocketBase();
  return pb.collection(COLLECTIONS.books).getFullList<ExpandedBookRecord>({
    expand: BOOK_EXPAND,
    sort: "-created",
  });
}

export async function getBook(id: string): Promise<ExpandedBookRecord> {
  const pb = getPocketBase();
  return pb.collection(COLLECTIONS.books).getOne<ExpandedBookRecord>(id, {
    expand: BOOK_EXPAND,
  });
}

export interface BookInput {
  title: string;
  cover_url: string;
  summary: string;
  opinion: string;
  author: string;
  serie: string;
  tome: number | null;
  genre: string;
  subgenres: string[];
  rating: number | null;
  status: string;
  finished: string;
}

export async function createBook(
  userId: string,
  input: BookInput
): Promise<BookRecord> {
  const pb = getPocketBase();
  return pb.collection(COLLECTIONS.books).create<BookRecord>({
    ...input,
    user: userId,
  });
}

export async function updateBook(
  id: string,
  input: BookInput
): Promise<BookRecord> {
  const pb = getPocketBase();
  return pb.collection(COLLECTIONS.books).update<BookRecord>(id, input);
}

export async function deleteBook(id: string): Promise<void> {
  const pb = getPocketBase();
  await pb.collection(COLLECTIONS.books).delete(id);
}

export async function listAuthors(): Promise<AuthorRecord[]> {
  const pb = getPocketBase();
  return pb
    .collection(COLLECTIONS.authors)
    .getFullList<AuthorRecord>({ sort: "name" });
}

export async function createAuthor(name: string): Promise<AuthorRecord> {
  const pb = getPocketBase();
  return pb.collection(COLLECTIONS.authors).create<AuthorRecord>({ name });
}

export async function listSeries(): Promise<SeriesRecord[]> {
  const pb = getPocketBase();
  return pb
    .collection(COLLECTIONS.series)
    .getFullList<SeriesRecord>({ sort: "name" });
}

export async function createSeries(name: string): Promise<SeriesRecord> {
  const pb = getPocketBase();
  return pb.collection(COLLECTIONS.series).create<SeriesRecord>({ name });
}

export async function listGenres(): Promise<GenreRecord[]> {
  const pb = getPocketBase();
  return pb
    .collection(COLLECTIONS.genres)
    .getFullList<GenreRecord>({ sort: "name" });
}

export async function createGenre(name: string): Promise<GenreRecord> {
  const pb = getPocketBase();
  return pb.collection(COLLECTIONS.genres).create<GenreRecord>({ name });
}

export async function listStatuses(): Promise<StatusRecord[]> {
  const pb = getPocketBase();
  return pb
    .collection(COLLECTIONS.status)
    .getFullList<StatusRecord>({ sort: "created" });
}

export async function listRankings(): Promise<RankingRecord[]> {
  const pb = getPocketBase();
  return pb
    .collection(COLLECTIONS.rankings)
    .getFullList<RankingRecord>({ sort: "rating_min" });
}

export async function listCharacters(): Promise<CharacterRecord[]> {
  const pb = getPocketBase();
  return pb
    .collection(COLLECTIONS.characters)
    .getFullList<CharacterRecord>({ sort: "name" });
}

export async function createCharacter(
  name: string,
  serie: string,
  book: string
): Promise<CharacterRecord> {
  const pb = getPocketBase();
  return pb
    .collection(COLLECTIONS.characters)
    .create<CharacterRecord>({ name, serie, book });
}

export async function listStorylines(): Promise<StorylineRecord[]> {
  const pb = getPocketBase();
  return pb
    .collection(COLLECTIONS.storylines)
    .getFullList<StorylineRecord>({ sort: "name" });
}

export async function createStoryline(
  name: string,
  serie: string,
  book: string
): Promise<StorylineRecord> {
  const pb = getPocketBase();
  return pb
    .collection(COLLECTIONS.storylines)
    .create<StorylineRecord>({ name, serie, book });
}

export async function listBookCharacters(
  bookId: string
): Promise<BookCharacterRecord[]> {
  const pb = getPocketBase();
  return pb
    .collection(COLLECTIONS.booksCharacters)
    .getFullList<BookCharacterRecord>({
      filter: `book = "${bookId}"`,
      expand: "character",
      sort: "-created",
    });
}

export async function addBookCharacter(
  bookId: string,
  characterId: string,
  comment: string
): Promise<BookCharacterRecord> {
  const pb = getPocketBase();
  return pb
    .collection(COLLECTIONS.booksCharacters)
    .create<BookCharacterRecord>({
      book: bookId,
      character: characterId,
      comment,
    });
}

export async function updateBookCharacter(
  id: string,
  comment: string
): Promise<BookCharacterRecord> {
  const pb = getPocketBase();
  return pb
    .collection(COLLECTIONS.booksCharacters)
    .update<BookCharacterRecord>(id, { comment });
}

export async function removeBookCharacter(id: string): Promise<void> {
  const pb = getPocketBase();
  await pb.collection(COLLECTIONS.booksCharacters).delete(id);
}

/**
 * Every storyline comment across every book of a série (not just one tome)
 * — arcs narratifs span the whole série, so the detail page groups these by
 * storyline to show each arc's full history regardless of which tome
 * you're currently viewing. Standalone books (no série) fall back to their
 * own `book` scope instead, so unrelated standalone books never share a
 * pool of arcs the way they would if both just matched an empty `serie`.
 */
export async function listStorylineComments(
  serieId: string,
  bookId: string
): Promise<BookStorylineRecord[]> {
  const pb = getPocketBase();
  const filter = serieId
    ? `storyline.serie = "${serieId}"`
    : `storyline.book = "${bookId}"`;
  return pb.collection(COLLECTIONS.booksStorylines).getFullList<BookStorylineRecord>({
    filter,
    expand: "storyline,book",
    sort: "created",
  });
}

export async function addBookStoryline(
  bookId: string,
  storylineId: string,
  comment: string
): Promise<BookStorylineRecord> {
  const pb = getPocketBase();
  return pb
    .collection(COLLECTIONS.booksStorylines)
    .create<BookStorylineRecord>({
      book: bookId,
      storyline: storylineId,
      comment,
    });
}

export async function updateBookStoryline(
  id: string,
  comment: string
): Promise<BookStorylineRecord> {
  const pb = getPocketBase();
  return pb
    .collection(COLLECTIONS.booksStorylines)
    .update<BookStorylineRecord>(id, { comment });
}

export async function removeBookStoryline(id: string): Promise<void> {
  const pb = getPocketBase();
  await pb.collection(COLLECTIONS.booksStorylines).delete(id);
}

/**
 * Marks `bookStorylineId` as the comment that closes its arc, reopening
 * any previously-closed comment on that same storyline first — only one
 * comment per arc can be the closing one.
 */
export async function closeBookStoryline(
  storylineId: string,
  bookStorylineId: string
): Promise<void> {
  const pb = getPocketBase();
  const previouslyClosed = await pb
    .collection(COLLECTIONS.booksStorylines)
    .getFullList<BookStorylineRecord>({
      filter: `storyline = "${storylineId}" && closed = true`,
    });
  for (const entry of previouslyClosed) {
    if (entry.id !== bookStorylineId) {
      await pb.collection(COLLECTIONS.booksStorylines).update(entry.id, { closed: false });
    }
  }
  await pb.collection(COLLECTIONS.booksStorylines).update(bookStorylineId, { closed: true });
}

export async function reopenBookStoryline(id: string): Promise<void> {
  const pb = getPocketBase();
  await pb.collection(COLLECTIONS.booksStorylines).update(id, { closed: false });
}

/** Fetches every reference collection needed to render filters and forms. */
export async function listReferenceData() {
  const [authors, series, genres, statuses, rankings, characters, storylines] =
    await Promise.all([
      listAuthors(),
      listSeries(),
      listGenres(),
      listStatuses(),
      listRankings(),
      listCharacters(),
      listStorylines(),
    ]);

  return { authors, series, genres, statuses, rankings, characters, storylines };
}
