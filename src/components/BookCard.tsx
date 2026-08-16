import Link from "next/link";
import type { ExpandedBookRecord, RankingRecord } from "@/lib/types";
import { RankingBadge } from "./RankingBadge";
import { StatusBadge } from "./StatusBadge";
import { BookCover } from "./BookCover";
import { isActiveStatus } from "@/lib/statusStyle";

export function BookCard({
  book,
  rankings,
}: {
  book: ExpandedBookRecord;
  rankings: RankingRecord[];
}) {
  const author = book.expand?.author?.name;
  const status = book.expand?.status?.name;

  return (
    <li className="group relative flex gap-3.5 rounded-[10px] border border-border bg-surface p-3.5 transition-shadow hover:shadow-md">
      <BookCover coverUrl={book.cover_url} title={book.title} active={isActiveStatus(status)} />

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <h3 className="font-serif text-base font-semibold leading-snug text-foreground">
          <Link href={`/library/${book.id}`} className="after:absolute after:inset-0">
            {book.title}
          </Link>
        </h3>
        {author && <p className="text-[13px] text-muted">{author}</p>}

        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
          <RankingBadge rating={book.rating} rankings={rankings} />
          {status && <StatusBadge name={status} size="sm" />}
        </div>
      </div>
    </li>
  );
}
