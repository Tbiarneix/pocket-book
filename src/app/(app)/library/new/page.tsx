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
      <h1 className="font-hand text-[32px] text-foreground">Ajouter un livre</h1>
      <BookForm onSubmit={handleSubmit} submitLabel="Ajouter le livre" />
    </div>
  );
}
