import type { ReadingDb } from "@/db/client";
import { createBookRepository } from "@/db/repositories/books";

export function getLibraryData(db: ReadingDb) {
  return createBookRepository(db).list();
}
