"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";

export function SyncButton() {
  const [state, setState] = useState<"idle" | "syncing" | "success" | "partial" | "failed">("idle");
  const [message, setMessage] = useState("");
  async function sync() {
    setState("syncing"); setMessage("");
    const response = await fetch("/api/sync/weread", { method: "POST" });
    const data = await response.json();
    if (!response.ok) { setState("failed"); setMessage(data.error ?? "同步没有完成"); return; }
    setState(data.status); setMessage(`带回 ${data.importedBooks} 本书${data.importedNotes ? `、${data.importedNotes} 条笔记` : ""}`);
    window.setTimeout(() => window.location.reload(), 900);
  }
  return <div className="sync-control"><button className="secondary-button" onClick={() => void sync()} disabled={state === "syncing"}><RefreshCw size={14} className={state === "syncing" ? "animate-spin" : ""} />{state === "syncing" ? "正在同步…" : "同步微信读书"}</button>{message ? <span className={state === "failed" ? "sync-message sync-message--error" : "sync-message"}>{message}</span> : null}</div>;
}
