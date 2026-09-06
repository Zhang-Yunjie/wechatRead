import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createDatabase, type ReadingDatabase } from "@/db/client";
import { createBookRepository } from "@/db/repositories/books";
import { createThoughtAction } from "./route";

describe("POST /api/thoughts", () => {
  let database: ReadingDatabase;

  beforeEach(() => { database = createDatabase(":memory:"); });
  afterEach(() => database.sqlite.close());

  it("links a new thought to the active main book by default", async () => {
    const books = createBookRepository(database.db);
    await books.upsertImported({ id: "main", title: "主线书", author: "作者" });
    await books.setRole("main", "main");
    const handler = createThoughtAction(database.db);

    const response = await handler(new Request("http://localhost/api/thoughts", {
      method: "POST",
      body: JSON.stringify({ content: "  一个刚刚出现的想法  " }),
      headers: { "content-type": "application/json" },
    }));

    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({ thought: { bookId: "main", rawContent: "一个刚刚出现的想法" } });
  });

  it("rejects an empty thought", async () => {
    const response = await createThoughtAction(database.db)(new Request("http://localhost/api/thoughts", {
      method: "POST",
      body: JSON.stringify({ content: "   " }),
      headers: { "content-type": "application/json" },
    }));

    expect(response.status).toBe(400);
  });
});
