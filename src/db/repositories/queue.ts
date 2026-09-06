import { and, asc, eq, max } from "drizzle-orm";
import type { ReadingDb } from "../client";
import { queueItems } from "../schema";

export type QueueLane = "main" | "side" | "quick";

export function createQueueRepository(db: ReadingDb) {
  return {
    async add(input: { bookId: string; lane: QueueLane; reason?: string }) {
      const current = await db.select({ value: max(queueItems.position) }).from(queueItems).where(eq(queueItems.lane, input.lane));
      const now = Date.now();
      await db.insert(queueItems).values({
        id: crypto.randomUUID(),
        bookId: input.bookId,
        lane: input.lane,
        reason: input.reason?.trim() ?? "",
        position: (current[0]?.value ?? -1) + 1,
        createdAt: now,
        updatedAt: now,
      }).onConflictDoUpdate({
        target: queueItems.bookId,
        set: { lane: input.lane, reason: input.reason?.trim() ?? "", updatedAt: now },
      });
    },
    async reorder(lane: QueueLane, orderedBookIds: string[]) {
      db.transaction((tx) => {
        orderedBookIds.forEach((bookId, position) => {
          tx.update(queueItems).set({ position, updatedAt: Date.now() })
            .where(and(eq(queueItems.lane, lane), eq(queueItems.bookId, bookId))).run();
        });
      });
    },
    async list(lane: QueueLane) {
      return db.select().from(queueItems).where(eq(queueItems.lane, lane)).orderBy(asc(queueItems.position));
    },
    async updateReason(bookId: string, reason: string) {
      await db.update(queueItems).set({ reason: reason.trim(), updatedAt: Date.now() }).where(eq(queueItems.bookId, bookId));
    },
  };
}
