import Link from "next/link";
import type { ExpandedBookRecord, RankingRecord } from "@/lib/types";
import { RankingBadge } from "./RankingBadge";
import { StatusBadge } from "./StatusBadge";
import { BookCover } from "./BookCover";
import { isActiveStatus } from "@/lib/statusStyle";
import { SKETCH_OUTLINE, SKETCH_RADIUS } from "@/lib/sketch";

export function BookCard({
  book,
  rankings,
}: {
  book: ExpandedBookRecord;
  rankings: RankingRecord[];
}) {
  const author = book.expand?.author?.name;
  const status = book.expand?.status?.name;
  const serie = book.expand?.serie?.name;
  const subtitle = serie ? (book.tome ? `${serie} · Tome ${book.tome}` : serie) : null;

  return (
    <li
      className={`group flex gap-4 border-2 border-border-strong bg-background p-4 transition-shadow rotate-[-0.3deg] hover:shadow-md ${SKETCH_RADIUS} ${SKETCH_OUTLINE}`}
    >
      <BookCover coverUrl={book.cover_url} title={book.title} active={isActiveStatus(status)} />

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <h3 className="font-hand text-xl leading-snug text-foreground">
          <Link href={`/library/${book.id}`} className="after:absolute after:inset-0">
            {book.title}
          </Link>
        </h3>
        {subtitle && <p className="font-hand text-[13px] text-accent">{subtitle}</p>}
        {author && <p className="font-hand text-[15px] text-muted">{author}</p>}

        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
          <RankingBadge rating={book.rating} rankings={rankings} />
          {status && <StatusBadge name={status} size="sm" />}
        </div>
      </div>
    </li>
  );
}
