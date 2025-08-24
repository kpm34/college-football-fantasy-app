# SSOT ↔ Appwrite Schema Sync — Cursor Playbook (Aug 2025)

**Goal:** Bring the single source of truth (SSOT) back in sync with the current Appwrite database schema you pasted. After this, the codebase will:
- Treat **DB keys as snake_case** and **TypeScript DTOs as camelCase** (with automatic mapping).
- Generate Zod validators, TypeScript types, and mappers **from one canonical SSOT**.
- Enforce schema at build-time, validate drift locally, sync to Appwrite, and backfill legacy data (e.g., `owner_client_id`, `display_name`).

> **How to use:** Copy each “Prompt to Cursor” into Cursor in order. Don’t skip steps. Keep all changes on a feature branch until the smoke tests pass.

---

## 0) Prerequisites
- You can run scripts locally with your Appwrite env: `APPWRITE_ENDPOINT`, `APPWRITE_PROJECT_ID`, `APPWRITE_API_KEY`.
- You have a **non-you test account** to validate dashboards, members, and commissioner flows.

---

## 1) Establish ground truth in the workspace
**Prompt to Cursor:**
> Open `/PROJECT_MAP.md` and `/schema/zod-schema.ts`. Summarize (bullet points) where the SSOT registry, collection constants, and validation helpers live. Confirm the commands for validation and for syncing SSOT → Appwrite. Don’t change anything yet—just paste the summary with file/line refs.

**Acceptance:** You get a short report that identifies the current SSOT file(s), validation command(s), and sync script(s).

---

## 2) Stage the new schema as machine‑readable input
**Prompt to Cursor:**
> Create `schema/ssot.input.ts`. Export a constant `RAW_SCHEMA_TABLE` that **verbatim** contains the `schemaData` array I pasted (collections, attributes, indexes). Add JSDoc noting it was captured today.

**Acceptance:** `schema/ssot.input.ts` exists and compiles.

---

## 3) Normalize → canonical model (unify camel/snake, sizes, required)
**Prompt to Cursor:**
> Create `schema/normalize.ts` that exports:
> ```ts
> export type NormalizedAttribute = {
>   dbKey: string;      // snake_case for DB
>   tsKey: string;      // camelCase for TS
>   type: 'string'|'integer'|'double'|'datetime'|'boolean';
>   size?: number;
>   required: boolean;
> };
> export type NormalizedIndex = { key: string };
> export type NormalizedCollection = {
>   id: string;                    // collection id
>   attributes: NormalizedAttribute[];
>   indexes: NormalizedIndex[];
> };
> export function normalizeRawTable(RAW_SCHEMA_TABLE:any[]): NormalizedCollection[];
> ```
> **Rules:**
> 1. Parse attribute strings like `owner_client_id (string:64 required)` into the struct above.
> 2. If both camel & snake appear for the same concept (e.g., `leagueId` and `league_id`), **choose snake_case for `dbKey`** and set **`tsKey` = camelCase**. Keep **one logical attribute**.
> 3. Preserve `size` for strings and mark `required: true` when present.
> 4. Split `indexes` into an array of `{ key }`.

**Acceptance:** A unit test or quick check shows `normalizeRawTable` produces a single, clean attribute set per collection.

---

## 4) Regenerate the SSOT (Zod + registry) from the normalized model
**Prompt to Cursor:**
> Open `schema/zod-schema.ts`. Replace the manual registry with logic that **imports `normalizeRawTable` and `RAW_SCHEMA_TABLE`** to build the SSOT:
> - `COLLECTIONS` enum derived from collection ids.
> - Zod validators per attribute (`z.string().max(size)`, `.min(1)` when `required`, etc.).
> - A mapping table `{ dbKey, tsKey }` per attribute to support automatic mappers.
> Keep existing helper exports/API surface intact.
> Add a top comment: “Generated from `schema/ssot.input.ts` by `normalizeRawTable()`.”

**Acceptance:** `zod-schema.ts` compiles; tests (if any) still pass.

---

## 5) Enforce refactor decisions globally (no string literals)
**Prompt to Cursor:**
> Ensure **`fantasy_teams`** uses `owner_client_id` (DB) ⇄ `ownerClientId` (TS) and that **all code paths** pull field names from the SSOT registry/mappers. Replace any literals like `'client_id'` or `'owner_client_id'` in API routes/components with SSOT-derived keys. Show a repo-wide diff.

**Acceptance:** A search for `'client_id'`/`'owner_client_id'` in app code returns **no** references outside the SSOT.

---

## 6) Generate types + mappers from SSOT
**Prompt to Cursor:**
> Add `schema/generate-types.ts` that emits `types/ssot.d.ts` with:
> - `T<Collection>` (camelCase DTOs)
> - `Db<Collection>` (snake_case DB rows)
> - `fromDb<T>()` and `toDb<T>()` mappers using the `{ dbKey, tsKey }` table.
> Wire `"typecheck"` to consume these types.

