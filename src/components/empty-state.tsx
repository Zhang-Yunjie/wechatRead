export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="empty-state">
      <span className="empty-state__mark">⌁</span>
      <h2 className="font-serif text-2xl">{title}</h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--ink-soft)]">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
