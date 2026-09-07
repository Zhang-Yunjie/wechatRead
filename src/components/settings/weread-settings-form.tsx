"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, CircleAlert, KeyRound, LoaderCircle } from "lucide-react";
import type { WeReadCredentialStatus } from "@/lib/local-secrets";

type Feedback = { tone: "success" | "error"; message: string } | null;

async function readResponse(response: Response) {
  const result = await response.json().catch(() => ({})) as Partial<WeReadCredentialStatus> & { error?: string; message?: string };
  if (!response.ok) throw new Error(result.error || "操作失败，请稍后重试");
  return result;
}

export function WeReadSettingsForm({ initialStatus }: { initialStatus: WeReadCredentialStatus }) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [apiKey, setApiKey] = useState("");
  const [pending, setPending] = useState<"save" | "test" | "clear" | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!apiKey.trim() || pending) return;
    setPending("save");
    setFeedback(null);
    try {
      const result = await readResponse(await fetch("/api/settings/weread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      }));
      setStatus(result as WeReadCredentialStatus);
      setApiKey("");
      setFeedback({ tone: "success", message: "配置已保存并立即生效" });
      router.refresh();
    } catch (error) {
      setFeedback({ tone: "error", message: error instanceof Error ? error.message : "配置保存失败" });
    } finally {
      setPending(null);
    }
  }

  async function testConnection() {
    if (pending) return;
    setPending("test");
    setFeedback(null);
    try {
      const result = await readResponse(await fetch("/api/settings/weread/test", { method: "POST" }));
      setFeedback({ tone: "success", message: result.message || "连接成功" });
    } catch (error) {
      setFeedback({ tone: "error", message: error instanceof Error ? error.message : "连接失败" });
    } finally {
      setPending(null);
    }
  }

  async function clear() {
    if (pending || !window.confirm("清除页面保存的微信读书 API Key？")) return;
    setPending("clear");
    setFeedback(null);
    try {
      const result = await readResponse(await fetch("/api/settings/weread", { method: "DELETE" }));
      setStatus(result as WeReadCredentialStatus);
      setFeedback({ tone: "success", message: result.configured ? "页面配置已清除，已回退到环境变量" : "页面配置已清除" });
      router.refresh();
    } catch (error) {
      setFeedback({ tone: "error", message: error instanceof Error ? error.message : "配置清除失败" });
    } finally {
      setPending(null);
    }
  }

  const sourceText = status.source === "local" ? "页面配置" : status.source === "environment" ? "环境变量" : null;

  return (
    <section className="connection-card weread-settings-card">
      <div className="flex items-center justify-between">
        <p className="eyebrow">微信读书</p>
        {status.configured ? <CheckCircle2 size={18} className="text-[var(--forest)]" /> : <CircleAlert size={18} className="text-[var(--brass)]" />}
      </div>
      <h2>{status.configured ? "微信读书已配置" : "微信读书尚未配置"}</h2>
      {status.configured && <p className="secret-status"><span>{status.maskedKey}</span><small>来自{sourceText}</small></p>}
      <form className="secret-form" onSubmit={save}>
        <label htmlFor="weread-api-key">微信读书 API Key</label>
        <div className="secret-input-wrap">
          <KeyRound size={15} />
          <input id="weread-api-key" type="password" value={apiKey} onChange={(event) => setApiKey(event.target.value)} placeholder={status.configured ? "输入新 Key 可替换当前配置" : "粘贴你的 API Key"} autoComplete="off" spellCheck={false} />
        </div>
        <p>保存到仅当前用户可读的本地文件，不进入阅读数据库。</p>
        <div className="secret-actions">
          <button className="primary-button" type="submit" disabled={!apiKey.trim() || Boolean(pending)}>{pending === "save" && <LoaderCircle size={13} className="spin" />}保存配置</button>
          <button className="secondary-button" type="button" onClick={testConnection} disabled={!status.configured || Boolean(pending)}>{pending === "test" && <LoaderCircle size={13} className="spin" />}测试连接</button>
          {status.source === "local" && <button className="secret-clear" type="button" onClick={clear} disabled={Boolean(pending)}>清除配置</button>}
        </div>
      </form>
      {feedback && <p className={`secret-feedback secret-feedback--${feedback.tone}`} role="status">{feedback.message}</p>}
    </section>
  );
}
