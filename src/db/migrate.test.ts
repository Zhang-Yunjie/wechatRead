import Database from "better-sqlite3";
import { describe, expect, it } from "vitest";
import { migrate } from "./migrate";

describe("database migrations", () => {
  it("adds WeRead source fields to an existing thoughts table", () => {
    const sqlite = new Database(":memory:");
    sqlite.exec(`
      CREATE TABLE thoughts (
        id TEXT PRIMARY KEY,
        book_id TEXT,
        raw_content TEXT NOT NULL,
        suggested_type TEXT,
        suggested_topics TEXT,
        enrichment_state TEXT NOT NULL DEFAULT 'pending',
        review_state TEXT NOT NULL DEFAULT 'pending',
        review_note TEXT,
        last_reviewed_at INTEGER,
        snoozed_until INTEGER,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);

    migrate(sqlite);

    const columns = sqlite.prepare("PRAGMA table_info(thoughts)").all() as Array<{ name: string }>;
    expect(columns.map((column) => column.name)).toEqual(expect.arrayContaining(["source", "source_id"]));
    sqlite.close();
  });
});
