import { createWeReadSettingsActions } from "@/lib/actions/weread-settings";

export async function POST() {
  return createWeReadSettingsActions().test();
}
