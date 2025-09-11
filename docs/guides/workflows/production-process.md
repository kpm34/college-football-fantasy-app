---
title: Production Process — Backlog → Prod
updated: 2025-09-11
---

## Overview

A pragmatic, fast iteration flow that preserves quality: small PRs, strict gates, and instant feedback. Integrates Vercel, Appwrite, Sentry, Playwright, and AI tools.

## Roles

- **Owner/PM**: backlog triage, priority, acceptance
- **Engineer**: implement, tests, docs, observability
- **Reviewer**: code review, risk assessment
- **Release Captain** (rotates): green builds, deploy coordination

## Stages & Gates

1. **Backlog & Refinement**
   - Source: client brief, product vision, analytics, incidents
   - Definition of Ready: problem, outcome, acceptance, risk, owner
2. **Plan Sprint**
   - Slice into 1–2 day tasks, add test plan, define metrics
3. **Implement**
   - Branch: `feat/*`, `fix/*`, `chore/*`
   - Patterns: Zod validation, server actions, App Router, RSC by default
   - Docs: update `/docs/guides/*` as needed
4. **PR & CI** (hard gate)
   - Lint: `npm run lint`
   - Types: `npm run typecheck`
   - Unit/Integration: `npm test`
   - E2E (targeted): `npm run test:e2e`
   - Build: `npm run build`
   - Diagram audit (if touched): `npx tsx ops/common/scripts/audit-diagrams-live.ts`
5. **Review**
   - Checklist: security, errors handled, accessibility, performance, docs, tests
   - Block merge on unresolved comments or red checks
6. **Merge → Preview**
   - Auto preview via Vercel; verify routes and logs
   - Data: use staging Appwrite project or safe fixtures
7. **Production Deploy** (release captain)
   - `vercel --prod`
   - Run smoke checks (Admin → Diagrams; key pages)
8. **Observability & Follow‑up**
   - Sentry errors monitored for 24–48h
   - Post‑deploy metrics (Core Web Vitals, API latency)
   - Create follow‑ups for regressions

## Checklists

- PR Checklist
  - [ ] Zod validation on inputs
  - [ ] Errors mapped to correct status codes
  - [ ] No `any` types introduced
  - [ ] Client components only when necessary
  - [ ] No server secrets in client bundles
  - [ ] Tests added/updated (unit/integration/e2e)
  - [ ] Docs updated
- Release Checklist
  - [ ] All CI checks green
  - [ ] Preview verified
  - [ ] Migrations (if any) are backward‑compatible
  - [ ] Feature flags set (if applicable)
  - [ ] Rollback plan documented

## Commands & Automation

```bash
# Local quality gates
npm run lint && npm run typecheck && npm test && npm run build

# E2E (targeted)
npm run test:e2e -- tests/e2e/smoke/*.spec.ts

# Deploy
vercel --prod --yes

# Diagram live audit (production)
BASE_URL=https://<deploy-url> npx tsx ops/common/scripts/audit-diagrams-live.ts
```

## Integrations

- **Vercel**: previews, prod deploys, analytics
- **Appwrite**: database, functions, auth, realtime
- **Vercel KV**: hot paths caching
- **Sentry**: error tracking
- **AI**: Vercel AI SDK, Anthropic Claude for planning/copy, Chrome AI for image ops

## SLA & Rollback

- Normal deploys target <15 min end‑to‑end
- Rollback via `vercel rollback` or revert merge; for data changes, prefer toggles/canaries

## References

- PDS Section 5 Workflows: https://drive.google.com/file/d/1FPK9vfsEUfFGT6SWMVB1yZxbWPQxtEWT/view?usp=drive_link
- Workflows Folder: https://drive.google.com/drive/folders/1WDCsre-t8J5EBk_-cJrm-B0iSb7t0WzD?usp=sharing

<<<<<<< HEAD
Diagram: /admin/diagrams/workflows%3Aship-feature
=======
Diagram: /admin/diagrams/workflows%3Aproduction-process
>>>>>>> 24f9fd624f579848150ad3605557a38310d191b4
