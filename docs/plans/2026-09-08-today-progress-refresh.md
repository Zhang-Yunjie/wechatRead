# Today Reading Progress Refresh Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Render “今日阅读” immediately from local data, then refresh the progress of every displayed main and side book from WeRead and update the visible percentages without reloading the page.

**Architecture:** Add a focused server-side progress refresher that validates requested local books, calls `/book/getprogress` independently for each one, and persists only valid results. Expose it through a narrow action-backed route, then wrap the main and side reading cards in one client component that performs one background request per mount and merges successful results into local UI state.

**Tech Stack:** Next.js App Router, React, TypeScript, Drizzle ORM, SQLite, Vitest, Testing Library, Zod

---

### Task 1: Refresh selected books on the server

**Files:**
- Create: `src/integrations/weread/progress.ts`
- Create: `src/integrations/weread/progress.test.ts`

**Step 1: Write the failing success-path test**

Create an in-memory database with two known books and request one known ID plus one unknown ID. Stub `/book/getprogress` for the known book and assert that the function:

```ts
expect(result.progressByBookId).toEqual({ b1: 47 });
expect(result.errors).toEqual([]);
expect(await books.getById("b1")).toMatchObject({
  progress: 47,
  readUpdateTime: 123,
  finishTime: null,
});
expect(client.call).toHaveBeenCalledTimes(1);
```

The unknown ID must be ignored so callers cannot turn this endpoint into an arbitrary WeRead book lookup.

**Step 2: Run the test to verify it fails**

Run: `npm test -- --run src/integrations/weread/progress.test.ts`

Expected: FAIL because `refreshBookProgresses` does not exist.

**Step 3: Implement the minimal refresher**

Add:

```ts
export type BookProgressRefreshResult = {
  progressByBookId: Record<string, number>;
  errors: { bookId: string; message: string }[];
};

export async function refreshBookProgresses(
  db: ReadingDb,
  client: WeReadCaller,
  requestedBookIds: string[],
): Promise<BookProgressRefreshResult> {
  // De-duplicate IDs, select existing local books, call each book independently,
  // validate progress as a finite number from 0 through 100, persist valid values,
  // and return successes plus per-book errors.
}
```

Use `Promise.all` over per-book operations with an internal `try/catch`, so one WeRead failure does not prevent other books from updating. Never overwrite a stored progress with a missing or invalid value.

**Step 4: Run the focused test**

Run: `npm test -- --run src/integrations/weread/progress.test.ts`

Expected: PASS.

**Step 5: Add partial-failure and invalid-progress tests**

Assert that one successful book is persisted when another throws, and that `undefined`, `NaN`, negative, or greater-than-100 progress produces an error without changing the stored value.

**Step 6: Run the focused test suite**

Run: `npm test -- --run src/integrations/weread/progress.test.ts`

Expected: PASS.

**Step 7: Commit**

```bash
git add src/integrations/weread/progress.ts src/integrations/weread/progress.test.ts
git commit -m "feat: refresh selected WeRead progress"
```

### Task 2: Expose a narrow progress refresh API

**Files:**
- Create: `src/lib/actions/weread-progress.ts`
- Create: `src/lib/actions/weread-progress.test.ts`
- Create: `src/app/api/sync/weread/progress/route.ts`

**Step 1: Write failing action tests**

Build the action through injected dependencies, following `src/lib/actions/weread-settings.ts`. Cover:

```ts
const response = await actions.refresh(new Request("http://localhost/api/sync/weread/progress", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ bookIds: ["b1", "b2"] }),
}));

expect(response.status).toBe(200);
expect(await response.json()).toEqual({
  progressByBookId: { b1: 47 },
  errors: [{ bookId: "b2", message: "暂时不可用" }],
});
```

Also assert `400` for malformed or empty IDs and `503` when no WeRead credential is configured.

**Step 2: Run the tests to verify they fail**

Run: `npm test -- --run src/lib/actions/weread-progress.test.ts`

