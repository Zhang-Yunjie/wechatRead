"use client";

import { useState } from "react";
import { ArrowUp, Command } from "lucide-react";
import { useQuickCapture } from "@/hooks/use-quick-capture";

export function QuickCapture({ bookTitle }: { bookTitle?: string | null }) {
  const inputRef = useQuickCapture();
  const [content, setContent] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function save() {
    if (!content.trim() || state === "saving") return;
    setState("saving");
    try {
      const response = await fetch("/api/thoughts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error("save failed");
      setContent("");
      setState("saved");
      window.setTimeout(() => setState("idle"), 2200);
    } catch {
      setState("error");
    }
  }

  return (
    <section className="capture-card" aria-labelledby="capture-title">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">随手记</p>
          <h2 id="capture-title" className="mt-1 font-serif text-[27px]">留住刚才的念头</h2>
        </div>
        <span className="shortcut"><Command size={11} /> K</span>
      </div>
      <textarea
        ref={inputRef}
        value={content}
        onChange={(event) => { setContent(event.target.value); if (state !== "idle") setState("idle"); }}
        onKeyDown={(event) => {
          if (event.key === "Enter" && event.metaKey) { event.preventDefault(); void save(); }
        }}
        className="capture-input"
        placeholder="刚才哪句话让你停了一下？"
        rows={4}
      />
      <div className="mt-4 flex min-h-9 items-center justify-between gap-4">
        <p className="text-xs text-[var(--ink-faint)]">
          {state === "saved" ? "已经留下来了" : state === "error" ? "保存没有完成，原文仍在输入框里" : bookTitle ? `默认关联《${bookTitle}》` : "选择主线书后会自动关联"}
        </p>
        <button className="round-action" onClick={() => void save()} disabled={!content.trim() || state === "saving"} aria-label="记下来">
          <ArrowUp size={17} />
        </button>
      </div>
    </section>
  );
}
