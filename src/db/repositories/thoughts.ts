import { eq } from "drizzle-orm";
import type { ReadingDb } from "../client";
import { thoughts } from "../schema";

export type ReviewOutcome = "agreed" | "changed" | "completed" | "skipped";

export function createThoughtRepository(db: ReadingDb) {
  return {
    async create(input: { bookId?: string | null; rawContent: string }) {
      const rawContent = input.rawContent.trim();
      if (!rawContent) throw new Error("想法内容不能为空");
      const now = Date.now();
      const row = {
        id: crypto.randomUUID(),
        bookId: input.bookId ?? null,
        rawContent,
        createdAt: now,
        updatedAt: now,
      };
      await db.insert(thoughts).values(row);
      return db.query.thoughts.findFirst({ where: eq(thoughts.id, row.id) });
    },
    async getById(id: string) {
      return db.query.thoughts.findFirst({ where: eq(thoughts.id, id) });
    },
    async review(id: string, outcome: ReviewOutcome, note?: string) {
      await db.update(thoughts).set({
        reviewState: outcome,
        reviewNote: note?.trim() || null,
        lastReviewedAt: Date.now(),
        updatedAt: Date.now(),
      }).where(eq(thoughts.id, id));
    },
  };
}
