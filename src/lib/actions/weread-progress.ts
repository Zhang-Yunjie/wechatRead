import { z } from "zod";
import { getDatabase } from "@/db/client";
import { getConfiguredWeReadClient } from "@/integrations/weread/client";
import { refreshBookProgresses, type BookProgressRefreshResult } from "@/integrations/weread/progress";
import { getWeReadCredentialStatus, type WeReadCredentialStatus } from "@/lib/local-secrets";

type Dependencies = {
  getStatus: () => WeReadCredentialStatus;
  refreshProgresses: (bookIds: string[]) => Promise<BookProgressRefreshResult>;
};

const requestSchema = z.object({
  bookIds: z.array(z.string().trim().min(1)).min(1).max(100),
});

const defaultDependencies: Dependencies = {
  getStatus: getWeReadCredentialStatus,
  refreshProgresses: (bookIds) => refreshBookProgresses(getDatabase().db, getConfiguredWeReadClient(), bookIds),
};

export function createWeReadProgressActions(dependencies: Dependencies = defaultDependencies) {
  return {
    async refresh(request: Request) {
      const parsed = requestSchema.safeParse(await request.json().catch(() => null));
      if (!parsed.success) return Response.json({ error: "请选择需要刷新进度的书籍" }, { status: 400 });
      if (!dependencies.getStatus().configured) {
        return Response.json({ error: "请先在设置页配置微信读书 API Key" }, { status: 503 });
      }
      try {
        return Response.json(await dependencies.refreshProgresses(parsed.data.bookIds));
      } catch {
        return Response.json({ error: "微信读书进度刷新失败" }, { status: 502 });
      }
    },
  };
}
