# app/api conventions

- (frontend): Endpoints triggered by the UI. Must require a user session.
- (backend): Internal jobs/webhooks/ops. Require an internal key or signature.
- (external): Proxies to third-party services. Routes should call clients in `_lib/clients/*` (no direct external fetch in route files).
- _lib/: Shared helpers for routes – auth, http, errors, schema, cache, logger, and clients.

## Current grouping

### (frontend)
- auth, users, search, schedule, players, games, rankings, rosters, draft, drafts

### (backend)
- admin, cron, webhooks, monitoring, migrations, sync

### (external)
- meshy, runway, blender, claude, cfbd

## Helpers
- `_lib/http`: ok, badRequest, unauthorized, error helpers for consistent JSON
- `_lib/auth`: `requireSession`, `requireInternal`
- `_lib/errors`: minimal error classes
- `_lib/cache`: fetchWithRetry
- `_lib/logger`: tiny logger

## Notes
- Route groups are invisible in URLs. Moving routes into `(frontend)` etc. does not change public endpoints.
- Prefer importing shared utilities from `_lib/*` in routes to keep consistency and make auditing easier.
