# Integration Guide — Vercel + Appwrite + MCP

This guide operationalizes our platform playbooks. Follow step-by-step to reach production-grade reliability and velocity.

## 1) Vercel Setup
- Enable Analytics and Speed Insights.
- Add cron schedules for syncs (rankings, projections, schedules): Settings → Functions → Cron.
- Add Edge Config for feature flags; store keys used in code as EDGE_CONFIG.
- Add domains: `cfbfantasy.app`, `collegefootballfantasy.app`.
- Env vars: `NEXT_PUBLIC_APPWRITE_*`, `APPWRITE_API_KEY`, `CFBD_API_KEY`, `NEXT_PUBLIC_DISABLE_SIGNUPS`, `ADMIN_EMAIL`.

## 2) Appwrite Setup
- Add Platforms for all domains (see `APPWRITE_PLATFORM_SETUP.md`).
- Create collections and indexes (see script in `scripts/setup-appwrite-indexes.ts`).
- Create API keys: read-most, write-elevated (least privilege). Store in Vercel env.
- Enable email verification; disable anonymous/public signup if invite-only.

## 3) Security & Headers
- Use middleware to set CSP and security headers; enable rate limits for sensitive routes.
- Review WAF and Protection Bypass in Vercel; only allow trusted preview sources.

## 4) MCP Tools
- Appwrite: list collections, query docs, CRUD, indexes (create/list), trigger functions.
- Vercel: deployment info, logs, env var read, toggle Edge Config flags, trigger cron.
- Guardrails: dry-run flag; admin-only access.

## 5) Admin Console
- Add `/admin` route gated by `ADMIN_EMAIL`.
- Controls: feature flags (Edge Config), job triggers (cron now), health checks, MCP tool runner.

## 6) Runbooks
- Draft reconnect: detect and auto-rejoin; MCP “check_draft_system”.
- Data feed outage: switch to fallback, queue backfill; revalidate tags after restore.
- Scoring drift: freeze standings, run diff, publish audit, resume with fix.

## 7) Success Criteria
- TTI < 2s p95; interactions <200ms p95.
- Data syncs SLA: under 3m lag for scores on Saturdays.
- Error budget SLO tracked in Sentry; weekly report.



