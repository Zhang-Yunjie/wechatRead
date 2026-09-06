type Reflection = { id: string; stage: "before" | "during" | "after"; content: string };
const stages = [
  { key: "before", marker: "读前", title: "为什么读", prompt: "希望它帮你回答什么？" },
  { key: "during", marker: "读中", title: "读到哪里，想到哪里", prompt: "哪些地方改变或挑战了原来的理解？" },
  { key: "after", marker: "读后", title: "读完留下些什么", prompt: "什么会继续留在你的生活里？" },
] as const;

export function ReadingStages({ bookId, reflections }: { bookId: string; reflections: Reflection[] }) {
  return (
    <section className="stage-grid" data-book-id={bookId}>
      {stages.map((stage) => {
        const entries = reflections.filter((item) => item.stage === stage.key);
        return <article className="stage-card" key={stage.key}><span>{stage.marker}</span><h2>{stage.title}</h2><p className="stage-card__prompt">{stage.prompt}</p>{entries.length ? <div className="mt-6 space-y-3">{entries.map((entry) => <p className="stage-note" key={entry.id}>{entry.content}</p>)}</div> : <p className="stage-card__empty">还没有留下内容</p>}</article>;
      })}
    </section>
  );
}
