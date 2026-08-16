"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBook, updateBook } from "@/lib/data";
import type { BookInput } from "@/lib/data";
import type { ExpandedBookRecord } from "@/lib/types";
import { BookForm } from "@/components/BookForm";

export default function EditBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [book, setBook] = useState<ExpandedBookRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getBook(id)
      .then((data) => {
        if (!cancelled) setBook(data);
      })
      .catch(() => {
        if (!cancelled) setError("Impossible de charger ce livre.");
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleSubmit(input: BookInput) {
    await updateBook(id, input);
    router.push(`/library/${id}`);
  }

  if (error) {
    return (
      <p role="alert" className="rounded-md bg-accent-soft px-3 py-2 text-sm text-accent">
        {error}
      </p>
    );
  }

  if (!book) {
    return (
      <p role="status" className="text-muted">
        Chargement…
      </p>
    );
  }

  return (
    <div className="flex max-w-2xl flex-col gap-5">
      <h1 className="font-hand text-[32px] text-foreground">
        Modifier « {book.title} »
      </h1>
      <BookForm
        initialBook={book}
        onSubmit={handleSubmit}
        submitLabel="Enregistrer les modifications"
      />
    </div>
  );
}
