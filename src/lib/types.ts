// Types matching the PocketBase schema explored on the "Acme" instance.

export interface BaseRecord {
  id: string;
  created: string;
  updated: string;
}

export interface UserRecord extends BaseRecord {
  email: string;
  name: string;
  avatar: string;
  emailVisibility: boolean;
  verified: boolean;
  can_invite: boolean;
}

export interface AuthorRecord extends BaseRecord {
  name: string;
}

export interface SeriesRecord extends BaseRecord {
  name: string;
}

export interface GenreRecord extends BaseRecord {
  name: string;
}

export interface StatusRecord extends BaseRecord {
  name: string;
}

export interface RankingRecord extends BaseRecord {
  name: string;
  rating_min: number;
  rating_max: number;
}

// Scoped to a série when the book belongs to one (reusable across every
// tome), or directly to a single `book` as a fallback for standalone books
// — otherwise every standalone book would share one unscoped pool.
export interface CharacterRecord extends BaseRecord {
  name: string;
  serie: string;
  book: string;
}

export interface StorylineRecord extends BaseRecord {
  name: string;
  serie: string;
  book: string;
}

export interface BookRecord extends BaseRecord {
  user: string;
  title: string;
  cover_url: string;
  summary: string;
  opinion: string;
  author: string;
  serie: string;
  tome: number | null;
  genre: string;
  subgenres: string[];
  rating: number;
  status: string;
  finished: string;
  loaned_to: string;
}

/** Book with its relations resolved via PocketBase's `expand`. */
export interface ExpandedBookRecord extends BookRecord {
  expand?: {
    author?: AuthorRecord;
    serie?: SeriesRecord;
    genre?: GenreRecord;
    subgenres?: GenreRecord[];
    status?: StatusRecord;
  };
}

export interface BookCharacterRecord extends BaseRecord {
  book: string;
  character: string;
  comment: string;
  expand?: {
    character?: CharacterRecord;
  };
}

export interface BookStorylineRecord extends BaseRecord {
  book: string;
  storyline: string;
  comment: string;
  closed: boolean;
  expand?: {
    storyline?: StorylineRecord;
    book?: BookRecord;
  };
}

export interface InviteRecord extends BaseRecord {
  token: string;
  created_by: string;
  used_by: string;
  used_at: string;
  expires_at: string;
}

export const COLLECTIONS = {
  users: "users",
  authors: "authors",
  books: "books",
  booksCharacters: "books_characters",
  booksStorylines: "books_storylines",
  characters: "characters",
  genres: "genres",
  invites: "invites",
  rankings: "rankings",
  series: "series",
  status: "status",
  storylines: "storylines",
} as const;
