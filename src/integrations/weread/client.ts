import type { WeReadCaller } from "./types";
import { resolveWeReadKey } from "@/lib/local-secrets";

const GATEWAY = "https://i.weread.qq.com/api/agent/gateway";

export function createWeReadClient(options: {
  apiKey?: string;
  apiKeyResolver?: () => string | undefined;
  skillVersion?: string;
  fetcher?: typeof fetch;
}): WeReadCaller {
  const staticApiKey = options.apiKey?.trim();
  const skillVersion = options.skillVersion?.trim() || "1.0.4";
  const fetcher = options.fetcher ?? fetch;

  return {
    async call<T>(apiName: string, params: Record<string, unknown> = {}) {
      const apiKey = options.apiKeyResolver?.()?.trim() || staticApiKey;
      if (!apiKey) throw new Error("尚未配置微信读书 API Key");
      const response = await fetcher(GATEWAY, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ api_name: apiName, ...params, skill_version: skillVersion }),
      });
      if (!response.ok) throw new Error(`微信读书连接失败（${response.status}）`);
      const data = await response.json() as { errcode?: number; errmsg?: string; upgrade_info?: { message?: string } } & T;
      if (data.upgrade_info?.message) throw new Error(data.upgrade_info.message);
      if (data.errcode && data.errcode !== 0) throw new Error(data.errmsg || `微信读书返回错误 ${data.errcode}`);
      return data;
    },
  };
}

export function getConfiguredWeReadClient(options: { keyResolver?: () => string | undefined; fetcher?: typeof fetch } = {}) {
  return createWeReadClient({
    apiKeyResolver: options.keyResolver ?? resolveWeReadKey,
    skillVersion: process.env.WEREAD_SKILL_VERSION,
    fetcher: options.fetcher,
  });
}
