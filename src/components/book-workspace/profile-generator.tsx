"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

export function ProfileGenerator({ bookId }: { bookId: string }) {
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  async function generate() {
    setState("loading"); const response = await fetch(`/api/books/${bookId}/profile`, { method: "POST" });
    if (response.ok) window.location.reload(); else setState("error");
  }
  return <div><button className="tiny-button" onClick={() => void generate()} disabled={state === "loading"}><Sparkles size={12} />{state === "loading" ? "正在生成…" : "生成阅读体感"}</button>{state === "error" ? <p className="mt-2 text-[10px] text-[#9b3f34]">检查设置中的 AI 配置</p> : null}</div>;
}
