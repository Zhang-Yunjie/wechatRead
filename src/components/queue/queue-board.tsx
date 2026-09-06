"use client";

import { useState } from "react";
import { DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { QueueLane } from "./queue-lane";

export type QueueCardData = {
  id: string;
  bookId: string;
  lane: "main" | "side" | "quick";
  position: number;
  reason: string;
  title: string;
  author: string;
  coverUrl?: string | null;
};

export function QueueBoard({ items: initialItems }: { items: QueueCardData[] }) {
  const [items, setItems] = useState(initialItems);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  async function persist(lane: QueueCardData["lane"], next: QueueCardData[]) {
    await fetch("/api/queue/reorder", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ lane, bookIds: next.map((item) => item.bookId) }) });
  }

  function move(bookId: string, direction: -1 | 1) {
    const item = items.find((entry) => entry.bookId === bookId);
    if (!item) return;
    const laneItems = items.filter((entry) => entry.lane === item.lane).sort((a, b) => a.position - b.position);
    const from = laneItems.findIndex((entry) => entry.bookId === bookId);
    const to = from + direction;
    if (to < 0 || to >= laneItems.length) return;
    const moved = arrayMove(laneItems, from, to).map((entry, position) => ({ ...entry, position }));
    setItems((current) => [...current.filter((entry) => entry.lane !== item.lane), ...moved]);
    void persist(item.lane, moved);
  }

  function dragEnd(event: DragEndEvent) {
    if (!event.over || event.active.id === event.over.id) return;
    const active = items.find((entry) => entry.bookId === event.active.id);
    const over = items.find((entry) => entry.bookId === event.over?.id);
    if (!active || !over || active.lane !== over.lane) return;
    const laneItems = items.filter((entry) => entry.lane === active.lane).sort((a, b) => a.position - b.position);
    const moved = arrayMove(laneItems, laneItems.indexOf(active), laneItems.indexOf(over)).map((entry, position) => ({ ...entry, position }));
    setItems((current) => [...current.filter((entry) => entry.lane !== active.lane), ...moved]);
    void persist(active.lane, moved);
  }

  function saveReason(bookId: string, reason: string) {
    setItems((current) => current.map((entry) => entry.bookId === bookId ? { ...entry, reason } : entry));
    void fetch(`/api/queue/${bookId}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ reason }) });
  }

  return (
    <DndContext sensors={sensors} onDragEnd={dragEnd}>
      <div className="queue-board">{(["main", "side", "quick"] as const).map((lane) => <QueueLane key={lane} lane={lane} items={items.filter((item) => item.lane === lane).sort((a, b) => a.position - b.position)} onMove={move} onReason={saveReason} />)}</div>
    </DndContext>
  );
}
