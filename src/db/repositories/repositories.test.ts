import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { createDatabase, type ReadingDatabase } from "../client";
import { createBookRepository } from "./books";
import { createQueueRepository } from "./queue";
import { createThoughtRepository } from "./thoughts";

describe("local reading repositories", () => {
  let database: ReadingDatabase;
  let db: BetterSQLite3Database;

  beforeEach(() => {
    database = createDatabase(":memory:");
    db = database.db;
  });

  afterEach(() => database.sqlite.close());

  it("keeps exactly one main book while preserving side books", async () => {
    const books = createBookRepository(db);
    await books.upsertImported({ id: "book-a", title: "甲", author: "作者甲" });
    await books.upsertImported({ id: "book-b", title: "乙", author: "作者乙" });
    await books.upsertImported({ id: "book-c", title: "丙", author: "作者丙" });

    await books.setRole("book-a", "main");
    await books.setRole("book-b", "side");
    await books.setRole("book-c", "main");

    expect(await books.getMain()).toMatchObject({ id: "book-c", readingRole: "main" });
    expect(await books.getById("book-a")).toMatchObject({ readingRole: "none" });
    expect(await books.getById("book-b")).toMatchObject({ readingRole: "side" });
  });

  it("preserves local reading state when imported metadata is refreshed", async () => {
    const books = createBookRepository(db);
    await books.upsertImported({ id: "book-a", title: "旧标题", author: "作者" });
    await books.setRole("book-a", "main");

    await books.upsertImported({ id: "book-a", title: "新标题", author: "作者" });

    expect(await books.getById("book-a")).toMatchObject({ title: "新标题", readingRole: "main" });
  });

  it("persists queue order and reasons", async () => {
    const books = createBookRepository(db);
    const queue = createQueueRepository(db);
    await books.upsertImported({ id: "book-a", title: "甲", author: "作者" });
    await books.upsertImported({ id: "book-b", title: "乙", author: "作者" });
    await queue.add({ bookId: "book-a", lane: "main", reason: "建立基础" });
    await queue.add({ bookId: "book-b", lane: "main", reason: "继续深入" });

    await queue.reorder("main", ["book-b", "book-a"]);

    expect(await queue.list("main")).toMatchObject([
      { bookId: "book-b", position: 0, reason: "继续深入" },
      { bookId: "book-a", position: 1, reason: "建立基础" },
    ]);
  });

  it("stores raw thoughts before any enrichment", async () => {
    const books = createBookRepository(db);
    const thoughts = createThoughtRepository(db);
    await books.upsertImported({ id: "book-a", title: "甲", author: "作者" });

    const thought = await thoughts.create({ bookId: "book-a", rawContent: "  这和之前的观点矛盾  " });

    expect(thought).toMatchObject({
      bookId: "book-a",
      rawContent: "这和之前的观点矛盾",
      reviewState: "pending",
      enrichmentState: "pending",
    });
  });

  it("records daily review outcomes without changing the original thought", async () => {
    const books = createBookRepository(db);
    const thoughts = createThoughtRepository(db);
    await books.upsertImported({ id: "book-a", title: "甲", author: "作者" });
    const thought = await thoughts.create({ bookId: "book-a", rawContent: "原始判断" });

    await thoughts.review(thought.id, "changed", "现在的看法不同了");

    expect(await thoughts.getById(thought.id)).toMatchObject({
      rawContent: "原始判断",
      reviewState: "changed",
      reviewNote: "现在的看法不同了",
    });
  });
});
