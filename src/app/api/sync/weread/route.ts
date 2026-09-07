import { getDatabase } from "@/db/client";
import { getConfiguredWeReadClient } from "@/integrations/weread/client";
import { syncWeRead } from "@/integrations/weread/sync";
import { getWeReadCredentialStatus } from "@/lib/local-secrets";

export async function POST() {
  if (!getWeReadCredentialStatus().configured) return Response.json({ error: "请先在设置页配置微信读书 API Key" }, { status: 503 });
  const result = await syncWeRead(getDatabase().db, getConfiguredWeReadClient());
  return Response.json(result, { status: result.status === "failed" ? 502 : 200 });
}
