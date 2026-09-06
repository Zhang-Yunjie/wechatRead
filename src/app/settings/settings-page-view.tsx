import { ConnectionCard } from "@/components/settings/connection-card";
import { DataBoundary } from "@/components/settings/data-boundary";

export type AppStatus = { wereadConfigured: boolean; aiConfigured: boolean; databasePath: string; lastSync: { status: string; finishedAt: number | null } | null };
export function SettingsPageView({ status }: { status: AppStatus }) {
  return <><div className="settings-grid"><ConnectionCard title="微信读书" configured={status.wereadConfigured} configuredText="微信读书已配置" missingText="微信读书尚未配置"><p>在项目根目录的 <code>.env.local</code> 中设置 <code>WEREAD_API_KEY</code>。同步只会在你点击按钮时发生。</p></ConnectionCard><ConnectionCard title="AI 阅读体感" configured={status.aiConfigured} configuredText="AI 已配置" missingText="AI 尚未配置"><p>设置 <code>OPENAI_API_KEY</code>、<code>OPENAI_MODEL</code>，需要时也可设置兼容接口地址。</p></ConnectionCard><section className="connection-card"><p className="eyebrow">本地数据库</p><h2>阅读资料存放位置</h2><code className="path-code">{status.databasePath}</code><p className="mt-5 text-xs text-[var(--ink-soft)]">最近同步：{status.lastSync?.finishedAt ? new Date(status.lastSync.finishedAt).toLocaleString("zh-CN") : "尚未同步"}</p></section></div><DataBoundary /></>;
}
