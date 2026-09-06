import { render, screen } from "@testing-library/react";
import { ReadingStages } from "./reading-stages";

describe("ReadingStages", () => {
  it("keeps before, during, and after reading material distinct", () => {
    render(<ReadingStages bookId="book-a" reflections={[
      { id: "r1", stage: "before", content: "理解地方财政" },
      { id: "r2", stage: "during", content: "激励结构比道德评价更重要" },
      { id: "r3", stage: "after", content: "需要继续查土地财政" },
    ]} />);

    expect(screen.getByText("为什么读")).toBeInTheDocument();
    expect(screen.getByText("理解地方财政")).toBeInTheDocument();
    expect(screen.getByText("读到哪里，想到哪里")).toBeInTheDocument();
    expect(screen.getByText("激励结构比道德评价更重要")).toBeInTheDocument();
    expect(screen.getByText("读完留下些什么")).toBeInTheDocument();
    expect(screen.getByText("需要继续查土地财政")).toBeInTheDocument();
  });
});
