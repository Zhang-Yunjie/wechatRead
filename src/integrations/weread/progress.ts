import { eq } from "drizzle-orm";
import type { ReadingDb } from "@/db/client";
import { books } from "@/db/schema";
import type { ProgressResponse, WeReadCaller } from "./types";

export type BookProgressRefreshResult = {
  progressByBookId: Record<string, number>;
  errors: { bookId: string; message: string }[];
};

export async function refreshBookProgresses(
  db: ReadingDb,
  client: WeReadCaller,
  requestedBookIds: string[],
): Promise<BookProgressRefreshResult> {
  const bookIds = [...new Set(requestedBookIds)];
  if (!bookIds.length) return { progressByBookId: {}, errors: [] };

  const localBooks = await db.query.books.findMany({
    where: (book, { inArray }) => inArray(book.id, bookIds),
  });
  const progressByBookId: Record<string, number> = {};
  const errors: BookProgressRefreshResult["errors"] = [];

  await Promise.all(localBooks.map(async (book) => {
    try {
      const response = await client.call<ProgressResponse>("/book/getprogress", { bookId: book.id });
      const progress = response.book?.progress;
      if (typeof progress !== "number" || !Number.isFinite(progress) || progress < 0 || progress > 100) {
        throw new Error("微信读书未返回有效进度");
      }
      await db.update(books).set({
        progress,
        readUpdateTime: response.book?.updateTime,
        finishTime: response.book?.finishTime,
        updatedAt: Date.now(),
      }).where(eq(books.id, book.id));
      progressByBookId[book.id] = progress;
    } catch (error) {
      errors.push({ bookId: book.id, message: error instanceof Error ? error.message : "进度刷新失败" });
    }
  }));

  return { progressByBookId, errors };
}
