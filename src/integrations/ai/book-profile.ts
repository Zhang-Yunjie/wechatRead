import type { TextCompletionClient } from "./client";
import { bookProfileSchema, unwrapJson } from "./schemas";

type BookInput = { title: string; author: string; intro?: string | null; category?: string | null; wordCount?: number | null };

export function parseBookProfile(raw: string) {
  try {
    return bookProfileSchema.parse(JSON.parse(unwrapJson(raw)));
  } catch {
    throw new Error("AI 返回的阅读体感无效");
  }
}

export async function generateBookProfile(book: BookInput, client: TextCompletionClient) {
  const response = await client.complete(
    "你是克制的阅读助手。根据书籍元数据估计阅读体感，只输出 JSON：estimatedMinutes 数字；intensity 为 light/moderate/deep；continuity 为 fragmented/flexible/continuous；styleTags 最多两个简短中文词；explanation 一句话。不要假装知道元数据之外的内容。",
    JSON.stringify(book),
  );
  return parseBookProfile(response);
}
