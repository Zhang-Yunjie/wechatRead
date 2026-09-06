import { z } from "zod";
import { getDatabase } from "@/db/client";
import { createQueueRepository } from "@/db/repositories/queue";

const addSchema = z.object({
  bookId: z.string().min(1),
  lane: z.enum(["main", "side", "quick"]),
  reason: z.string().max(1_000).optional(),
});

export async function POST(request: Request) {
  const input = addSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return Response.json({ error: "队列信息无效" }, { status: 400 });
  await createQueueRepository(getDatabase().db).add(input.data);
  return Response.json({ ok: true }, { status: 201 });
}
