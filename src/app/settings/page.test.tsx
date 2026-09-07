import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { SettingsPageView } from "./settings-page-view";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

describe("SettingsPageView", () => {
  it("shows connection state and local data boundary without secrets", () => {
    render(<SettingsPageView status={{ weread: { configured: true, source: "local", maskedKey: "••••5678" }, aiConfigured: false, databasePath: "data/reading.db", lastSync: null }} />);
    expect(screen.getByText("微信读书已配置")).toBeInTheDocument();
    expect(screen.getByText("••••5678")).toBeInTheDocument();
    expect(screen.getByText("AI 尚未配置")).toBeInTheDocument();
    expect(screen.getByText("data/reading.db")).toBeInTheDocument();
    expect(screen.queryByText(/wrk-/)).not.toBeInTheDocument();
  });
});