**Acceptance:** Type-checking across API/services references these types without errors.

---

## 7) Update high‑traffic API routes to use mappers
**Prompt to Cursor:**
> Replace ad‑hoc mapping with `fromDb/toDb` in:
> 1) `/api/leagues/mine`
> 2) `/api/leagues/[leagueId]/members`
> 3) `/api/leagues/[leagueId]/commissioner`
> 4) Draft/lineup endpoints touching `drafts`, `draft_states`, `lineups`
> Show the before/after on `/api/leagues/mine`.

**Acceptance:** These routes compile and return identical shapes, now sourced from SSOT types.

---

## 8) Local schema drift check
**Prompt to Cursor:**
> Run:
> ```bash
> npx tsx scripts/validate-ssot-schema.ts
> ```
> Paste the output and fix any drift in `zod-schema.ts` until validation passes.

**Acceptance:** Validator passes with zero drift.

---

## 9) Sync SSOT → Appwrite (safe write)
**Prompt to Cursor:**
> With `APPWRITE_ENDPOINT`, `APPWRITE_PROJECT_ID`, `APPWRITE_API_KEY` set, run:
> ```bash
> npx tsx scripts/sync-appwrite-simple.ts
> ```
> Paste the summary (collections/attributes/indexes touched). Confirm the tool did not delete unexpected fields.

**Acceptance:** Sync report matches expectations; no destructive changes beyond intended normalizations.

---

## 10) Backfill legacy data (visibility + names)
**Prompt to Cursor:**
> Create `scripts/backfill-owner-client-id.ts` that:
> - For `fantasy_teams`, if `owner_client_id` is missing and `client_id` exists, set `owner_client_id = client_id`.
> - For `league_memberships`, if `display_name` is empty, hydrate from Appwrite Users (`name || email`).
> Use the server Appwrite client. Implement `--dry-run` and summary output.
> Then run dry-run, paste sample output, and finally execute the real run.

**Acceptance:** Affected documents are updated; the dashboard/sidebar now show leagues/teams for non-you users; members have names instead of “Unknown User”.

---

## 11) Build guards to prevent regression
**Prompt to Cursor:**
> Add `scripts/guards/forbid-legacy-collections.ts` that fails the build if code contains legacy literal DB keys (e.g., `leagueId`, `playerId`, `client_id`, etc.). Wire it into `npm run prebuild`. Show the guard diff and a passing build.

**Acceptance:** A local build fails if someone reintroduces legacy literals.

---

## 12) Update the Feature → Routes → Collections table
**Prompt to Cursor:**
> Open `/PROJECT_MAP.md`. Update the table so **Required Fields** match the SSOT (e.g., `lineups` requires `fantasy_team_id`, not `rosterId`). Add notes for immutable/derived fields where relevant. Show the diff.

**Acceptance:** The doc reflects today’s schema and references the SSOT file.

---

## 13) Prepare the PR (schema change protocol)
**Prompt to Cursor:**
> Create a PR: **“chore(ssot): sync to Appwrite schema (Aug YYYY) and backfill owner_client_id/display_name”**. In the description, follow the internal change protocol (scope, affected routes, impacted collections/fields, migrations/backfills, env). Attach outputs from steps 8–11.

**Acceptance:** PR includes clear scope, automated outputs, and rollback notes.

---

## 14) Post‑sync smoke tests (functional)
**Prompt to Cursor:**
> Add `scripts/smoke-after-ssot.ts` that:
> - Calls `/api/leagues/mine` as a non-you account; asserts `leagues.length > 0` if that user has a team.
> - Calls `/api/leagues/{id}/members`; asserts manager names are not “Unknown User”.
> - Calls a draft endpoint and asserts the payload matches `types/ssot.d.ts`.
> Run it and paste results.

**Acceptance:** All three checks pass.

---

## Command Cheatsheet
```bash
# Validate SSOT vs local expectations
npx tsx scripts/validate-ssot-schema.ts

# Sync SSOT → Appwrite (requires env)
npx tsx scripts/sync-appwrite-simple.ts

# Backfill legacy fields (dry run → real)
npx tsx scripts/backfill-owner-client-id.ts --dry-run
npx tsx scripts/backfill-owner-client-id.ts

# Typecheck and build with guards
pnpm typecheck
pnpm build
```

---

## Open Questions (answer before finalizing)
1) Confirm the canonical SSOT file we target on `main` is **`/schema/zod-schema.ts`** (remove any older duplicates if present).
2) Confirm policy: **snake_case in Appwrite**, **camelCase in code**, with SSOT-managed mapping everywhere.
3) Identify any fields that should be **immutable** after creation (e.g., `gameMode`, `selected_conference`) so we can mark them in SSOT and enforce in PUT routes.

---

**Outcome:** After completing the prompts above, the repository will generate types, validators, and mappers from one SSOT, sync the database safely, backfill legacy data, and guard against future drift.

