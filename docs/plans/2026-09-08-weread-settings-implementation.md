# WeRead Settings Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a secure local settings flow that lets the user save, test, and clear a WeRead API Key from the browser without restarting the app.

**Architecture:** A server-only credential store persists the key in Git-ignored `data/secrets.json` with `0600` permissions and returns only a masked status. Route Handlers expose narrow mutation endpoints, while a Client Component owns the interactive form; the existing WeRead client resolves the credential dynamically for every operation.

**Tech Stack:** Next.js App Router, React, TypeScript, Node.js filesystem APIs, Vitest, Testing Library

---

### Task 1: Local credential store

**Files:**
- Create: `src/lib/local-secrets.ts`
- Test: `src/lib/local-secrets.test.ts`

**Step 1: Write the failing tests**

Cover saving a trimmed key, `0600` file permissions, masked status, clearing the local key, corrupted-file fallback, and environment-variable fallback.

**Step 2: Run tests to verify they fail**

Run: `npm test -- --run src/lib/local-secrets.test.ts`

Expected: FAIL because `local-secrets.ts` does not exist.

**Step 3: Implement the minimal store**

Implement `saveLocalWeReadKey`, `clearLocalWeReadKey`, `resolveWeReadKey`, and `getWeReadCredentialStatus`. Accept an optional path/environment in tests. Write JSON to a same-directory temporary file, set mode `0600`, atomically rename it, and never expose the full key from the status function.

**Step 4: Run tests to verify they pass**

Run: `npm test -- --run src/lib/local-secrets.test.ts`

Expected: PASS.

**Step 5: Commit**

```bash
git add src/lib/local-secrets.ts src/lib/local-secrets.test.ts
git commit -m "feat: add local WeRead credential store"
```

### Task 2: Dynamic WeRead client and settings API

**Files:**
- Modify: `src/integrations/weread/client.ts`
- Modify: `src/integrations/weread/client.test.ts`
- Create: `src/lib/actions/weread-settings.ts`
- Create: `src/lib/actions/weread-settings.test.ts`
- Create: `src/app/api/settings/weread/route.ts`
- Create: `src/app/api/settings/weread/test/route.ts`
- Modify: `src/app/api/status/route.ts`

**Step 1: Write failing tests**

Verify that the configured client uses the locally resolved key, save/delete handlers return masked state only, and connection testing calls the read-only `get_bookshelf` ability while sanitizing failures.

**Step 2: Run tests to verify they fail**

Run: `npm test -- --run src/integrations/weread/client.test.ts src/lib/actions/weread-settings.test.ts`

Expected: FAIL because the settings actions and dynamic resolver are missing.

**Step 3: Implement minimal server behavior**

Add testable action factories outside Route Handler files. `POST /api/settings/weread` saves a non-empty key; `DELETE` removes only the local WeRead key; `POST /api/settings/weread/test` performs a read-only connection call. Responses contain `{ configured, source, maskedKey }` or a sanitized error and never contain the submitted key.

**Step 4: Run tests to verify they pass**

Run: `npm test -- --run src/integrations/weread/client.test.ts src/lib/actions/weread-settings.test.ts`

Expected: PASS.

**Step 5: Commit**

```bash
git add src/integrations/weread src/lib/actions/weread-settings* src/app/api/settings src/app/api/status/route.ts
git commit -m "feat: add WeRead settings API"
```

### Task 3: Interactive settings card

**Files:**
- Create: `src/components/settings/weread-settings-form.tsx`
- Create: `src/components/settings/weread-settings-form.test.tsx`
- Modify: `src/app/settings/page.tsx`
- Modify: `src/app/settings/settings-page-view.tsx`
- Modify: `src/app/settings/page.test.tsx`
- Modify: `src/app/globals.css`

**Step 1: Write failing component tests**

Verify password input rendering, save feedback, masked configured state, connection-test action, and clear confirmation behavior using mocked fetch responses.

**Step 2: Run tests to verify they fail**

Run: `npm test -- --run src/components/settings/weread-settings-form.test.tsx src/app/settings/page.test.tsx`

Expected: FAIL because the interactive form is missing.

**Step 3: Implement the Client Component**

Render an empty password field even when configured, a masked status label, and save/test/clear buttons. Keep the key only in component state until submission, clear the input after success, disable mutations while pending, show inline feedback, and refresh the Server Component after a successful mutation.

**Step 4: Run tests to verify they pass**

Run: `npm test -- --run src/components/settings/weread-settings-form.test.tsx src/app/settings/page.test.tsx`

Expected: PASS with no React warnings.

**Step 5: Commit**

```bash
git add src/components/settings src/app/settings src/app/globals.css
git commit -m "feat: configure WeRead from settings"
```

### Task 4: Documentation and end-to-end verification

**Files:**
- Modify: `README.md`

**Step 1: Update local configuration documentation**

Document browser-based configuration, the local secret path and permissions, environment fallback, manual sync behavior, and how to clear the saved key.

**Step 2: Run complete automated verification**

Run:

```bash
npm test -- --run
npm run lint
npx tsc --noEmit
npm run build
npm audit
git diff --check
```

Expected: all commands exit 0.

**Step 3: Verify in the running browser**

Use a temporary secrets path or disposable test value. Confirm save shows only a mask, test reports a sanitized result, clear removes the local value, and no response or rendered page contains the full test key.

**Step 4: Commit**

```bash
git add README.md
git commit -m "docs: explain in-app WeRead configuration"
```
