# Local Reading Companion Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a polished localhost-only desktop web application that syncs read-only WeRead data on demand, stores personal reading state locally, captures thoughts without friction, resurfaces them for review, and manages an ordered main/side/quick reading queue.

**Architecture:** Use a single Next.js App Router application for the desktop UI and local server routes. Store imported and local data in SQLite through Drizzle, keeping imported WeRead fields separate from user-owned fields. Make WeRead sync and OpenAI-compatible enrichment optional server-side integrations so the product remains usable with local demo/empty data when keys are absent.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, SQLite, Drizzle ORM, Zod, dnd-kit, OpenAI-compatible Chat Completions, Vitest, Testing Library

---

### Task 1: Scaffold the application and test harness

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `src/app/layout.tsx`
- Create: `src/app/globals.css`
- Create: `src/app/page.tsx`
- Test: `src/app/page.test.tsx`

**Step 1: Write the failing smoke test**

Render the initial page and assert that the product name and empty-state call to action are present.

```tsx
it("renders the reading companion shell", () => {
  render(<HomePage />);
  expect(screen.getByText("阅读此刻")).toBeInTheDocument();
  expect(screen.getByText("同步微信读书")).toBeInTheDocument();
});
```

**Step 2: Run the test to verify it fails**

Run: `npm test -- --run src/app/page.test.tsx`

Expected: FAIL because the app and test configuration do not exist.

**Step 3: Add the minimal Next.js shell**

Create the package scripts `dev`, `build`, `lint`, `test`, `test:watch`, and `db:generate`. Add a root layout with Chinese metadata, local font fallbacks, and a temporary home shell. Configure Tailwind through PostCSS and define the warm paper, forest green, ink, muted olive, and brass design tokens in `globals.css`.

**Step 4: Install dependencies and run the test**

Run: `npm install`

Run: `npm test -- --run src/app/page.test.tsx`

Expected: PASS.

**Step 5: Commit**

```bash
git add package.json package-lock.json tsconfig.json next.config.ts postcss.config.mjs vitest.config.ts vitest.setup.ts .gitignore .env.example src/app
git commit -m "chore: scaffold local reading companion"
```

### Task 2: Create the local data model and repositories

**Files:**
- Create: `drizzle.config.ts`
- Create: `src/db/schema.ts`
- Create: `src/db/client.ts`
- Create: `src/db/migrate.ts`
- Create: `src/db/repositories/books.ts`
- Create: `src/db/repositories/thoughts.ts`
- Create: `src/db/repositories/queue.ts`
- Create: `src/db/repositories/reviews.ts`
- Create: `src/db/repositories/sync-runs.ts`
- Test: `src/db/repositories/repositories.test.ts`

**Step 1: Write repository contract tests**

Use a temporary SQLite database and cover:

- exactly one `main` reading role at a time;
- multiple `side` roles;
- queue position persistence;
- thought creation preserving raw content;
- WeRead upserts preserving local fields;
- review state transitions.

```ts
it("replaces the previous main book without changing side books", async () => {
  await books.setRole("book-a", "main");
  await books.setRole("book-b", "side");
  await books.setRole("book-c", "main");
  expect(await books.getMain()).toMatchObject({ id: "book-c" });
  expect(await books.getById("book-b")).toMatchObject({ readingRole: "side" });
});
```

**Step 2: Run tests to verify failure**

Run: `npm test -- --run src/db/repositories/repositories.test.ts`

Expected: FAIL because schema and repositories are missing.

**Step 3: Implement the schema**

Create tables for `books`, `queue_items`, `thoughts`, `highlights`, `reflections`, `resource_links`, `book_profiles`, and `sync_runs`. Store imported WeRead values in dedicated columns and user-owned role, reason, profile override, and review state separately. Use foreign keys with deliberate delete behavior and timestamps on mutable records.

**Step 4: Implement repositories and migrations**

Use `READING_DB_PATH`, defaulting to `data/reading.db`. Ensure the data directory is created by the server process and apply idempotent local migrations on startup. Repositories return typed domain objects rather than raw SQLite rows.

**Step 5: Run repository tests**

Run: `npm test -- --run src/db/repositories/repositories.test.ts`

Expected: PASS.

**Step 6: Commit**

