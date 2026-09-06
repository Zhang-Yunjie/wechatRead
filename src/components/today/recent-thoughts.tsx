type Thought = { id: string; rawContent: string; createdAt: number };

export function RecentThoughts({ thoughts }: { thoughts: Thought[] }) {
  return (
    <section className="recent-card">
      <div className="section-heading section-heading--compact"><div><p className="eyebrow">最近留下</p><h2>思考没有走远</h2></div></div>
      {thoughts.length ? <div className="divide-y divide-[var(--rule)]">{thoughts.slice(0, 3).map((thought) => <article className="py-4" key={thought.id}><p className="line-clamp-2 font-serif leading-7">{thought.rawContent}</p><p className="mt-2 text-[10px] tracking-wide text-[var(--ink-faint)]">刚刚记下</p></article>)}</div> : <p className="py-8 text-sm leading-6 text-[var(--ink-soft)]">下一次停顿时，记下一句话。它会从这里重新出现。</p>}
    </section>
  );
}
