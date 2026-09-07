import { describe, expect, it, vi } from "vitest";
import type { WeReadCredentialStatus } from "@/lib/local-secrets";
import { createWeReadProgressActions } from "./weread-progress";

const configured: WeReadCredentialStatus = {
  configured: true,
  source: "local",
  maskedKey: "••••5678",
};

function dependencies() {
  return {
    getStatus: vi.fn(() => configured),
    refreshProgresses: vi.fn().mockResolvedValue({
      progressByBookId: { b1: 47 },
      errors: [{ bookId: "b2", message: "暂时不可用" }],
    }),
  };
}

describe("WeRead progress actions", () => {
  it("refreshes valid requested book IDs", async () => {
    const deps = dependencies();
    const response = await createWeReadProgressActions(deps).refresh(new Request("http://localhost/api/sync/weread/progress", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ bookIds: ["b1", "b2"] }),
    }));

    expect(response.status).toBe(200);
    expect(deps.refreshProgresses).toHaveBeenCalledWith(["b1", "b2"]);
    expect(await response.json()).toEqual({
      progressByBookId: { b1: 47 },
      errors: [{ bookId: "b2", message: "暂时不可用" }],
    });
  });

  it.each([null, {}, { bookIds: [] }, { bookIds: [""] }])("rejects malformed input %#", async (body) => {
    const response = await createWeReadProgressActions(dependencies()).refresh(new Request("http://localhost/api/sync/weread/progress", {
      method: "POST",
      body: JSON.stringify(body),
    }));

    expect(response.status).toBe(400);
  });

  it("rejects requests when WeRead is not configured", async () => {
    const deps = dependencies();
    deps.getStatus.mockReturnValue({ configured: false, source: null, maskedKey: null });

    const response = await createWeReadProgressActions(deps).refresh(new Request("http://localhost/api/sync/weread/progress", {
      method: "POST",
      body: JSON.stringify({ bookIds: ["b1"] }),
    }));

    expect(response.status).toBe(503);
    expect(deps.refreshProgresses).not.toHaveBeenCalled();
  });
});
