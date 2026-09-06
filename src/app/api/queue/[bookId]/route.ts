import { z } from "zod";
import { getDatabase } from "@/db/client";
import { createQueueRepository } from "@/db/repositories/queue";

const updateSchema = z.object({ reason: z.string().max(1_000) });

export async function PATCH(request: Request, context: { params: Promise<{ bookId: string }> }) {
  const input = updateSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return Response.json({ error: "想读原因无效" }, { status: 400 });
  const { bookId } = await context.params;
  await createQueueRepository(getDatabase().db).updateReason(bookId, input.data.reason);
  return Response.json({ ok: true });
}
