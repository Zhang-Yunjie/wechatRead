type Profile = {
  estimatedMinutes?: number | null;
  intensity?: "light" | "moderate" | "deep" | null;
  continuity?: "fragmented" | "flexible" | "continuous" | null;
  styleTags?: string[];
};

const intensityLabel = { light: "轻松", moderate: "适中", deep: "深度" };
const continuityLabel = { fragmented: "碎片友好", flexible: "节奏灵活", continuous: "建议连续读" };

export function BookProfileChips({ profile }: { profile?: Profile | null }) {
  if (!profile) return <span className="text-xs text-[var(--ink-faint)]">等待生成阅读体感</span>;
  const hours = profile.estimatedMinutes ? `${Math.max(1, Math.round(profile.estimatedMinutes / 60))} 小时` : null;
  const labels = [
    hours,
    profile.intensity ? intensityLabel[profile.intensity] : null,
    profile.continuity ? continuityLabel[profile.continuity] : null,
    ...(profile.styleTags ?? []).slice(0, 2),
  ].filter(Boolean);
  return <div className="flex flex-wrap gap-2">{labels.map((label) => <span className="profile-chip" key={label}>{label}</span>)}</div>;
}
