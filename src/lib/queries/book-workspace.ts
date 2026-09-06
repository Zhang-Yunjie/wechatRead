import { eq } from "drizzle-orm";
import type { ReadingDb } from "@/db/client";
import { books, highlights, reflections, resourceLinks, thoughts } from "@/db/schema";

export async function getBookWorkspaceData(db: ReadingDb, bookId: string) {
  const [book, bookThoughts, bookHighlights, bookReflections, resources] = await Promise.all([
    db.query.books.findFirst({ where: eq(books.id, bookId) }),
    db.query.thoughts.findMany({ where: eq(thoughts.bookId, bookId), orderBy: (row, { desc }) => [desc(row.createdAt)] }),
    db.query.highlights.findMany({ where: eq(highlights.bookId, bookId) }),
    db.query.reflections.findMany({ where: eq(reflections.bookId, bookId) }),
    db.query.resourceLinks.findMany({ where: eq(resourceLinks.bookId, bookId) }),
  ]);
  return { book: book ?? null, thoughts: bookThoughts, highlights: bookHighlights, reflections: bookReflections, resources };
}
