import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createDatabase, type ReadingDatabase } from "@/db/client";
import { createBookRepository } from "@/db/repositories/books";
import { createQueueRepository } from "@/db/repositories/queue";
import { createThoughtRepository } from "@/db/repositories/thoughts";
import { thoughts as thoughtTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getDashboardData } from "./dashboard";

describe("getDashboardData", () => {
  let database: ReadingDatabase;

  beforeEach(() => { database = createDatabase(":memory:"); });
  afterEach(() => database.sqlite.close());

  it("returns active reading, next candidate, recent thoughts, and due review", async () => {
    const books = createBookRepository(database.db);
    const queue = createQueueRepository(database.db);
    const thoughts = createThoughtRepository(database.db);
    await books.upsertImported({ id: "main", title: "主线书", author: "作者" });
    await books.upsertImported({ id: "side", title: "支线书", author: "作者" });
    await books.upsertImported({ id: "next", title: "下一本", author: "作者" });
    await books.setRole("main", "main");
    await books.setRole("side", "side");
    await queue.add({ bookId: "next", lane: "main", reason: "延续当前主题" });
    const thought = await thoughts.create({ bookId: "main", rawContent: "这条想法需要再看" });
    await database.db.update(thoughtTable).set({ createdAt: Date.now() - 2 * 86_400_000 })
      .where(eq(thoughtTable.id, thought!.id));

    const result = await getDashboardData(database.db, new Date());

    expect(result.mainBook).toMatchObject({ id: "main" });
    expect(result.sideBooks).toEqual([expect.objectContaining({ id: "side" })]);
    expect(result.nextMain).toMatchObject({ bookId: "next", reason: "延续当前主题" });
    expect(result.recentThoughts[0]).toMatchObject({ rawContent: "这条想法需要再看" });
    expect(result.dueReviews[0]).toMatchObject({ id: thought!.id });
  });
});
