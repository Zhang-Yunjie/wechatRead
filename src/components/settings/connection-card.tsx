import { CheckCircle2, CircleAlert } from "lucide-react";

export function ConnectionCard({ title, configured, configuredText, missingText, children }: { title: string; configured: boolean; configuredText: string; missingText: string; children: React.ReactNode }) {
  return <section className="connection-card"><div className="flex items-center justify-between"><p className="eyebrow">{title}</p>{configured ? <CheckCircle2 size={18} className="text-[var(--forest)]" /> : <CircleAlert size={18} className="text-[var(--brass)]" />}</div><h2>{configured ? configuredText : missingText}</h2><div className="connection-card__body">{children}</div></section>;
}
