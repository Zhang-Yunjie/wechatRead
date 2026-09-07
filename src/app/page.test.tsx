import { render, screen } from "@testing-library/react";
import { HomeHeader } from "@/components/today/home-header";

describe("HomeHeader", () => {
  it("renders the reading companion shell", () => {
    render(<HomeHeader />);

    expect(screen.getByText("阅读此刻")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "同步微信读书" })).toBeInTheDocument();
  });
});
