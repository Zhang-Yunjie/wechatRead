"use client";

import { useState } from "react";

export function ReflectionEditor({ bookId }: { bookId: string }) {
  const [content, setContent] = useState("");
  const [stage, setStage] = useState<"before" | "during" | "after">("during");
  async function save() {
    if (!content.trim()) return;
    const response = await fetch(`/api/books/${bookId}/reflections`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ stage, content }) });
    if (response.ok) { setContent(""); window.location.reload(); }
  }
  return <section className="workspace-panel reflection-editor"><p className="eyebrow">补一次阶段复盘</p><div className="mt-4 flex gap-2">{(["before", "during", "after"] as const).map((value) => <button className={stage === value ? "segment segment--active" : "segment"} key={value} onClick={() => setStage(value)}>{value === "before" ? "读前" : value === "during" ? "读中" : "读后"}</button>)}</div><textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="这一阶段，自己的问题发生了什么变化？" rows={4} /><button className="primary-button mt-4" onClick={() => void save()}>保存复盘</button></section>;
}
