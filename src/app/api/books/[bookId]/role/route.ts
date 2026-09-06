import { z } from "zod";
import { getDatabase } from "@/db/client";
import { createBookRepository } from "@/db/repositories/books";

const roleSchema = z.object({ role: z.enum(["none", "main", "side"]) });

export async function PATCH(request: Request, context: { params: Promise<{ bookId: string }> }) {
  const input = roleSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return Response.json({ error: "阅读角色无效" }, { status: 400 });
  const { bookId } = await context.params;
  await createBookRepository(getDatabase().db).setRole(bookId, input.data.role);
  return Response.json({ ok: true });
}
