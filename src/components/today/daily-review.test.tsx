import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DailyReview } from "./daily-review";

describe("DailyReview", () => {
  afterEach(() => vi.restoreAllMocks());

  it("moves to a completed state after confirming an old thought", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    render(<DailyReview thoughts={[{ id: "t1", rawContent: "增长不一定等于发展", createdAt: Date.now() - 2 * 86_400_000 }]} />);

    fireEvent.click(screen.getByRole("button", { name: "仍然认同" }));

    await waitFor(() => expect(screen.getByText("今天的回顾完成了")).toBeInTheDocument());
  });
});
