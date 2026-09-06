import type { TextCompletionClient } from "./client";
import { thoughtClassificationSchema, unwrapJson } from "./schemas";

export async function classifyThought(rawContent: string, client: TextCompletionClient) {
  const response = await client.complete(
    "识别阅读笔记的表达类型和主题。不要改写原文。只输出 JSON：type 为疑问/观点/联想/行动/反对意见之一；topics 为最多三个简短中文主题。",
    rawContent,
  );
  try {
    return thoughtClassificationSchema.parse(JSON.parse(unwrapJson(response)));
  } catch {
    throw new Error("AI 返回的想法分类无效");
  }
}
