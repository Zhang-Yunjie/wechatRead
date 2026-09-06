import { z } from "zod";
import { getDatabase } from "@/db/client";
import { resourceLinks } from "@/db/schema";

const schema = z.object({ title: z.string().trim().min(1).max(500), url: z.url(), type: z.enum(["article", "paper", "video", "other"]), relationship: z.string().max(1_000).default("") });
export async function POST(request: Request, context: { params: Promise<{ bookId: string }> }) {
  const input = schema.safeParse(await request.json().catch(() => null));
  if (!input.success) return Response.json({ error: "资料链接无效" }, { status: 400 });
  const { bookId } = await context.params; const now = Date.now();
  await getDatabase().db.insert(resourceLinks).values({ id: crypto.randomUUID(), bookId, ...input.data, createdAt: now, updatedAt: now });
  return Response.json({ ok: true }, { status: 201 });
}
