import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WeReadSettingsForm } from "./weread-settings-form";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

describe("WeReadSettingsForm", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    refresh.mockReset();
  });

  it("shows a masked configured state without putting the key in the input", () => {
    render(<WeReadSettingsForm initialStatus={{ configured: true, source: "local", maskedKey: "••••5678" }} />);

    expect(screen.getByText("••••5678")).toBeInTheDocument();
    expect(screen.getByLabelText("微信读书 API Key")).toHaveAttribute("type", "password");
    expect(screen.getByLabelText("微信读书 API Key")).toHaveValue("");
  });

  it("saves a new key, clears the input, and shows feedback", async () => {
    const fetcher = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ configured: true, source: "local", maskedKey: "••••4321" }), { status: 200 }));
    render(<WeReadSettingsForm initialStatus={{ configured: false, source: null, maskedKey: null }} />);

    fireEvent.change(screen.getByLabelText("微信读书 API Key"), { target: { value: "wrk-test-87654321" } });
    fireEvent.click(screen.getByRole("button", { name: "保存配置" }));

    await screen.findByText("配置已保存并立即生效");
    expect(screen.getByLabelText("微信读书 API Key")).toHaveValue("");
    expect(fetcher).toHaveBeenCalledWith("/api/settings/weread", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ apiKey: "wrk-test-87654321" }),
    }));
    expect(refresh).toHaveBeenCalledOnce();
  });

  it("tests the saved connection", async () => {
    const fetcher = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ ok: true, message: "连接成功，可以同步微信读书" }), { status: 200 }));
    render(<WeReadSettingsForm initialStatus={{ configured: true, source: "local", maskedKey: "••••5678" }} />);

    fireEvent.click(screen.getByRole("button", { name: "测试连接" }));

    expect(await screen.findByText("连接成功，可以同步微信读书")).toBeInTheDocument();
    expect(fetcher).toHaveBeenCalledWith("/api/settings/weread/test", { method: "POST" });
  });

  it("requires confirmation before clearing the local key", async () => {
    const fetcher = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ configured: false, source: null, maskedKey: null }), { status: 200 }));
    const confirm = vi.spyOn(window, "confirm").mockReturnValueOnce(false).mockReturnValueOnce(true);
    render(<WeReadSettingsForm initialStatus={{ configured: true, source: "local", maskedKey: "••••5678" }} />);

    fireEvent.click(screen.getByRole("button", { name: "清除配置" }));
    expect(fetcher).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "清除配置" }));

    await waitFor(() => expect(fetcher).toHaveBeenCalledWith("/api/settings/weread", { method: "DELETE" }));
    expect(confirm).toHaveBeenCalledTimes(2);
  });
});
