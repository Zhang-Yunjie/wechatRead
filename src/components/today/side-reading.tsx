import Link from "next/link";
import { BookCover } from "@/components/book-cover";

type SideBook = { id: string; title: string; author: string; coverUrl?: string | null; progress?: number | null };

export function SideReading({ books }: { books: SideBook[] }) {
  if (!books.length) return null;
  return (
    <section className="section-block">
      <div className="section-heading"><div><p className="eyebrow">支线阅读</p><h2>换一种节奏</h2></div><span>{books.length} 本在读</span></div>
      <div className="side-book-row">
        {books.map((book) => (
          <Link href={`/books/${book.id}`} className="side-book" key={book.id}>
            <BookCover title={book.title} author={book.author} coverUrl={book.coverUrl} />
            <div><h3 className="font-serif text-lg">{book.title}</h3><p className="mt-1 text-xs text-[var(--ink-soft)]">{book.author}</p><p className="mt-4 text-xs">读到 {book.progress ?? 0}%</p></div>
          </Link>
        ))}
      </div>
    </section>
  );
}
