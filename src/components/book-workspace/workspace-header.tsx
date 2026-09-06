import { BookCover } from "@/components/book-cover";
import { BookProfileChips } from "@/components/book-profile-chips";

export function WorkspaceHeader({ book }: { book: { title: string; author: string; coverUrl?: string | null; progress?: number | null; category?: string | null } }) {
  return (
    <header className="workspace-header">
      <BookCover title={book.title} author={book.author} coverUrl={book.coverUrl} />
      <div><p className="eyebrow">BOOK WORKROOM · {book.category || "未分类"}</p><h1>{book.title}</h1><p className="mt-3 text-sm text-[var(--ink-soft)]">{book.author}</p><div className="mt-6"><BookProfileChips /></div><p className="mt-7 text-xs text-[var(--ink-soft)]">当前进度 <strong className="ml-2 text-[var(--forest)]">{book.progress ?? 0}%</strong></p></div>
      <p className="workspace-header__quote">阅读不是把书放进脑子里，<br />而是让自己的问题发生变化。</p>
    </header>
  );
}
