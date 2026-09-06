import { eq } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import { thoughts } from "@/db/schema";
import { classifyThought } from "@/integrations/ai/classify-thought";
import { getConfiguredAIClient, hasAIConfiguration } from "@/integrations/ai/client";

export async function enrichThought(thoughtId: string) {
  if (!hasAIConfiguration()) return null;
  const db = getDatabase().db;
  const thought = await db.query.thoughts.findFirst({ where: eq(thoughts.id, thoughtId) });
  if (!thought || thought.source !== "local") return null;
  try {
    const result = await classifyThought(thought.rawContent, getConfiguredAIClient());
    await db.update(thoughts).set({ suggestedType: result.type, suggestedTopics: JSON.stringify(result.topics), enrichmentState: "complete", updatedAt: Date.now() }).where(eq(thoughts.id, thoughtId));
    return result;
  } catch (error) {
    await db.update(thoughts).set({ enrichmentState: "failed", updatedAt: Date.now() }).where(eq(thoughts.id, thoughtId));
    throw error;
  }
}

export async function POST(_request: Request, context: { params: Promise<{ thoughtId: string }> }) {
  if (!hasAIConfiguration()) return Response.json({ error: "请先配置 AI API Key 和模型" }, { status: 503 });
  const { thoughtId } = await context.params;
  try { return Response.json({ enrichment: await enrichThought(thoughtId) }); }
  catch (error) { return Response.json({ error: error instanceof Error ? error.message : "想法分类失败" }, { status: 502 }); }
}
