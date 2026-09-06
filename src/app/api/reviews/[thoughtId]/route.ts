import { z } from "zod";
import { getDatabase } from "@/db/client";
import { createThoughtRepository } from "@/db/repositories/thoughts";

const reviewSchema = z.object({
  outcome: z.enum(["agreed", "changed", "completed", "skipped"]),
  note: z.string().max(5_000).optional(),
});

export async function PATCH(request: Request, context: { params: Promise<{ thoughtId: string }> }) {
  const input = reviewSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return Response.json({ error: "回顾结果无效" }, { status: 400 });
  const { thoughtId } = await context.params;
  await createThoughtRepository(getDatabase().db).review(thoughtId, input.data.outcome, input.data.note);
  return Response.json({ ok: true });
}
