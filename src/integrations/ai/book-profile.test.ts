import { describe, expect, it } from "vitest";
import { generateBookProfile, parseBookProfile } from "./book-profile";

describe("book profile generation", () => {
  it("keeps the profile lightweight and limits style tags to two", async () => {
    const profile = await generateBookProfile(
      { title: "小城与不确定性", author: "某作者", intro: "一本轻松小说", category: "小说", wordCount: 120_000 },
      { complete: async () => JSON.stringify({ estimatedMinutes: 180, intensity: "light", continuity: "continuous", styleTags: ["幽默", "温暖", "成长"], explanation: "适合几次连续阅读" }) },
    );

    expect(profile.styleTags).toEqual(["幽默", "温暖"]);
    expect(profile).toMatchObject({ estimatedMinutes: 180, intensity: "light", continuity: "continuous" });
  });

  it("rejects malformed model output", () => {
    expect(() => parseBookProfile("not json")).toThrow("AI 返回的阅读体感无效");
  });
});
