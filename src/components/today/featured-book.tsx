import Link from "next/link";
import { ArrowRight, BookOpenText } from "lucide-react";
import { BookCover } from "@/components/book-cover";
import { BookProfileChips } from "@/components/book-profile-chips";

type FeaturedBookProps = {
  book: { id: string; title: string; author: string; coverUrl?: string | null; deepLink?: string | null; progress?: number | null };
};

export function FeaturedBook({ book }: FeaturedBookProps) {
  return (
    <section className="featured-reading">
      <div className="featured-reading__glow" />
      <BookCover title={book.title} author={book.author} coverUrl={book.coverUrl} featured />
      <div className="relative z-10 max-w-sm">
        <p className="eyebrow">正在读 · 主线</p>
        <h2 className="mt-3 font-serif text-[42px] leading-[1.12] tracking-tight">{book.title}</h2>
        <p className="mt-3 text-sm text-[var(--ink-soft)]">{book.author}</p>
        <div className="mt-7"><BookProfileChips profile={null} /></div>
        <div className="mt-8">
          <div className="mb-2 flex items-center justify-between text-xs text-[var(--ink-soft)]"><span>阅读进度</span><strong className="font-medium text-[var(--forest)]">{book.progress ?? 0}%</strong></div>
          <div className="progress-track"><span style={{ width: `${book.progress ?? 0}%` }} /></div>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          {book.deepLink ? <a className="primary-button" href={book.deepLink}><BookOpenText size={16} />继续阅读</a> : null}
          <Link className="secondary-button" href={`/books/${book.id}`}>打开工作室<ArrowRight size={15} /></Link>
        </div>
      </div>
    </section>
  );
}
