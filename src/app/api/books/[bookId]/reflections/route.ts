import { z } from "zod";
import { getDatabase } from "@/db/client";
import { reflections } from "@/db/schema";

const schema = z.object({ stage: z.enum(["before", "during", "after"]), content: z.string().trim().min(1).max(20_000) });
export async function POST(request: Request, context: { params: Promise<{ bookId: string }> }) {
  const input = schema.safeParse(await request.json().catch(() => null));
  if (!input.success) return Response.json({ error: "复盘内容无效" }, { status: 400 });
  const { bookId } = await context.params; const now = Date.now();
  await getDatabase().db.insert(reflections).values({ id: crypto.randomUUID(), bookId, ...input.data, createdAt: now, updatedAt: now });
  return Response.json({ ok: true }, { status: 201 });
}
