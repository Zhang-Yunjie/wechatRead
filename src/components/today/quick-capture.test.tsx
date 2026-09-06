import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { QuickCapture } from "./quick-capture";

describe("QuickCapture", () => {
  afterEach(() => vi.restoreAllMocks());

  it("focuses the thought field with Meta+K", () => {
    render(<QuickCapture bookTitle="置身事内" />);

    fireEvent.keyDown(window, { key: "k", metaKey: true });

    expect(screen.getByPlaceholderText("刚才哪句话让你停了一下？")).toHaveFocus();
  });

  it("clears the original thought only after it is saved", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ thought: { id: "1" } }), { status: 201 }));
    render(<QuickCapture bookTitle="置身事内" />);
    const field = screen.getByPlaceholderText("刚才哪句话让你停了一下？");
    fireEvent.change(field, { target: { value: "这个论点忽略了地方差异" } });

    fireEvent.keyDown(field, { key: "Enter", metaKey: true });

    await waitFor(() => expect(field).toHaveValue(""));
    expect(screen.getByText("已经留下来了")).toBeInTheDocument();
  });

  it("keeps the original thought when saving fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ error: "保存失败" }), { status: 500 }));
    render(<QuickCapture bookTitle="置身事内" />);
    const field = screen.getByPlaceholderText("刚才哪句话让你停了一下？");
    fireEvent.change(field, { target: { value: "不要丢掉我" } });

    fireEvent.click(screen.getByRole("button", { name: "记下来" }));

    await waitFor(() => expect(screen.getByText("保存没有完成，原文仍在输入框里")).toBeInTheDocument());
    expect(field).toHaveValue("不要丢掉我");
  });
});
