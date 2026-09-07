import { desc } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import { syncRuns } from "@/db/schema";
import { hasAIConfiguration } from "@/integrations/ai/client";
import { getWeReadCredentialStatus } from "@/lib/local-secrets";

export async function GET() {
  const lastSync = (await getDatabase().db.select().from(syncRuns).orderBy(desc(syncRuns.startedAt)).limit(1))[0] ?? null;
  return Response.json({ weread: getWeReadCredentialStatus(), aiConfigured: hasAIConfiguration(), databasePath: process.env.READING_DB_PATH ?? "data/reading.db", lastSync: lastSync ? { status: lastSync.status, finishedAt: lastSync.finishedAt } : null });
}
