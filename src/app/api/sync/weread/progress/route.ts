import { createWeReadProgressActions } from "@/lib/actions/weread-progress";

export async function POST(request: Request) {
  return createWeReadProgressActions().refresh(request);
}
