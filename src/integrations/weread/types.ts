export type WeReadShelfBook = {
  bookId: string;
  title: string;
  author?: string;
  cover?: string;
  category?: string;
  intro?: string;
  deepLink?: string;
  readUpdateTime?: number;
  finishReading?: number;
  progress?: number;
};

export type ShelfResponse = { books?: WeReadShelfBook[]; albums?: unknown[]; mp?: unknown };
export type NotebooksResponse = { books?: unknown[]; hasMore?: number; lastSort?: number };
export type ProgressResponse = { book?: { progress?: number; updateTime?: number; finishTime?: number; recordReadingTime?: number } };
export type BookmarkResponse = { updated?: { bookmarkId: string; bookId: string; chapterUid?: number; markText: string; createTime?: number; range?: string; colorStyle?: number }[]; chapters?: { chapterUid: number; title: string }[] };
export type MineReviewsResponse = { reviews?: { review: { reviewId: string; content: string; createTime?: number; chapterUid?: number } }[]; hasMore?: number; synckey?: number };

export interface WeReadCaller {
  call<T = unknown>(apiName: string, params?: Record<string, unknown>): Promise<T>;
}
