"use client";
/* eslint-disable react-hooks/refs -- dnd-kit exposes callback refs and listeners for render-time wiring. */

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowDown, ArrowUp, GripVertical } from "lucide-react";
import { BookCover } from "@/components/book-cover";
import type { QueueCardData } from "./queue-board";

export function QueueCard({ item, index, total, onMove, onReason }: {
  item: QueueCardData;
  index: number;
  total: number;
  onMove: (direction: -1 | 1) => void;
  onReason: (reason: string) => void;
}) {
  const sortable = useSortable({ id: item.bookId, data: { lane: item.lane } });
  const style = { transform: CSS.Transform.toString(sortable.transform), transition: sortable.transition };
  return (
    <article ref={sortable.setNodeRef} style={style} className="queue-card">
      <button className="queue-card__grip" aria-label={`拖动${item.title}`} {...sortable.attributes} {...sortable.listeners}><GripVertical size={17} /></button>
      <span className="queue-card__rank">{String(index + 1).padStart(2, "0")}</span>
      <BookCover title={item.title} author={item.author} coverUrl={item.coverUrl} />
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-serif text-xl">{item.title}</h3>
        <p className="mt-1 text-xs text-[var(--ink-soft)]">{item.author}</p>
        <label className="mt-5 block text-[10px] tracking-wider text-[var(--ink-faint)]">
          为什么想读
          <input
            aria-label={`${item.title}的想读原因`}
            className="reason-input"
            defaultValue={item.reason}
            onBlur={(event) => onReason(event.currentTarget.value)}
          />
        </label>
      </div>
      <div className="flex flex-col gap-1">
        <button className="icon-button" aria-label={`将${item.title}上移`} disabled={index === 0} onClick={() => onMove(-1)}><ArrowUp size={14} /></button>
        <button className="icon-button" aria-label={`将${item.title}下移`} disabled={index === total - 1} onClick={() => onMove(1)}><ArrowDown size={14} /></button>
      </div>
    </article>
  );
}
