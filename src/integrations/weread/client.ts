import type { WeReadCaller } from "./types";

const GATEWAY = "https://i.weread.qq.com/api/agent/gateway";

export function createWeReadClient(options: {
  apiKey?: string;
  skillVersion?: string;
  fetcher?: typeof fetch;
}): WeReadCaller {
  const apiKey = options.apiKey?.trim();
  const skillVersion = options.skillVersion?.trim() || "1.0.4";
  const fetcher = options.fetcher ?? fetch;

  return {
    async call<T>(apiName: string, params: Record<string, unknown> = {}) {
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

export function getConfiguredWeReadClient() {
  return createWeReadClient({ apiKey: process.env.WEREAD_API_KEY, skillVersion: process.env.WEREAD_SKILL_VERSION });
}
