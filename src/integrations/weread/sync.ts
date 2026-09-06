import { eq } from "drizzle-orm";
import type { ReadingDb } from "@/db/client";
import { createBookRepository } from "@/db/repositories/books";
import { books, highlights, syncRuns, thoughts } from "@/db/schema";
import type { BookmarkResponse, MineReviewsResponse, NotebooksResponse, ProgressResponse, ShelfResponse, WeReadCaller } from "./types";

export async function syncWeRead(db: ReadingDb, client: WeReadCaller) {
  const runId = crypto.randomUUID();
  const startedAt = Date.now();
  const errors: string[] = [];
  let importedBooks = 0;
  let importedNotes = 0;
  await db.insert(syncRuns).values({ id: runId, status: "running", startedAt });
  const bookRepo = createBookRepository(db);

  try {
    const shelf = await client.call<ShelfResponse>("/shelf/sync");
    for (const book of shelf.books ?? []) {
      await bookRepo.upsertImported({
        id: book.bookId, title: book.title, author: book.author ?? "", coverUrl: book.cover,
        category: book.category, intro: book.intro, deepLink: book.deepLink,
        progress: book.progress, readUpdateTime: book.readUpdateTime,
        finishTime: book.finishReading ? book.readUpdateTime : null,
      });
      importedBooks += 1;
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "书架同步失败");
  }

  if (importedBooks > 0) {
    try {
      let lastSort: number | undefined;
      let hasMore = 1;
      while (hasMore) {
        const page = await client.call<NotebooksResponse>("/user/notebooks", { count: 100, ...(lastSort ? { lastSort } : {}) });
        hasMore = page.hasMore ?? 0;
        const rows = page.books ?? [];
        const final = rows.at(-1) as { sort?: number } | undefined;
        lastSort = final?.sort;
        if (hasMore && !lastSort) break;
      }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "笔记概览同步失败");
    }

    const activeBooks = await db.query.books.findMany({ where: (book, { inArray }) => inArray(book.readingRole, ["main", "side"]) });
    for (const book of activeBooks) {
      try {
        const progress = await client.call<ProgressResponse>("/book/getprogress", { bookId: book.id });
        if (progress.book) await db.update(books).set({ progress: progress.book.progress, readUpdateTime: progress.book.updateTime, finishTime: progress.book.finishTime, updatedAt: Date.now() }).where(eq(books.id, book.id));
        const bookmarks = await client.call<BookmarkResponse>("/book/bookmarklist", { bookId: book.id });
        const chapters = new Map((bookmarks.chapters ?? []).map((chapter) => [chapter.chapterUid, chapter.title]));
        for (const mark of bookmarks.updated ?? []) {
          const now = Date.now();
          await db.insert(highlights).values({ id: mark.bookmarkId, bookId: book.id, chapterUid: mark.chapterUid, chapterTitle: mark.chapterUid ? chapters.get(mark.chapterUid) : null, markText: mark.markText, range: mark.range, colorStyle: mark.colorStyle, sourceCreatedAt: mark.createTime, createdAt: now, updatedAt: now })
            .onConflictDoUpdate({ target: highlights.id, set: { markText: mark.markText, chapterTitle: mark.chapterUid ? chapters.get(mark.chapterUid) : null, updatedAt: now } });
          importedNotes += 1;
        }
        const reviews = await client.call<MineReviewsResponse>("/review/list/mine", { bookid: book.id, count: 100, synckey: 0 });
        for (const entry of reviews.reviews ?? []) {
          const now = Date.now(); const sourceId = entry.review.reviewId;
          await db.insert(thoughts).values({ id: `weread:${sourceId}`, source: "weread", sourceId, bookId: book.id, rawContent: entry.review.content, enrichmentState: "skipped", createdAt: entry.review.createTime ? entry.review.createTime * 1000 : now, updatedAt: now })
            .onConflictDoUpdate({ target: thoughts.sourceId, set: { rawContent: entry.review.content, updatedAt: now } });
          importedNotes += 1;
        }
      } catch (error) {
        errors.push(`${book.title}：${error instanceof Error ? error.message : "详情同步失败"}`);
      }
    }
  }

  const status = importedBooks === 0 && errors.length ? "failed" : errors.length ? "partial" : "success";
  const summary = { importedBooks, importedNotes, errors };
  await db.update(syncRuns).set({ status, finishedAt: Date.now(), summary: JSON.stringify(summary), errorMessage: errors.join("；") || null }).where(eq(syncRuns.id, runId));
  return { status, importedBooks, importedNotes, errors } as const;
}
