import type { ReadingDb } from "@/db/client";
import { createBookRepository } from "@/db/repositories/books";
import { createQueueRepository } from "@/db/repositories/queue";
import { createThoughtRepository } from "@/db/repositories/thoughts";

export async function getDashboardData(db: ReadingDb, now = new Date()) {
  const books = createBookRepository(db);
  const queue = createQueueRepository(db);
  const thoughts = createThoughtRepository(db);
  const [mainBook, sideBooks, mainQueue, recentThoughts, dueReviews] = await Promise.all([
    books.getMain(),
    books.listByRole("side"),
    queue.list("main"),
    thoughts.listRecent(5),
    thoughts.listDue(now, 3),
  ]);

  return {
    mainBook: mainBook ?? null,
    sideBooks,
    nextMain: mainQueue[0] ?? null,
    recentThoughts,
    dueReviews,
  };
}
