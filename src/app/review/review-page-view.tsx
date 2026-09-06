import { EmptyState } from "@/components/empty-state";
import { DailyReview } from "@/components/today/daily-review";
import { StatusPill } from "@/components/status-pill";

type Thought = { id: string; rawContent: string; reviewState: string; createdAt: number; lastReviewedAt: number | null };
const stateLabel: Record<string, string> = { agreed: "仍然认同", changed: "观点变化", completed: "已沉淀", skipped: "暂时跳过" };
export function ReviewPageView({ due, reviewed }: { due: Thought[]; reviewed: Thought[] }) {
  return <div className="review-page-grid"><div>{due.length ? <DailyReview thoughts={due} /> : <EmptyState title="今天没有需要回看的想法" description="新的回声会在这里出现" />}</div><section className="review-archive"><div className="section-heading"><div><p className="eyebrow">回顾记录</p><h2>想法如何发生变化</h2></div><span>{reviewed.length} 条</span></div>{reviewed.length ? reviewed.map((thought) => <article key={thought.id}><StatusPill tone={thought.reviewState === "changed" ? "warning" : "success"}>{stateLabel[thought.reviewState] ?? thought.reviewState}</StatusPill><p>{thought.rawContent}</p><time>{thought.lastReviewedAt ? new Date(thought.lastReviewedAt).toLocaleDateString("zh-CN") : ""}</time></article>) : <p className="panel-empty">完成一次每日回顾后，变化会沉淀在这里。</p>}</section></div>;
}
