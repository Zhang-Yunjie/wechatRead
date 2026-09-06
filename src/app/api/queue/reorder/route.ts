import { z } from "zod";
import { getDatabase } from "@/db/client";
import { createQueueRepository } from "@/db/repositories/queue";

const reorderSchema = z.object({
  lane: z.enum(["main", "side", "quick"]),
  bookIds: z.array(z.string().min(1)),
});

export async function PATCH(request: Request) {
  const input = reorderSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return Response.json({ error: "队列顺序无效" }, { status: 400 });
  await createQueueRepository(getDatabase().db).reorder(input.data.lane, input.data.bookIds);
  return Response.json({ ok: true });
}
