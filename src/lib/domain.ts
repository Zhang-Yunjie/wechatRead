export const readingRoles = ["none", "main", "side"] as const;
export const queueLanes = ["main", "side", "quick"] as const;
export const reviewOutcomes = ["agreed", "changed", "completed", "skipped"] as const;

export type ReadingRole = typeof readingRoles[number];
export type QueueLane = typeof queueLanes[number];
export type ReviewOutcome = typeof reviewOutcomes[number];
