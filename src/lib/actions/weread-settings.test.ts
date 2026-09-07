import { describe, expect, it, vi } from "vitest";
import type { WeReadCredentialStatus } from "@/lib/local-secrets";
import type { WeReadCaller } from "@/integrations/weread/types";
import { createWeReadSettingsActions } from "./weread-settings";

const localStatus: WeReadCredentialStatus = {
  configured: true,
  source: "local",
  maskedKey: "••••5678",
};

function dependencies(client: WeReadCaller = { call: vi.fn().mockResolvedValue({ books: [] }) }) {
  return {
    saveKey: vi.fn(),
    clearKey: vi.fn(),
    getStatus: vi.fn(() => localStatus),
    createClient: vi.fn(() => client),
  };
}

describe("WeRead settings actions", () => {
  it("saves a key and returns only masked status", async () => {
    const deps = dependencies();
    const actions = createWeReadSettingsActions(deps);
    const submittedKey = "wrk-local-12345678";

    const response = await actions.save(new Request("http://localhost/api/settings/weread", {
      method: "POST",
      body: JSON.stringify({ apiKey: submittedKey }),
    }));
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(deps.saveKey).toHaveBeenCalledWith(submittedKey);
    expect(JSON.parse(body)).toEqual(localStatus);
    expect(body).not.toContain(submittedKey);
  });

  it("rejects an empty key", async () => {
    const actions = createWeReadSettingsActions(dependencies());
    const response = await actions.save(new Request("http://localhost/api/settings/weread", {
      method: "POST",
      body: JSON.stringify({ apiKey: " " }),
    }));

    expect(response.status).toBe(400);
  });

  it("clears the local key and returns the remaining credential status", async () => {
    const deps = dependencies();
    deps.getStatus.mockReturnValue({ configured: false, source: null, maskedKey: null });
    const response = await createWeReadSettingsActions(deps).clear();

    expect(deps.clearKey).toHaveBeenCalledOnce();
    expect(await response.json()).toEqual({ configured: false, source: null, maskedKey: null });
  });

  it("tests a read-only call without leaking connection errors", async () => {
    const call = vi.fn().mockRejectedValue(new Error("invalid wrk-local-12345678"));
    const actions = createWeReadSettingsActions(dependencies({ call }));

    const response = await actions.test();
    const body = await response.text();

    expect(call).toHaveBeenCalledWith("/shelf/sync");
    expect(response.status).toBe(502);
    expect(body).toContain("请检查 API Key 和网络");
    expect(body).not.toContain("wrk-local-12345678");
  });
});
