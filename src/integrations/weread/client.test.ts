import { describe, expect, it, vi } from "vitest";
import { createWeReadClient, getConfiguredWeReadClient } from "./client";

describe("WeRead client", () => {
  it("sends a flat gateway request with server-side authorization", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ books: [], albums: [] }), { status: 200 }));
    const client = createWeReadClient({ apiKey: "secret-key", skillVersion: "1.0.4", fetcher });

    await client.call("/shelf/sync", {});

    expect(fetcher).toHaveBeenCalledWith("https://i.weread.qq.com/api/agent/gateway", expect.objectContaining({
      method: "POST",
      headers: expect.objectContaining({ Authorization: "Bearer secret-key" }),
    }));
    expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual({ api_name: "/shelf/sync", skill_version: "1.0.4" });
  });

  it("surfaces a non-zero WeRead error without leaking the key", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ errcode: -1, errmsg: "invalid" }), { status: 200 }));
    const client = createWeReadClient({ apiKey: "secret-key", skillVersion: "1.0.4", fetcher });

    await expect(client.call("/shelf/sync", {})).rejects.toThrow("invalid");
    await expect(client.call("/shelf/sync", {})).rejects.not.toThrow("secret-key");
  });

  it("resolves the configured key when each request is made", async () => {
    let activeKey = "first-key";
    const fetcher = vi.fn().mockImplementation(async () => new Response(JSON.stringify({ books: [] }), { status: 200 }));
    const client = getConfiguredWeReadClient({ keyResolver: () => activeKey, fetcher });

    await client.call("/shelf/sync");
    activeKey = "second-key";
    await client.call("/shelf/sync");

    expect(fetcher.mock.calls[0][1].headers.Authorization).toBe("Bearer first-key");
    expect(fetcher.mock.calls[1][1].headers.Authorization).toBe("Bearer second-key");
  });
});
