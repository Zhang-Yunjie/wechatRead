import type Database from "better-sqlite3";

export function migrate(sqlite: Database.Database) {
  sqlite.exec(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, author TEXT NOT NULL DEFAULT '', cover_url TEXT,
      category TEXT, intro TEXT, isbn TEXT, word_count INTEGER, deep_link TEXT, progress INTEGER,
      read_update_time INTEGER, finish_time INTEGER, reading_role TEXT NOT NULL DEFAULT 'none',
      local_status TEXT NOT NULL DEFAULT 'library', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS queue_items (
      id TEXT PRIMARY KEY, book_id TEXT NOT NULL UNIQUE REFERENCES books(id) ON DELETE CASCADE,
      lane TEXT NOT NULL, position INTEGER NOT NULL, reason TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS thoughts (
      id TEXT PRIMARY KEY, book_id TEXT REFERENCES books(id) ON DELETE SET NULL, raw_content TEXT NOT NULL,
      suggested_type TEXT, suggested_topics TEXT, enrichment_state TEXT NOT NULL DEFAULT 'pending',
      review_state TEXT NOT NULL DEFAULT 'pending', review_note TEXT, last_reviewed_at INTEGER,
      snoozed_until INTEGER, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS highlights (
      id TEXT PRIMARY KEY, book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      chapter_uid INTEGER, chapter_title TEXT, mark_text TEXT NOT NULL, range TEXT, color_style INTEGER,
      source_created_at INTEGER, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS reflections (
      id TEXT PRIMARY KEY, book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      stage TEXT NOT NULL, prompt TEXT, content TEXT NOT NULL, progress_snapshot INTEGER,
      created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS resource_links (
      id TEXT PRIMARY KEY, book_id TEXT REFERENCES books(id) ON DELETE CASCADE,
      thought_id TEXT REFERENCES thoughts(id) ON DELETE CASCADE, title TEXT NOT NULL, url TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'article', relationship TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS book_profiles (
      book_id TEXT PRIMARY KEY REFERENCES books(id) ON DELETE CASCADE, estimated_minutes INTEGER,
      intensity TEXT, continuity TEXT, style_tags TEXT, explanation TEXT, source TEXT NOT NULL DEFAULT 'ai',
      created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sync_runs (
      id TEXT PRIMARY KEY, status TEXT NOT NULL, started_at INTEGER NOT NULL, finished_at INTEGER,
      summary TEXT, error_message TEXT
    );
  `);
}
