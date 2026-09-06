import { getDatabase } from "@/db/client";
import { getConfiguredWeReadClient } from "@/integrations/weread/client";
import { syncWeRead } from "@/integrations/weread/sync";

export async function POST() {
  if (!process.env.WEREAD_API_KEY?.trim()) return Response.json({ error: "请先在 .env.local 配置 WEREAD_API_KEY" }, { status: 503 });
  const result = await syncWeRead(getDatabase().db, getConfiguredWeReadClient());
  return Response.json(result, { status: result.status === "failed" ? 502 : 200 });
}
