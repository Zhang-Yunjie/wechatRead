import { desc } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import { syncRuns } from "@/db/schema";
import { hasAIConfiguration } from "@/integrations/ai/client";

export async function GET() {
  const lastSync = (await getDatabase().db.select().from(syncRuns).orderBy(desc(syncRuns.startedAt)).limit(1))[0] ?? null;
  return Response.json({ wereadConfigured: Boolean(process.env.WEREAD_API_KEY?.trim()), aiConfigured: hasAIConfiguration(), databasePath: process.env.READING_DB_PATH ?? "data/reading.db", lastSync: lastSync ? { status: lastSync.status, finishedAt: lastSync.finishedAt } : null });
}
