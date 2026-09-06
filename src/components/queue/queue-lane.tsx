"use client";

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { QueueCardData } from "./queue-board";
import { QueueCard } from "./queue-card";

const laneCopy = {
  main: { title: "主线候选", subtitle: "下一段需要持续投入的阅读" },
  side: { title: "支线候选", subtitle: "可以穿插、随时拾起的书" },
  quick: { title: "快速阅读池", subtitle: "两三个小时，换一种心情" },
};

export function QueueLane({ lane, items, onMove, onReason }: {
  lane: "main" | "side" | "quick";
  items: QueueCardData[];
  onMove: (bookId: string, direction: -1 | 1) => void;
  onReason: (bookId: string, reason: string) => void;
}) {
  return (
    <section className="queue-lane">
      <header className="queue-lane__header"><div><p className="eyebrow">{laneCopy[lane].title}</p><h2>{laneCopy[lane].subtitle}</h2></div><span>{items.length}</span></header>
      <SortableContext items={items.map((item) => item.bookId)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">{items.map((item, index) => <QueueCard key={item.bookId} item={item} index={index} total={items.length} onMove={(direction) => onMove(item.bookId, direction)} onReason={(reason) => onReason(item.bookId, reason)} />)}</div>
      </SortableContext>
      {!items.length ? <div className="queue-lane__empty">从书库放一本到这里</div> : null}
    </section>
  );
}
