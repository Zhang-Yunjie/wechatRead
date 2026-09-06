import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import * as schema from "./schema";
import { migrate } from "./migrate";

export function createDatabase(filename: string) {
  if (filename !== ":memory:") fs.mkdirSync(path.dirname(filename), { recursive: true });
  const sqlite = new Database(filename);
  migrate(sqlite);
  return { sqlite, db: drizzle(sqlite, { schema }) };
}

export type ReadingDatabase = ReturnType<typeof createDatabase>;
export type ReadingDb = ReadingDatabase["db"];

let singleton: ReadingDatabase | undefined;

export function getDatabase() {
  singleton ??= createDatabase(process.env.READING_DB_PATH ?? "data/reading.db");
  return singleton;
}
