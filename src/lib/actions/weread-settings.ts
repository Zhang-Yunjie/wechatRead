import { z } from "zod";
import { getConfiguredWeReadClient } from "@/integrations/weread/client";
import type { WeReadCaller } from "@/integrations/weread/types";
import {
  clearLocalWeReadKey,
  getWeReadCredentialStatus,
  saveLocalWeReadKey,
  type WeReadCredentialStatus,
} from "@/lib/local-secrets";

type Dependencies = {
  saveKey: (apiKey: string) => void;
  clearKey: () => void;
  getStatus: () => WeReadCredentialStatus;
  createClient: () => WeReadCaller;
};

const inputSchema = z.object({ apiKey: z.string().trim().min(1).max(2_000) });

const defaultDependencies: Dependencies = {
  saveKey: saveLocalWeReadKey,
  clearKey: clearLocalWeReadKey,
  getStatus: getWeReadCredentialStatus,
  createClient: getConfiguredWeReadClient,
};

export function createWeReadSettingsActions(dependencies: Dependencies = defaultDependencies) {
  return {
    async save(request: Request) {
      const parsed = inputSchema.safeParse(await request.json().catch(() => null));
      if (!parsed.success) return Response.json({ error: "请输入有效的微信读书 API Key" }, { status: 400 });
      try {
        dependencies.saveKey(parsed.data.apiKey);
        return Response.json(dependencies.getStatus());
      } catch {
        return Response.json({ error: "本地配置保存失败" }, { status: 500 });
      }
    },

    async clear() {
      try {
        dependencies.clearKey();
        return Response.json(dependencies.getStatus());
      } catch {
        return Response.json({ error: "本地配置清除失败" }, { status: 500 });
      }
    },

    async test() {
      if (!dependencies.getStatus().configured) {
        return Response.json({ error: "请先保存微信读书 API Key" }, { status: 400 });
      }
      try {
        await dependencies.createClient().call("/shelf/sync");
        return Response.json({ ok: true, message: "连接成功，可以同步微信读书" });
      } catch {
        return Response.json({ error: "微信读书连接失败，请检查 API Key 和网络" }, { status: 502 });
      }
    },
  };
}
