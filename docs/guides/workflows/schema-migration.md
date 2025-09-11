---
<<<<<<< HEAD
title: Change the Database Safely — Compat + Canary
updated: 2025-09-11
---

## Strategy

- Prefer additive changes; keep old fields/paths until clients are updated
- Write‑both/read‑new during transition; remove old after verification

## Steps

1. Design backward‑compatible schema; update `/schema/zod-schema.ts`
2. Generate types & sync Appwrite: `npm run generate:all && npm run sync:schema`
3. Implement code paths guarded by flags; deploy preview and verify
4. Canary release to a subset; monitor Sentry and DB metrics
5. Roll out fully; cleanup legacy fields/indices
6. Post‑migration audit and docs update

## Safety Rails

- Backups/snapshots before destructive changes
- Idempotent migration scripts; resume on failure
- Rollback plan documented

## AI & Tools

- Claude review of migration plan for risky assumptions
- Use MCP Appwrite server for live verification queries (read‑only)

Diagram: /admin/diagrams/workflows%3Achange-database-safely
=======
title: Schema / Data Migration — Backward‑compat, Canary
updated: 2025-09-11
---

Checklist:
- Backward‑compatible design
- Canary → verify → rollout
- Cleanup legacy paths; rollback plan

Diagram: /admin/diagrams/workflows%3Aschema-migration
>>>>>>> 24f9fd624f579848150ad3605557a38310d191b4
