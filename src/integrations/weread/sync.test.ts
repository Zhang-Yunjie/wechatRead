import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createDatabase, type ReadingDatabase } from "@/db/client";
import { createBookRepository } from "@/db/repositories/books";
import { syncWeRead } from "./sync";
import type { WeReadCaller } from "./types";

describe("syncWeRead", () => {
  let database: ReadingDatabase;
  beforeEach(() => { database = createDatabase(":memory:"); });
  afterEach(() => database.sqlite.close());

  it("imports shelf metadata without replacing the local reading role", async () => {
    const books = createBookRepository(database.db);
    await books.upsertImported({ id: "b1", title: "旧标题", author: "作者" });
    await books.setRole("b1", "main");
    const client = { call: vi.fn(async (name: string) => {
      if (name === "/shelf/sync") return { books: [{ bookId: "b1", title: "新标题", author: "作者", progress: 42 }], albums: [] };
      if (name === "/user/notebooks") return { books: [], hasMore: 0 };
      if (name === "/book/getprogress") return { book: { progress: 42 } };
      if (name === "/book/bookmarklist") return { updated: [], chapters: [] };
      if (name === "/review/list/mine") return { reviews: [], hasMore: 0 };
      throw new Error("unexpected");
    }) } as unknown as WeReadCaller;

    const result = await syncWeRead(database.db, client);

    expect(result.status).toBe("success");
    expect(await books.getById("b1")).toMatchObject({ title: "新标题", readingRole: "main" });
  });

  it("keeps imported shelf data when a later section fails", async () => {
    const client = { call: vi.fn(async (name: string) => {
      if (name === "/shelf/sync") return { books: [{ bookId: "b1", title: "保留下来", author: "作者" }], albums: [] };
      throw new Error("笔记暂时不可用");
    }) } as unknown as WeReadCaller;

    const result = await syncWeRead(database.db, client);

    expect(result.status).toBe("partial");
    expect(await createBookRepository(database.db).getById("b1")).toMatchObject({ title: "保留下来" });
    expect(result.errors).toContain("笔记暂时不可用");
  });
});
