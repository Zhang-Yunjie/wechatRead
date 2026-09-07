import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createDatabase, type ReadingDatabase } from "@/db/client";
import { createBookRepository } from "@/db/repositories/books";
import type { WeReadCaller } from "./types";
import { refreshBookProgresses } from "./progress";

describe("refreshBookProgresses", () => {
  let database: ReadingDatabase;

  beforeEach(() => { database = createDatabase(":memory:"); });
  afterEach(() => database.sqlite.close());

  it("updates requested local books and ignores unknown IDs", async () => {
    const books = createBookRepository(database.db);
    await books.upsertImported({ id: "b1", title: "目标书", progress: 10 });
    const call = vi.fn().mockResolvedValue({ book: { progress: 47, updateTime: 123 } });

    const result = await refreshBookProgresses(database.db, { call } as WeReadCaller, ["b1", "missing", "b1"]);

    expect(result).toEqual({ progressByBookId: { b1: 47 }, errors: [] });
    expect(await books.getById("b1")).toMatchObject({ progress: 47, readUpdateTime: 123, finishTime: null });
    expect(call).toHaveBeenCalledOnce();
    expect(call).toHaveBeenCalledWith("/book/getprogress", { bookId: "b1" });
  });

  it("keeps successful updates when another book fails", async () => {
    const books = createBookRepository(database.db);
    await books.upsertImported({ id: "b1", title: "成功", progress: 10 });
    await books.upsertImported({ id: "b2", title: "失败", progress: 20 });
    const call = vi.fn(async (_name: string, params?: Record<string, unknown>) => {
      if (params?.bookId === "b1") return { book: { progress: 47 } };
      throw new Error("暂时不可用");
    });

    const result = await refreshBookProgresses(database.db, { call } as WeReadCaller, ["b1", "b2"]);

    expect(result).toEqual({
      progressByBookId: { b1: 47 },
      errors: [{ bookId: "b2", message: "暂时不可用" }],
    });
    expect(await books.getById("b1")).toMatchObject({ progress: 47 });
    expect(await books.getById("b2")).toMatchObject({ progress: 20 });
  });

  it.each([undefined, Number.NaN, -1, 101])("does not overwrite stored progress with %s", async (progress) => {
    const books = createBookRepository(database.db);
    await books.upsertImported({ id: "b1", title: "目标书", progress: 10 });
    const call = vi.fn().mockResolvedValue({ book: { progress } });

    const result = await refreshBookProgresses(database.db, { call } as WeReadCaller, ["b1"]);

    expect(result.progressByBookId).toEqual({});
    expect(result.errors).toEqual([{ bookId: "b1", message: "微信读书未返回有效进度" }]);
    expect(await books.getById("b1")).toMatchObject({ progress: 10 });
  });
});
