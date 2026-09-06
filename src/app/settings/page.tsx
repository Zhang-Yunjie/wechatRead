import { desc } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import { syncRuns } from "@/db/schema";
import { hasAIConfiguration } from "@/integrations/ai/client";
import { SettingsPageView } from "./settings-page-view";

export default async function SettingsPage() {
  const lastSync = (await getDatabase().db.select().from(syncRuns).orderBy(desc(syncRuns.startedAt)).limit(1))[0] ?? null;
  const status = { wereadConfigured: Boolean(process.env.WEREAD_API_KEY?.trim()), aiConfigured: hasAIConfiguration(), databasePath: process.env.READING_DB_PATH ?? "data/reading.db", lastSync: lastSync ? { status: lastSync.status, finishedAt: lastSync.finishedAt } : null };
  return <div className="page-frame"><header className="page-header"><div><p className="eyebrow">LOCAL SETUP</p><h1>设置与数据</h1><p className="page-intro">只显示连接状态，不会在页面中回显任何密钥。</p></div></header><div className="pt-8"><SettingsPageView status={status} /></div></div>;
}
