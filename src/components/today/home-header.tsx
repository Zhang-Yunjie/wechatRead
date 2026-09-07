import { SyncButton } from "@/components/sync-button";

export function HomeHeader() {
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">MONDAY · SEPTEMBER 07</p>
        <h1>阅读此刻</h1>
      </div>
      <SyncButton />
    </header>
  );
}