Expected: FAIL because the action module does not exist.

**Step 3: Implement the action factory and route**

Validate input with:

```ts
const requestSchema = z.object({
  bookIds: z.array(z.string().trim().min(1)).min(1).max(100),
});
```

The action checks credential status, parses JSON safely, calls `refreshBookProgresses`, and returns its structured result. The route delegates `POST` directly to the action.

**Step 4: Run the action tests**

Run: `npm test -- --run src/lib/actions/weread-progress.test.ts`

Expected: PASS.

**Step 5: Commit**

```bash
git add src/lib/actions/weread-progress.ts src/lib/actions/weread-progress.test.ts src/app/api/sync/weread/progress/route.ts
git commit -m "feat: add WeRead progress refresh API"
```

### Task 3: Refresh visible progress after the initial render

**Files:**
- Create: `src/components/today/today-reading.tsx`
- Create: `src/components/today/today-reading.test.tsx`
- Modify: `src/app/page.tsx`

**Step 1: Write the failing client-component success test**

Render a main book at `10%` and a side book at `20%`. Stub the refresh response:

```ts
fetcher.mockResolvedValue(new Response(JSON.stringify({
  progressByBookId: { main: 35, side: 62 },
  errors: [],
}), { status: 200 }));

expect(await screen.findByText("35%")).toBeInTheDocument();
expect(await screen.findByText("读到 62%")).toBeInTheDocument();
expect(fetcher).toHaveBeenCalledWith(
  "/api/sync/weread/progress",
  expect.objectContaining({
    method: "POST",
    body: JSON.stringify({ bookIds: ["main", "side"] }),
  }),
);
```

**Step 2: Run the test to verify it fails**

Run: `npm test -- --run src/components/today/today-reading.test.tsx`

Expected: FAIL because `TodayReading` does not exist.

**Step 3: Implement the minimal client component**

Add a `"use client"` component that:

- stores `mainBook` and `sideBooks` progress in state;
- gathers their IDs once on mount;
- uses a ref guard to avoid duplicate requests during a single mount;
- posts the IDs to the new endpoint;
- merges only numeric progress values from a successful response;
- renders `FeaturedBook` or the existing empty state, followed by `SideReading`;
- aborts the request and skips state updates during cleanup.

Move only the main and side reading rendering from `TodayContent` into this component. Keep quick capture, reviews, and recent thoughts as server-rendered siblings.

**Step 4: Run the focused test**

Run: `npm test -- --run src/components/today/today-reading.test.tsx`

Expected: PASS.

**Step 5: Add failure and empty-state tests**

Assert that a rejected or non-OK response retains `10%` and `20%` and shows a status message. Assert that no request is made when neither a main nor a side book is rendered.

**Step 6: Run component and page tests**

Run: `npm test -- --run src/components/today/today-reading.test.tsx src/app/page.test.tsx`

Expected: PASS.

**Step 7: Commit**

```bash
git add src/components/today/today-reading.tsx src/components/today/today-reading.test.tsx src/app/page.tsx
git commit -m "feat: refresh progress on Today Reading"
```

### Task 4: Verify the complete change

**Files:**
- Modify only if verification exposes a defect in the files above.

**Step 1: Run targeted regression tests**

Run: `npm test -- --run src/integrations/weread/progress.test.ts src/lib/actions/weread-progress.test.ts src/components/today/today-reading.test.tsx src/integrations/weread/sync.test.ts src/app/page.test.tsx`

Expected: PASS.

**Step 2: Run the complete test suite**

Run: `npm test -- --run`

Expected: PASS with zero failed tests.

**Step 3: Run lint**

Run: `npm run lint`

Expected: exit code 0.

**Step 4: Run the production build**

Run: `npm run build`

Expected: exit code 0.

**Step 5: Review the scoped diff**

Run: `git diff --check HEAD~3..HEAD`

Expected: no output and exit code 0. Confirm that unrelated existing worktree changes are absent from the three feature commits.

