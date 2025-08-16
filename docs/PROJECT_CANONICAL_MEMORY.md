# Project Canonical Memory

Timestamp: 2025-08-16T00:08:19Z

## Purpose
Single source for vision, integrations, and implementation status. Older planning/implementation docs are archived in `docs/archive/`.

## Vision (condensed)
- Power 4 fantasy platform; real-time (<100ms) updates; premium tiers ($9.99/$19.99)
- AI-first features: Draft Assistant, Lineup Optimizer, Trade Analyzer
- Immersive but focused UI; mobile-first; light gradient theme baseline

## Integrations (current)
- Appwrite (DB, Auth, Functions, Realtime)
- Vercel (Edge/Build/Env, Edge Config, KV)
- CFBD + ESPN for data feeds
- Sentry, GitHub Actions CI

## Implementation Status
- Draft: Mock draft live; real draft WIP (timer + realtime)
- Leagues: Create/Join stable; permissions via server APIs
- Projections: Service in place; accuracy tuning pending
- Schema sync: CLI + CI + runtime guard; webhook drift alerts endpoint ready
- UI: Locker room consolidated; light gradient theme aligned

## Canonical References
- Project Map: `docs/PROJECT_MAP.md`
- Data Flow: `docs/DATA_FLOW.md`
- API Routes: `docs/API_ROUTES.md`
- Project Summary: `docs/PROJECT_SUMMARY.md`
- Page Audit: `docs/PAGE_AUDIT_REPORT.md`

## Open Tasks
- Fix projections accuracy
- Schedule generator when league fills
- Trade system; Weekly lineups
- Resolve Node v22 local dev

## Change Log (high-level from archived docs)
- Repository pattern + platform integration complete (HOUR2/HOUR3)
- Environment alignment and secrets setup finalized
- Vercel-Appwrite sync workflow established
- PWA setup and testing guides added

---
This file replaces scattered implementation/integration/vision docs. For prior detailed plans, see `docs/archive/`.

## Archived Docs Index
- APPWRITE_IMPLEMENTATION_ROADMAP.md
- VERCEL_IMPLEMENTATION_ROADMAP.md
- INTEGRATIONS_COMPREHENSIVE_GUIDE.md
- PLATFORM_SYNERGY_GUIDE.md
- PAID_SERVICES_IMPLEMENTATION.md
- ARCHITECTURAL_CLEANUP_SUMMARY.md
- CLEANUP_SUMMARY.md
- COMPREHENSIVE_AUDIT_AND_CLEANUP_PLAN.md
- HOUR1_CLEANUP_COMPLETE.md
- HOUR2_REPOSITORY_PATTERN_COMPLETE.md
- HOUR3_PLATFORM_INTEGRATION_COMPLETE.md
- IMMEDIATE_ACTION_PLAN.md
- PROJECT_UPDATE_TRACKER.md
- SESSION_CHANGES_AND_FUTURE_STEPS.md
- VERCEL_APPWRITE_SYNC_STATUS.md
- ZERO_ADDITIONAL_COST_STRATEGY.md
- SENTRY_NEXT15_UPDATE.md
- VERCEL_COMPREHENSIVE_REVIEW.md
- VERCEL_MARKETPLACE_FREE_INTEGRATIONS.md
- UPDATE_SYSTEM_GUIDE.md
- ENVIRONMENT_SYNC_GUIDE.md
- ENVIRONMENT_VARIABLES_ALIGNMENT.md
- ERROR_TRACKING.md
- GITHUB_SECRETS_SETUP.md
- GITHUB_SECRETS_TO_ADD.md
- PWA_IMPLEMENTATION_PLAN.md
- PWA_TESTING_GUIDE.md
- ROTOWIRE_INTEGRATION_PLAN.md
- SENTRY_SETUP.md
- VERCEL_ENV_NEEDED.md
- VERCEL_ENV_SETUP.md
- VERCEL_QUICK_START.md
- APPWRITE_COMPREHENSIVE_REVIEW.md
- APPWRITE_REALTIME_SETUP.md
- CRITICAL_APPWRITE_API_KEY_SETUP.md
- DATABASE_SCHEMA.md
- README.md
