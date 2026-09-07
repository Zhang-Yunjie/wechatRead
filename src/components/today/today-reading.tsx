"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { EmptyState } from "@/components/empty-state";
import { FeaturedBook } from "./featured-book";
import { SideReading } from "./side-reading";

type TodayBook = {
  id: string;
  title: string;
  author: string;
  coverUrl?: string | null;
  deepLink?: string | null;
  progress?: number | null;
};

type ProgressResponse = {
  progressByBookId?: Record<string, unknown>;
  errors?: { bookId: string; message: string }[];
};

function validProgress(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100;
}

export function TodayReading({
  mainBook: initialMainBook,
  sideBooks: initialSideBooks,
  children,
}: {
  mainBook: TodayBook | null;
  sideBooks: TodayBook[];
  children?: ReactNode;
}) {
  const [mainBook, setMainBook] = useState(initialMainBook);
  const [sideBooks, setSideBooks] = useState(initialSideBooks);
  const [message, setMessage] = useState<string | null>(null);
  const bookIds = useRef([
    ...(initialMainBook ? [initialMainBook.id] : []),
    ...initialSideBooks.map((book) => book.id),
  ]);
  const refreshStarted = useRef(false);

  useEffect(() => {
    if (refreshStarted.current || !bookIds.current.length) return;
    refreshStarted.current = true;
    const controller = new AbortController();
    let active = true;
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/sync/weread/progress", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ bookIds: bookIds.current }),
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("refresh failed");
        const result = await response.json() as ProgressResponse;
        if (!active) return;
        const latest = result.progressByBookId ?? {};
        setMainBook((book) => {
          if (!book || !validProgress(latest[book.id])) return book;
          return { ...book, progress: latest[book.id] };
        });
        setSideBooks((books) => books.map((book) => validProgress(latest[book.id]) ? { ...book, progress: latest[book.id] } : book));
        if (result.errors?.length) setMessage("部分阅读进度暂时无法更新");
      } catch (error) {
        if (active && !(error instanceof DOMException && error.name === "AbortError")) {
          setMessage("阅读进度更新失败，当前显示上次同步结果");
        }
      }
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timer);
      controller.abort();
      refreshStarted.current = false;
    };
  }, []);

  return (
    <>
      <div className="today-grid">
        <div>{mainBook ? <FeaturedBook book={mainBook} /> : <EmptyState title="先选一本主线书" description="同步微信读书后，从书库挑一本此刻真正想读的书。" />}</div>
        {children}
      </div>
      <SideReading books={sideBooks} />
      {message ? <p className="sync-message sync-message--error mt-3" role="status">{message}</p> : null}
    </>
  );
}
