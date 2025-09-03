# Curated Prompt Templates (Cursor sessions)

Use these with Goal → Context → Constraints → Acceptance → Deliverables. Keep tasks atomic and typed.

## 1) Implement a Feature
```
Goal:
Build <feature> so that <user> can <benefit>.

Context:
- Tech: Next.js App Router, TS, Tailwind, shadcn/ui, Appwrite
- Related files: <paths>
- Data contracts: <types/interfaces>

Constraints:
- Type-safe; Zod validate inputs; SSR by default
- No client secrets; follow existing patterns

Acceptance:
- Visible behavior described (URLs, states, empty/error)
- Lint/typecheck clean; snapshots or Playwright smoke where relevant

Deliverables:
1) Short plan listing files to edit/create
2) Diffs only (minimal unrelated changes)
3) Any new env keys/commands
```

## 2) Safe Refactor
```
Goal:
Refactor <module> to <objective> with no visible behavior change.

Context:
- Today: <how it works>
- Target: <desired state>
- Files: <paths>

Constraints:
- Preserve API; strict types; no deep nesting
- Keep public exports stable

Acceptance:
- Same UI/API; equal or fewer renders; tests pass

Deliverables: plan + diffs + notes on moved symbols
```

## 3) Bug Repro & Fix
```
Goal:
Fix <bug>.

Repro:
1) Steps
2) Expected vs actual

Evidence:
- Console/network logs, stack, screenshot

Constraints:
- Add minimal guard; keep errors surfaced

Acceptance:
- Repro passes; add a regression test (unit/integration)

Deliverables: root cause, fix diff, test
```

## 4) API Route
```
Goal:
Create/modify <method> /api/<path>.

Context:
- Input schema (Zod): <shape>
- Output contract: <shape>
- Auth/Rate limits: <rules>

Constraints:
- Proper status codes; error typing; logging

Acceptance:
- .http examples in docs/api/*.http work locally (200/4xx)

Deliverables: route diff, zod schema, .http updates
```

## 5) Schema/SSOT Change
```
Goal:
Add/modify <collection/field>.

Context:
- Current SSOT: /schema/zod-schema.ts
- Live Appwrite: synced via scripts

Constraints:
- Optional with code defaults OR always provided; no required defaults in Appwrite

Acceptance:
- generate:all + sync:schema succeed; types updated

Deliverables: schema edit, sync notes, migrations if needed
```

## 6) E2E Smoke (Playwright)
```
Goal:
Add smoke test for <route/flow>.

Context:
- Critical path: <steps>

Constraints:
- Keep fast; stable selectors; run in CI

Acceptance:
- playwright test passes locally and in CI

Deliverables: spec file + updated script
```

## 7) Performance/Profiling
```
Goal:
Improve <metric> on <route>.

Context:
- Baseline: LCP/CLS/INP, bundle, flamegraph

Constraints:
- No regressions; measure-before/after

Acceptance:
- <metric> improved by <target>

Deliverables: before/after notes, diffs
```

## 8) Diagram/Docs Update
```
Goal:
Add/update diagram for <area>.

Context:
- Location: docs/diagrams/<area>

Constraints:
- Draw.io; loadable via /docs path

Acceptance:
- Renders at /admin/draft-diagrams or related viewer

Deliverables: file(s) + link
```
