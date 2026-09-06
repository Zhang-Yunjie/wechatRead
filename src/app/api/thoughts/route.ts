import { getDatabase } from "@/db/client";
import { createThoughtAction } from "@/lib/actions/thoughts";

export async function POST(request: Request) {
  return createThoughtAction(getDatabase().db)(request);
}
