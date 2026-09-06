import { render, screen } from "@testing-library/react";
import HomePage from "./page";

describe("HomePage", () => {
  it("renders the reading companion shell", () => {
    render(<HomePage />);

    expect(screen.getByText("阅读此刻")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "同步微信读书" })).toBeInTheDocument();
  });
});
