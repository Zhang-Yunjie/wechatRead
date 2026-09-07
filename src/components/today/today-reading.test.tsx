import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TodayReading } from "./today-reading";

afterEach(() => vi.restoreAllMocks());

describe("TodayReading", () => {
  it("refreshes every displayed book and updates its visible progress", async () => {
    const fetcher = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      progressByBookId: { main: 35, side: 62 },
      errors: [],
    }), { status: 200 }));

    render(<TodayReading
      mainBook={{ id: "main", title: "主线书", author: "作者", progress: 10 }}
      sideBooks={[{ id: "side", title: "支线书", author: "作者", progress: 20 }]}
    />);

    expect(await screen.findByText("35%")).toBeInTheDocument();
    expect(await screen.findByText("读到 62%")).toBeInTheDocument();
    expect(fetcher).toHaveBeenCalledWith(
      "/api/sync/weread/progress",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ bookIds: ["main", "side"] }),
      }),
    );
  });

  it("keeps local progress when the background refresh fails", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));

    render(<TodayReading
      mainBook={{ id: "main", title: "主线书", author: "作者", progress: 10 }}
      sideBooks={[{ id: "side", title: "支线书", author: "作者", progress: 20 }]}
    />);

    expect(await screen.findByRole("status")).toHaveTextContent("阅读进度更新失败，当前显示上次同步结果");
    expect(screen.getByText("10%")).toBeInTheDocument();
    expect(screen.getByText("读到 20%")).toBeInTheDocument();
  });

  it("does not request progress when no books are displayed", async () => {
    const fetcher = vi.spyOn(globalThis, "fetch");

    render(<TodayReading mainBook={null} sideBooks={[]} />);

    expect(screen.getByText("先选一本主线书")).toBeInTheDocument();
    await Promise.resolve();
    expect(fetcher).not.toHaveBeenCalled();
  });
});
