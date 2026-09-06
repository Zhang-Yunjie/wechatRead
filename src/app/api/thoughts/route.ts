import { z } from "zod";
import { getDatabase, type ReadingDb } from "@/db/client";
import { createBookRepository } from "@/db/repositories/books";
import { createThoughtRepository } from "@/db/repositories/thoughts";
import { hasAIConfiguration } from "@/integrations/ai/client";

const inputSchema = z.object({
  content: z.string().trim().min(1).max(10_000),
  bookId: z.string().min(1).optional(),
});

export function createThoughtAction(db: ReadingDb) {
  return async function handle(request: Request) {
    const parsed = inputSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return Response.json({ error: "请先写下一点内容" }, { status: 400 });
    }
    const mainBook = parsed.data.bookId ? null : await createBookRepository(db).getMain();
    const thought = await createThoughtRepository(db).create({
      rawContent: parsed.data.content,
      bookId: parsed.data.bookId ?? mainBook?.id ?? null,
    });
    if (thought && hasAIConfiguration()) {
      void import("./[thoughtId]/enrich/route").then(({ enrichThought }) => enrichThought(thought.id)).catch(() => undefined);
    }
    return Response.json({ thought }, { status: 201 });
  };
}

export async function POST(request: Request) {
  return createThoughtAction(getDatabase().db)(request);
}
