import { describe, expect, it } from "vitest";
import { classifyThought } from "./classify-thought";

describe("thought classification", () => {
  it("suggests a type and short topics without rewriting the original", async () => {
    const rawContent = "作者把制度问题解释成了个人选择，我不太认同。";
    const result = await classifyThought(rawContent, { complete: async () => JSON.stringify({ type: "反对意见", topics: ["制度", "个人选择", "因果解释", "多余标签"] }) });

    expect(result).toEqual({ type: "反对意见", topics: ["制度", "个人选择", "因果解释"] });
    expect(rawContent).toBe("作者把制度问题解释成了个人选择，我不太认同。");
  });
});
