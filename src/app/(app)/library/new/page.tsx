"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { createBook } from "@/lib/data";
import type { BookInput } from "@/lib/data";
import { BookForm } from "@/components/BookForm";

export default function NewBookPage() {
  const router = useRouter();
  const { user } = useAuth();

  async function handleSubmit(input: BookInput) {
    if (!user) return;
    const book = await createBook(user.id, input);
    router.push(`/library/${book.id}`);
  }

  return (
    <div className="flex max-w-2xl flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h1 className="font-serif text-2xl font-semibold text-foreground">Ajouter un livre</h1>
        <div className="flex items-center gap-2" aria-hidden="true">
          <span className="h-px w-[26px] bg-border" />
          <span className="text-[9px] text-accent">◆</span>
        </div>
      </div>
      <BookForm onSubmit={handleSubmit} submitLabel="Ajouter le livre" />
    </div>
  );
}
