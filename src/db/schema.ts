import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const timestamps = {
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
  updatedAt: integer("updated_at").notNull().$defaultFn(() => Date.now()),
};

export const books = sqliteTable("books", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author").notNull().default(""),
  coverUrl: text("cover_url"),
  category: text("category"),
  intro: text("intro"),
  isbn: text("isbn"),
  wordCount: integer("word_count"),
  deepLink: text("deep_link"),
  progress: integer("progress"),
  readUpdateTime: integer("read_update_time"),
  finishTime: integer("finish_time"),
  readingRole: text("reading_role", { enum: ["none", "main", "side"] }).notNull().default("none"),
  localStatus: text("local_status", { enum: ["library", "paused", "finished", "abandoned"] }).notNull().default("library"),
  ...timestamps,
});

export const queueItems = sqliteTable("queue_items", {
  id: text("id").primaryKey(),
  bookId: text("book_id").notNull().references(() => books.id, { onDelete: "cascade" }),
  lane: text("lane", { enum: ["main", "side", "quick"] }).notNull(),
  position: integer("position").notNull(),
  reason: text("reason").notNull().default(""),
  ...timestamps,
}, (table) => [uniqueIndex("queue_book_unique").on(table.bookId)]);

export const thoughts = sqliteTable("thoughts", {
  id: text("id").primaryKey(),
  bookId: text("book_id").references(() => books.id, { onDelete: "set null" }),
  rawContent: text("raw_content").notNull(),
  suggestedType: text("suggested_type"),
  suggestedTopics: text("suggested_topics"),
  enrichmentState: text("enrichment_state", { enum: ["pending", "complete", "failed", "skipped"] }).notNull().default("pending"),
  reviewState: text("review_state", { enum: ["pending", "agreed", "changed", "completed", "skipped"] }).notNull().default("pending"),
  reviewNote: text("review_note"),
  lastReviewedAt: integer("last_reviewed_at"),
  snoozedUntil: integer("snoozed_until"),
  ...timestamps,
});

export const highlights = sqliteTable("highlights", {
  id: text("id").primaryKey(),
  bookId: text("book_id").notNull().references(() => books.id, { onDelete: "cascade" }),
  chapterUid: integer("chapter_uid"),
  chapterTitle: text("chapter_title"),
  markText: text("mark_text").notNull(),
  range: text("range"),
  colorStyle: integer("color_style"),
  sourceCreatedAt: integer("source_created_at"),
  ...timestamps,
});

export const reflections = sqliteTable("reflections", {
  id: text("id").primaryKey(),
  bookId: text("book_id").notNull().references(() => books.id, { onDelete: "cascade" }),
  stage: text("stage", { enum: ["before", "during", "after"] }).notNull(),
  prompt: text("prompt"),
  content: text("content").notNull(),
  progressSnapshot: integer("progress_snapshot"),
  ...timestamps,
});

export const resourceLinks = sqliteTable("resource_links", {
  id: text("id").primaryKey(),
  bookId: text("book_id").references(() => books.id, { onDelete: "cascade" }),
  thoughtId: text("thought_id").references(() => thoughts.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  url: text("url").notNull(),
  type: text("type", { enum: ["article", "paper", "video", "other"] }).notNull().default("article"),
  relationship: text("relationship").notNull().default(""),
  ...timestamps,
});

export const bookProfiles = sqliteTable("book_profiles", {
  bookId: text("book_id").primaryKey().references(() => books.id, { onDelete: "cascade" }),
  estimatedMinutes: integer("estimated_minutes"),
  intensity: text("intensity", { enum: ["light", "moderate", "deep"] }),
  continuity: text("continuity", { enum: ["fragmented", "flexible", "continuous"] }),
  styleTags: text("style_tags"),
  explanation: text("explanation"),
  source: text("source", { enum: ["ai", "manual"] }).notNull().default("ai"),
  ...timestamps,
});

export const syncRuns = sqliteTable("sync_runs", {
  id: text("id").primaryKey(),
  status: text("status", { enum: ["running", "success", "partial", "failed"] }).notNull(),
  startedAt: integer("started_at").notNull(),
  finishedAt: integer("finished_at"),
  summary: text("summary"),
  errorMessage: text("error_message"),
});
