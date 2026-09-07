import { createWeReadSettingsActions } from "@/lib/actions/weread-settings";

export async function POST(request: Request) {
  return createWeReadSettingsActions().save(request);
}

export async function DELETE() {
  return createWeReadSettingsActions().clear();
}
