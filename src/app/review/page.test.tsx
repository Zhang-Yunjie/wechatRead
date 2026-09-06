import { render, screen } from "@testing-library/react";
import { ReviewPageView } from "./review-page-view";

describe("ReviewPageView", () => {
  it("explains the next action when there is nothing due", () => {
    render(<ReviewPageView due={[]} reviewed={[]} />);
    expect(screen.getByText("今天没有需要回看的想法")).toBeInTheDocument();
    expect(screen.getByText("新的回声会在这里出现")).toBeInTheDocument();
  });

  it("shows reviewed thoughts as an archive", () => {
    render(<ReviewPageView due={[]} reviewed={[{ id: "t1", rawContent: "旧想法", reviewState: "changed", createdAt: 1, lastReviewedAt: 2 }]} />);
    expect(screen.getByText("旧想法")).toBeInTheDocument();
    expect(screen.getByText("观点变化")).toBeInTheDocument();
  });
});
