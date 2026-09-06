"use client";

import { useState } from "react";
import { Check, CornerDownRight } from "lucide-react";

type ReviewThought = { id: string; rawContent: string; createdAt: number };

export function DailyReview({ thoughts }: { thoughts: ReviewThought[] }) {
  const [index, setIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [today] = useState(() => Date.now());
  const thought = thoughts[index];

  async function review(outcome: "agreed" | "changed" | "skipped") {
    if (!thought || saving) return;
    setSaving(true);
    const response = await fetch(`/api/reviews/${thought.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ outcome }),
    });
    setSaving(false);
    if (response.ok) setIndex((current) => current + 1);
  }

  if (!thought) {
    return (
      <section className="review-card review-card--complete">
        <Check size={18} />
        <div><p className="font-serif text-lg">今天的回顾完成了</p><p className="mt-1 text-xs text-[var(--ink-soft)]">让想法歇一会儿，明天再见。</p></div>
      </section>
    );
  }

  return (
    <section className="review-card" aria-labelledby="review-title">
      <div className="flex items-center justify-between">
        <p id="review-title" className="eyebrow">今日回声 · {index + 1}/{thoughts.length}</p>
        <CornerDownRight size={15} className="text-[var(--brass)]" />
      </div>
      <blockquote className="my-5 font-serif text-xl leading-8">“{thought.rawContent}”</blockquote>
      <p className="text-xs text-[var(--ink-faint)]">{Math.max(1, Math.round((today - thought.createdAt) / 86_400_000))} 天前留下</p>
      <div className="mt-5 flex flex-wrap gap-2">
        <button className="quiet-button" onClick={() => void review("agreed")} disabled={saving}>仍然认同</button>
        <button className="quiet-button" onClick={() => void review("changed")} disabled={saving}>现在有不同看法</button>
        <button className="text-button" onClick={() => void review("skipped")} disabled={saving}>今天跳过</button>
      </div>
    </section>
  );
}
