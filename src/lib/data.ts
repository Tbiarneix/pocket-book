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
  InviteRecord,
  RankingRecord,
  SeriesRecord,
  StatusRecord,
  StorylineRecord,
  UserRecord,
} from "./types";

const INVITE_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;

const BOOK_EXPAND = "author,serie,genre,subgenres,status";

/**
 * Books are readable by every signed-in account (for the Communauté
 * feature), so an explicit `user` filter is what keeps "my library" scoped
 * to just one person — the API rule alone no longer does that.
 */
export async function listBooks(userId: string): Promise<ExpandedBookRecord[]> {
  const pb = getPocketBase();
  return pb.collection(COLLECTIONS.books).getFullList<ExpandedBookRecord>({
    filter: `user = "${userId}"`,
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

export async function loanBook(id: string, loanedTo: string): Promise<BookRecord> {
  const pb = getPocketBase();
  return pb.collection(COLLECTIONS.books).update<BookRecord>(id, { loaned_to: loanedTo });
}

export async function returnBook(id: string): Promise<BookRecord> {
  const pb = getPocketBase();
  return pb.collection(COLLECTIONS.books).update<BookRecord>(id, { loaned_to: "" });
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
 *
 * `books_storylines` is readable by every account (for Communauté), and a
 * série itself is shared across accounts, so without `book.user = ownerId`
 * this would also pull in every other account's comments on that série's
 * other tomes.
 */
export async function listStorylineComments(
  serieId: string,
  bookId: string,
  ownerId: string
): Promise<BookStorylineRecord[]> {
  const pb = getPocketBase();
  const filter = serieId
    ? `storyline.serie = "${serieId}" && book.user = "${ownerId}"`
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
 * comment per arc can be the closing one. Scoped to `bookUserId` for the
 * same reason as `listStorylineComments`: a storyline can now carry
 * comments from other accounts sharing the same série, and PocketBase's
 * update rule would reject touching theirs anyway.
 */
export async function closeBookStoryline(
  storylineId: string,
  bookStorylineId: string,
  bookUserId: string
): Promise<void> {
  const pb = getPocketBase();
  const previouslyClosed = await pb
    .collection(COLLECTIONS.booksStorylines)
    .getFullList<BookStorylineRecord>({
      filter: `storyline = "${storylineId}" && closed = true && book.user = "${bookUserId}"`,
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

export async function getUser(id: string): Promise<UserRecord> {
  const pb = getPocketBase();
  return pb.collection(COLLECTIONS.users).getOne<UserRecord>(id);
}

/** Every other account, for the Communauté user list. */
export async function listCommunityUsers(currentUserId: string): Promise<UserRecord[]> {
  const pb = getPocketBase();
  const users = await pb.collection(COLLECTIONS.users).getFullList<UserRecord>({
    sort: "name",
  });
  return users.filter((u) => u.id !== currentUserId);
}

/**
 * Copies a book into another account's library — catalog fields only
 * (title, cover, résumé, auteur, série, tome, genre) since rating, status,
 * finished date, loan, and avis are personal reading progress, not the
 * book's own data. Personnages/arcs comments attached to the source book
 * are copied too (same text, same open/closed state) but still point at
 * the série's existing personnage/arc entries rather than cloning those —
 * per-book comments are already isolated by owner, so nothing about the
 * original account's data is at risk, and this avoids seeding duplicate
 * "Kaladin"-style entries into the série's shared picker.
 */
export async function duplicateBook(sourceBookId: string, userId: string): Promise<BookRecord> {
  const pb = getPocketBase();
  const source = await pb.collection(COLLECTIONS.books).getOne<BookRecord>(sourceBookId);

  const newBook = await createBook(userId, {
    title: source.title,
    cover_url: source.cover_url,
    summary: source.summary,
    opinion: "",
    author: source.author,
    serie: source.serie,
    tome: source.tome,
    genre: source.genre,
    subgenres: source.subgenres,
    rating: null,
    status: "",
    finished: "",
  });

  const [sourceCharacters, sourceStorylines] = await Promise.all([
    pb.collection(COLLECTIONS.booksCharacters).getFullList<BookCharacterRecord>({
      filter: `book = "${sourceBookId}"`,
    }),
    pb.collection(COLLECTIONS.booksStorylines).getFullList<BookStorylineRecord>({
      filter: `book = "${sourceBookId}"`,
    }),
  ]);

  await Promise.all([
    ...sourceCharacters.map((bc) =>
      pb.collection(COLLECTIONS.booksCharacters).create({
        book: newBook.id,
        character: bc.character,
        comment: bc.comment,
      })
    ),
    ...sourceStorylines.map((bs) =>
      pb.collection(COLLECTIONS.booksStorylines).create({
        book: newBook.id,
        storyline: bs.storyline,
        comment: bs.comment,
        closed: bs.closed,
      })
    ),
  ]);

  return newBook;
}

/**
 * The invite a user has already generated and hasn't used or let expire
 * yet, if any — so "Inviter" reuses one link instead of piling up unused
 * ones every time the button is clicked.
 */
export async function getPendingInvite(userId: string): Promise<InviteRecord | null> {
  const pb = getPocketBase();
  const invites = await pb.collection(COLLECTIONS.invites).getFullList<InviteRecord>({
    filter: `created_by = "${userId}" && used_by = ""`,
    sort: "-created",
  });
  const now = Date.now();
  return invites.find((invite) => new Date(invite.expires_at).getTime() > now) ?? null;
}

export async function createInvite(userId: string): Promise<InviteRecord> {
  const pb = getPocketBase();
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + INVITE_LIFETIME_MS).toISOString();
  return pb.collection(COLLECTIONS.invites).create<InviteRecord>({
    token,
    created_by: userId,
    expires_at: expiresAt,
  });
}

export async function revokeInvite(id: string): Promise<void> {
  const pb = getPocketBase();
  await pb.collection(COLLECTIONS.invites).delete(id);
}
