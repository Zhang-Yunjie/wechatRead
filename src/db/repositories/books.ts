import { eq } from "drizzle-orm";
import type { ReadingDb } from "../client";
import { books } from "../schema";

export type ReadingRole = "none" | "main" | "side";
export type ImportedBook = {
  id: string;
  title: string;
  author?: string;
  coverUrl?: string | null;
  category?: string | null;
  intro?: string | null;
  isbn?: string | null;
  wordCount?: number | null;
  deepLink?: string | null;
  progress?: number | null;
  readUpdateTime?: number | null;
  finishTime?: number | null;
};

export function createBookRepository(db: ReadingDb) {
  return {
    async upsertImported(book: ImportedBook) {
      const now = Date.now();
      await db.insert(books).values({ ...book, author: book.author ?? "", createdAt: now, updatedAt: now })
        .onConflictDoUpdate({
          target: books.id,
          set: {
            title: book.title,
            author: book.author ?? "",
            coverUrl: book.coverUrl,
            category: book.category,
            intro: book.intro,
            isbn: book.isbn,
            wordCount: book.wordCount,
            deepLink: book.deepLink,
            progress: book.progress,
            readUpdateTime: book.readUpdateTime,
            finishTime: book.finishTime,
            updatedAt: now,
          },
        });
      return db.query.books.findFirst({ where: eq(books.id, book.id) });
    },
    async setRole(bookId: string, role: ReadingRole) {
      db.transaction((tx) => {
        if (role === "main") tx.update(books).set({ readingRole: "none", updatedAt: Date.now() }).where(eq(books.readingRole, "main")).run();
        tx.update(books).set({ readingRole: role, updatedAt: Date.now() }).where(eq(books.id, bookId)).run();
      });
    },
    async getMain() {
      return db.query.books.findFirst({ where: eq(books.readingRole, "main") });
    },
    async getById(bookId: string) {
      return db.query.books.findFirst({ where: eq(books.id, bookId) });
    },
    async list() {
      return db.query.books.findMany({ orderBy: (book, { desc }) => [desc(book.readUpdateTime), desc(book.updatedAt)] });
    },
    async listByRole(role: Exclude<ReadingRole, "none">) {
      return db.query.books.findMany({ where: eq(books.readingRole, role) });
    },
  };
}
