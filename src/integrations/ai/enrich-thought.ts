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