```bash
git add drizzle.config.ts src/db
git commit -m "feat: add local reading data model"
```

### Task 3: Add server actions and application queries

**Files:**
- Create: `src/lib/domain.ts`
- Create: `src/lib/queries/dashboard.ts`
- Create: `src/lib/queries/library.ts`
- Create: `src/lib/queries/book-workspace.ts`
- Create: `src/app/api/thoughts/route.ts`
- Create: `src/app/api/books/[bookId]/role/route.ts`
- Create: `src/app/api/queue/reorder/route.ts`
- Create: `src/app/api/reviews/[thoughtId]/route.ts`
- Test: `src/lib/queries/dashboard.test.ts`
- Test: `src/app/api/thoughts/route.test.ts`

**Step 1: Write failing dashboard and capture tests**

Verify that the dashboard query returns one main book, side books, recent thoughts, up to three due reviews, the next main candidate, and last sync status. Verify that thought creation validates content, trims surrounding whitespace, links the active main book by default, and returns success before enrichment.

**Step 2: Run tests to verify failure**

Run: `npm test -- --run src/lib/queries/dashboard.test.ts src/app/api/thoughts/route.test.ts`

Expected: FAIL because queries and routes are missing.

**Step 3: Implement typed application queries and routes**

Use Zod at every mutation boundary. Keep review selection simple: unresolved thoughts older than one day, not completed, and not skipped today; order by oldest `lastReviewedAt`, then creation time; return at most three.

**Step 4: Run tests**

Run: `npm test -- --run src/lib/queries/dashboard.test.ts src/app/api/thoughts/route.test.ts`

Expected: PASS.

**Step 5: Commit**

```bash
git add src/lib src/app/api
git commit -m "feat: add reading application services"
```

### Task 4: Build the editorial desktop shell and reusable book UI

**Files:**
- Create: `src/components/app-shell.tsx`
- Create: `src/components/sidebar.tsx`
- Create: `src/components/book-cover.tsx`
- Create: `src/components/book-profile-chips.tsx`
- Create: `src/components/empty-state.tsx`
- Create: `src/components/status-pill.tsx`
- Create: `src/components/icons.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`
- Test: `src/components/book-cover.test.tsx`

**Step 1: Write the failing cover fallback test**

Verify that a book with no cover renders a paper fallback containing the title and that only the featured variant receives the physical-book treatment.

**Step 2: Run the test to verify failure**

Run: `npm test -- --run src/components/book-cover.test.tsx`

Expected: FAIL.

**Step 3: Implement the visual system**

Create a fixed desktop sidebar and an editorial content frame. Use restrained serif headings, sans-serif interface text, warm paper surfaces, fine rules, subtle grain, and forest/brass accents. Implement real cover images with a title fallback, a subtle spine and shadow on featured books, and reduced-motion support.

**Step 4: Run the test and lint**

Run: `npm test -- --run src/components/book-cover.test.tsx`

Run: `npm run lint`

Expected: PASS.

**Step 5: Commit**

```bash
git add src/components src/app/layout.tsx src/app/globals.css
git commit -m "feat: add editorial reading interface"
```

### Task 5: Implement Today and frictionless thought capture

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/components/today/featured-book.tsx`
- Create: `src/components/today/side-reading.tsx`
- Create: `src/components/today/quick-capture.tsx`
- Create: `src/components/today/recent-thoughts.tsx`
- Create: `src/components/today/daily-review.tsx`
- Create: `src/hooks/use-quick-capture.ts`
- Test: `src/components/today/quick-capture.test.tsx`
- Test: `src/components/today/daily-review.test.tsx`

**Step 1: Write failing interaction tests**

Cover opening capture with `Meta+K`, focusing the input, submitting non-empty content with `Meta+Enter`, preserving content when the server rejects the request, clearing it on success, and updating a daily review without a full-page reload.

**Step 2: Run tests to verify failure**

Run: `npm test -- --run src/components/today/quick-capture.test.tsx src/components/today/daily-review.test.tsx`

Expected: FAIL.

**Step 3: Implement Today**

Use a two-column desktop composition: a physical featured main book and reading action on the left; capture, recent thoughts, and daily review on the right. Place side books and the next queue candidates below. Save raw content immediately and surface enrichment as a non-blocking pending state.

**Step 4: Run tests**

Run: `npm test -- --run src/components/today/quick-capture.test.tsx src/components/today/daily-review.test.tsx`

Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/page.tsx src/components/today src/hooks
git commit -m "feat: add today reading and quick capture"
```

