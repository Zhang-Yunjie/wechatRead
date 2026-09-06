import { eq } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import { bookProfiles, books } from "@/db/schema";
import { generateBookProfile } from "@/integrations/ai/book-profile";
import { getConfiguredAIClient, hasAIConfiguration } from "@/integrations/ai/client";

export async function POST(_request: Request, context: { params: Promise<{ bookId: string }> }) {
  if (!hasAIConfiguration()) return Response.json({ error: "请先配置 AI API Key 和模型" }, { status: 503 });
  const { bookId } = await context.params; const db = getDatabase().db;
  const book = await db.query.books.findFirst({ where: eq(books.id, bookId) });
  if (!book) return Response.json({ error: "没有找到这本书" }, { status: 404 });
  try {
    const profile = await generateBookProfile(book, getConfiguredAIClient()); const now = Date.now();
    await db.insert(bookProfiles).values({ bookId, ...profile, styleTags: JSON.stringify(profile.styleTags), source: "ai", createdAt: now, updatedAt: now })
      .onConflictDoUpdate({ target: bookProfiles.bookId, set: { ...profile, styleTags: JSON.stringify(profile.styleTags), source: "ai", updatedAt: now } });
    return Response.json({ profile });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "阅读体感生成失败" }, { status: 502 });
  }
}
