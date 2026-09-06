import { hasAIConfiguration } from "@/integrations/ai/client";
import { enrichThought } from "@/integrations/ai/enrich-thought";

export async function POST(_request: Request, context: { params: Promise<{ thoughtId: string }> }) {
  if (!hasAIConfiguration()) return Response.json({ error: "请先配置 AI API Key 和模型" }, { status: 503 });
  const { thoughtId } = await context.params;
  try { return Response.json({ enrichment: await enrichThought(thoughtId) }); }
  catch (error) { return Response.json({ error: error instanceof Error ? error.message : "想法分类失败" }, { status: 502 }); }
}
