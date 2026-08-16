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
  name: string
): Promise<CharacterRecord> {
  const pb = getPocketBase();
  return pb
    .collection(COLLECTIONS.characters)
    .create<CharacterRecord>({ name });
}

export async function listStorylines(): Promise<StorylineRecord[]> {
  const pb = getPocketBase();
  return pb
    .collection(COLLECTIONS.storylines)
    .getFullList<StorylineRecord>({ sort: "name" });
}

export async function createStoryline(
  name: string
): Promise<StorylineRecord> {
  const pb = getPocketBase();
  return pb
    .collection(COLLECTIONS.storylines)
    .create<StorylineRecord>({ name });
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

export async function removeBookCharacter(id: string): Promise<void> {
  const pb = getPocketBase();
  await pb.collection(COLLECTIONS.booksCharacters).delete(id);
}

export async function listBookStorylines(
  bookId: string
): Promise<BookStorylineRecord[]> {
  const pb = getPocketBase();
  return pb
    .collection(COLLECTIONS.booksStorylines)
    .getFullList<BookStorylineRecord>({
      filter: `book = "${bookId}"`,
      expand: "storyline",
      sort: "-created",
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

export async function removeBookStoryline(id: string): Promise<void> {
  const pb = getPocketBase();
  await pb.collection(COLLECTIONS.booksStorylines).delete(id);
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