### Task 6: Implement the library and ordered queues

**Files:**
- Create: `src/app/library/page.tsx`
- Create: `src/app/queue/page.tsx`
- Create: `src/components/library/library-grid.tsx`
- Create: `src/components/library/library-filters.tsx`
- Create: `src/components/queue/queue-board.tsx`
- Create: `src/components/queue/queue-lane.tsx`
- Create: `src/components/queue/queue-card.tsx`
- Test: `src/components/queue/queue-board.test.tsx`

**Step 1: Write failing queue tests**

Verify drag/reorder payloads, keyboard-accessible movement, reason editing, moving a book between queue lanes, and stable rendering after a saved order is returned.

**Step 2: Run tests to verify failure**

Run: `npm test -- --run src/components/queue/queue-board.test.tsx`

Expected: FAIL.

**Step 3: Implement library and queue UI**

The library uses consistent cover cards with search, status, and four lightweight profile values. The queue uses three clearly named lanes—主线候选、支线候选、快速阅读池—with dnd-kit pointer and keyboard sensors. Do not encode rank as a user-visible numeric score beyond lane order.

**Step 4: Run tests**

Run: `npm test -- --run src/components/queue/queue-board.test.tsx`

Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/library src/app/queue src/components/library src/components/queue
git commit -m "feat: add library and reading queues"
```

### Task 7: Implement the book workspace and reflections

**Files:**
- Create: `src/app/books/[bookId]/page.tsx`
- Create: `src/components/book-workspace/workspace-header.tsx`
- Create: `src/components/book-workspace/reading-stages.tsx`
- Create: `src/components/book-workspace/thought-timeline.tsx`
- Create: `src/components/book-workspace/highlights.tsx`
- Create: `src/components/book-workspace/reflection-editor.tsx`
- Create: `src/components/book-workspace/resource-links.tsx`
- Create: `src/app/api/books/[bookId]/reflections/route.ts`
- Create: `src/app/api/books/[bookId]/resources/route.ts`
- Test: `src/components/book-workspace/reading-stages.test.tsx`

**Step 1: Write failing stage tests**

Verify that pre-reading questions, during-reading thoughts/highlights, and post-reading reflections remain distinct; external resources store title, URL, type, and relationship only.

**Step 2: Run tests to verify failure**

Run: `npm test -- --run src/components/book-workspace/reading-stages.test.tsx`

Expected: FAIL.

**Step 3: Implement the workspace**

Build a book-specific editorial workspace with three lightweight stages, a chronological thought timeline, imported highlight styling, reflection prompts, and external resource cards. Avoid a freeform graph or full document editor.

**Step 4: Run tests**

Run: `npm test -- --run src/components/book-workspace/reading-stages.test.tsx`

Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/books src/components/book-workspace
git commit -m "feat: add book reading workspace"
```

### Task 8: Add WeRead manual sync

**Files:**
- Create: `src/integrations/weread/client.ts`
- Create: `src/integrations/weread/types.ts`
- Create: `src/integrations/weread/sync.ts`
- Create: `src/app/api/sync/weread/route.ts`
- Create: `src/components/sync-button.tsx`
- Test: `src/integrations/weread/client.test.ts`
- Test: `src/integrations/weread/sync.test.ts`

**Step 1: Write failing client and sync tests**

Mock the gateway and cover Authorization handling, skill version reporting, non-zero `errcode`, paginated notebooks, shelf mapping, partial failure preservation, and secret redaction. Verify that no request occurs without an explicit route invocation.

**Step 2: Run tests to verify failure**

Run: `npm test -- --run src/integrations/weread/client.test.ts src/integrations/weread/sync.test.ts`

Expected: FAIL.

**Step 3: Implement the client**

POST to `https://i.weread.qq.com/api/agent/gateway` with `Authorization: Bearer ${WEREAD_API_KEY}`. Use `WEREAD_SKILL_VERSION`, default `1.0.4`, and keep business parameters flat in the request body. Implement `/shelf/sync`, paginated `/user/notebooks`, and detail calls only for active and recent books.

