import { asc, eq } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import { books, queueItems } from "@/db/schema";
import { QueueBoard } from "@/components/queue/queue-board";

export default async function QueuePage() {
  const items = await getDatabase().db.select({
    id: queueItems.id, bookId: queueItems.bookId, lane: queueItems.lane, position: queueItems.position,
    reason: queueItems.reason, title: books.title, author: books.author, coverUrl: books.coverUrl,
  }).from(queueItems).innerJoin(books, eq(queueItems.bookId, books.id)).orderBy(asc(queueItems.lane), asc(queueItems.position));
  return (
    <div className="page-frame">
      <header className="page-header"><div><p className="eyebrow">READING ORDER</p><h1>接下来读什么</h1><p className="page-intro">排序不是承诺，是此刻的方向。拖动书籍，保留你当初想读它的理由。</p></div></header>
      <QueueBoard items={items} />
    </div>
  );
}
