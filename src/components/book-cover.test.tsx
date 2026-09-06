import { render, screen } from "@testing-library/react";
import { BookCover } from "./book-cover";

describe("BookCover", () => {
  it("uses the title as a paper cover fallback", () => {
    render(<BookCover title="置身事内" author="兰小欢" />);

    expect(screen.getByText("置身事内")).toBeInTheDocument();
    expect(screen.getByText("兰小欢")).toBeInTheDocument();
  });

  it("only applies the physical book treatment to the featured variant", () => {
    const { rerender } = render(<BookCover title="主线书" featured />);
    expect(screen.getByTestId("book-cover")).toHaveAttribute("data-featured", "true");

    rerender(<BookCover title="普通书" />);
    expect(screen.getByTestId("book-cover")).toHaveAttribute("data-featured", "false");
  });
});
