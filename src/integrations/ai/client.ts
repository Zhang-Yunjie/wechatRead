export interface TextCompletionClient {
  complete(system: string, user?: string): Promise<string>;
}

export function createAIClient(options: { apiKey?: string; baseUrl?: string; model?: string; fetcher?: typeof fetch }): TextCompletionClient {
  const apiKey = options.apiKey?.trim();
  const model = options.model?.trim();
  const baseUrl = (options.baseUrl?.trim() || "https://api.openai.com/v1").replace(/\/$/, "");
  const fetcher = options.fetcher ?? fetch;
  return {
    async complete(system: string, user = "") {
      if (!apiKey || !model) throw new Error("尚未配置 AI API Key 或模型");
      const response = await fetcher(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model, temperature: 0.2, response_format: { type: "json_object" }, messages: [{ role: "system", content: system }, { role: "user", content: user }] }),
        signal: AbortSignal.timeout(30_000),
      });
      if (!response.ok) throw new Error(`AI 服务连接失败（${response.status}）`);
      const data = await response.json() as { choices?: { message?: { content?: string } }[] };
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error("AI 没有返回内容");
      return content;
    },
  };
}

export function getConfiguredAIClient() {
  return createAIClient({ apiKey: process.env.OPENAI_API_KEY, baseUrl: process.env.OPENAI_BASE_URL, model: process.env.OPENAI_MODEL });
}

export function hasAIConfiguration() {
  return Boolean(process.env.OPENAI_API_KEY?.trim() && process.env.OPENAI_MODEL?.trim());
}
