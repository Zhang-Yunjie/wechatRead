import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { QueueBoard, type QueueCardData } from "./queue-board";

const books: QueueCardData[] = [
  { id: "q1", bookId: "book-a", lane: "main", position: 0, reason: "先补基础", title: "甲", author: "作者甲" },
  { id: "q2", bookId: "book-b", lane: "main", position: 1, reason: "继续深入", title: "乙", author: "作者乙" },
];

describe("QueueBoard", () => {
  afterEach(() => vi.restoreAllMocks());

  it("persists keyboard-accessible queue movement", async () => {
    const fetcher = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    render(<QueueBoard items={books} />);

    fireEvent.click(screen.getByRole("button", { name: "将乙上移" }));

    await waitFor(() => expect(fetcher).toHaveBeenCalled());
    expect(JSON.parse(String(fetcher.mock.calls[0][1]?.body))).toEqual({ lane: "main", bookIds: ["book-b", "book-a"] });
  });

  it("saves an edited reason", async () => {
    const fetcher = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    render(<QueueBoard items={books} />);
    const input = screen.getByLabelText("乙的想读原因");

    fireEvent.change(input, { target: { value: "通勤时读" } });
    fireEvent.blur(input);

    await waitFor(() => expect(fetcher).toHaveBeenCalled());
    expect(JSON.parse(String(fetcher.mock.calls[0][1]?.body))).toEqual({ reason: "通勤时读" });
  });
});