**Step 4: Implement explicit sync and progress UI**

The `POST /api/sync/weread` route is the only automatic entry point. Record a `sync_runs` row, upsert successful sections transactionally, preserve previous data for failed sections, and return a structured summary. The button shows idle, syncing, success, partial, and failed states plus the last successful time.

**Step 5: Run tests**

Run: `npm test -- --run src/integrations/weread/client.test.ts src/integrations/weread/sync.test.ts`

Expected: PASS.

**Step 6: Commit**

```bash
git add src/integrations/weread src/app/api/sync src/components/sync-button.tsx
git commit -m "feat: add manual WeRead synchronization"
```

### Task 9: Add optional AI book profiling and thought classification

**Files:**
- Create: `src/integrations/ai/client.ts`
- Create: `src/integrations/ai/schemas.ts`
- Create: `src/integrations/ai/book-profile.ts`
- Create: `src/integrations/ai/classify-thought.ts`
- Create: `src/app/api/books/[bookId]/profile/route.ts`
- Create: `src/app/api/thoughts/[thoughtId]/enrich/route.ts`
- Test: `src/integrations/ai/book-profile.test.ts`
- Test: `src/integrations/ai/classify-thought.test.ts`

**Step 1: Write failing AI boundary tests**

Cover missing configuration, malformed model output, strict maximum of two style tags, enum validation, timeout behavior, editable overrides, and non-destructive failures.

**Step 2: Run tests to verify failure**

Run: `npm test -- --run src/integrations/ai/book-profile.test.ts src/integrations/ai/classify-thought.test.ts`

Expected: FAIL.

**Step 3: Implement the optional integration**

Read `OPENAI_API_KEY`, `OPENAI_BASE_URL`, and `OPENAI_MODEL` only on the server. Request strict JSON with estimated reading minutes, intensity, continuity, up to two style tags, and a short explanation. Thought enrichment may suggest a type and short topic labels but never rewrite `rawContent`.

**Step 4: Run tests**

Run: `npm test -- --run src/integrations/ai/book-profile.test.ts src/integrations/ai/classify-thought.test.ts`

Expected: PASS.

**Step 5: Commit**

```bash
git add src/integrations/ai src/app/api/books src/app/api/thoughts
git commit -m "feat: add optional AI reading profiles"
```

### Task 10: Add review and settings pages, then verify end to end

**Files:**
- Create: `src/app/review/page.tsx`
- Create: `src/app/settings/page.tsx`
- Create: `src/components/settings/connection-card.tsx`
- Create: `src/components/settings/data-boundary.tsx`
- Create: `src/app/api/status/route.ts`
- Create: `src/test/fixtures/demo-data.ts`
- Create: `README.md`
- Test: `src/app/review/page.test.tsx`
- Test: `src/app/settings/page.test.tsx`

**Step 1: Write failing page tests**

Verify review empty/completed states, configuration status without secret values, local database path display, sync history, and explicit data-boundary copy.

**Step 2: Run tests to verify failure**

Run: `npm test -- --run src/app/review/page.test.tsx src/app/settings/page.test.tsx`

Expected: FAIL.

**Step 3: Implement pages and documentation**

Add the review archive and settings status cards. Document setup, environment variables, database location, manual sync, AI optionality, local-only scope, and backup instructions. Provide development-only demo fixtures for visual verification without real user data.

**Step 4: Run the full verification suite**

Run: `npm test -- --run`

Expected: all tests PASS.

Run: `npm run lint`

Expected: no lint errors.

Run: `npm run build`

Expected: production build succeeds.

Run: `git diff --check`

Expected: no whitespace errors.

**Step 5: Start the local application and perform visual verification**

Run: `npm run dev`

Verify at desktop width:

- editorial hierarchy and real-cover treatment;
- Today capture and review interactions;
- library empty/demo states;
- drag-and-drop queue persistence;
- book workspace stages;
- sync and AI missing-key states;
- no horizontal overflow and usable keyboard focus.

**Step 6: Commit**

```bash
git add README.md src/app/review src/app/settings src/components/settings src/app/api/status src/test
git commit -m "feat: complete local reading companion MVP"
```
