import { render, screen } from "@testing-library/react";
import { SettingsPageView } from "./settings-page-view";

describe("SettingsPageView", () => {
  it("shows connection state and local data boundary without secrets", () => {
    render(<SettingsPageView status={{ wereadConfigured: true, aiConfigured: false, databasePath: "data/reading.db", lastSync: null }} />);
    expect(screen.getByText("微信读书已配置")).toBeInTheDocument();
    expect(screen.getByText("AI 尚未配置")).toBeInTheDocument();
    expect(screen.getByText("data/reading.db")).toBeInTheDocument();
    expect(screen.queryByText(/wrk-/)).not.toBeInTheDocument();
  });
});
