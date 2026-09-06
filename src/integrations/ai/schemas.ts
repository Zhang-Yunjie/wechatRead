import { z } from "zod";

export const bookProfileSchema = z.object({
  estimatedMinutes: z.number().int().min(15).max(100_000),
  intensity: z.enum(["light", "moderate", "deep"]),
  continuity: z.enum(["fragmented", "flexible", "continuous"]),
  styleTags: z.array(z.string().trim().min(1).max(12)).max(8).transform((tags) => tags.slice(0, 2)),
  explanation: z.string().trim().min(1).max(200),
});

export const thoughtClassificationSchema = z.object({
  type: z.string().trim().min(1).max(12),
  topics: z.array(z.string().trim().min(1).max(20)).max(10).transform((topics) => topics.slice(0, 3)),
});

export function unwrapJson(value: string) {
  return value.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
}
