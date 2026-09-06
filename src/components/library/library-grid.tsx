"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BookCover } from "@/components/book-cover";
import { BookProfileChips } from "@/components/book-profile-chips";
import { LibraryFilters } from "./library-filters";

type LibraryBook = { id: string; title: string; author: string; coverUrl?: string | null; category?: string | null; progress?: number | null; readingRole: "none" | "main" | "side" };

export function LibraryGrid({ books }: { books: LibraryBook[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => books.filter((book) => `${book.title} ${book.author}`.toLowerCase().includes(query.toLowerCase())), [books, query]);
  async function add(bookId: string, lane: "main" | "side" | "quick") {
    await fetch("/api/queue", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ bookId, lane }) });
  }
  return (
    <>
      <div className="library-toolbar"><LibraryFilters query={query} onQuery={setQuery} /><span>{filtered.length} 本</span></div>
      <div className="library-grid">{filtered.map((book) => (
        <article className="library-card" key={book.id}>
          <Link href={`/books/${book.id}`}><BookCover title={book.title} author={book.author} coverUrl={book.coverUrl} /></Link>
          <div className="min-w-0 flex-1"><p className="eyebrow">{book.category || "未分类"}</p><Link href={`/books/${book.id}`}><h2 className="mt-2 truncate font-serif text-xl">{book.title}</h2></Link><p className="mt-1 text-xs text-[var(--ink-soft)]">{book.author}</p><div className="mt-4"><BookProfileChips /></div>
            <div className="mt-5 flex flex-wrap gap-2"><button className="tiny-button" onClick={() => void add(book.id, "main")}>主线候选</button><button className="tiny-button" onClick={() => void add(book.id, "side")}>支线候选</button><button className="tiny-button" onClick={() => void add(book.id, "quick")}>快速阅读</button></div>
          </div>
        </article>
      ))}</div>
    </>
  );
}
