import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return <div className="app-shell"><Sidebar /><main className="app-content">{children}</main></div>;
}
