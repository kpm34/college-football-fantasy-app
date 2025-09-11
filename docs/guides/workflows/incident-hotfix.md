---
title: Fix a Production Incident — Runbook & SLAs
updated: 2025-09-11
---

## Severity & SLAs

- Critical outage (P1): acknowledge ≤ 5 min, mitigate ≤ 30 min, fix ≤ 4 h
- Degraded service (P2): acknowledge ≤ 15 min, mitigate ≤ 60 min, fix ≤ 24 h

## On‑call Flow

1. Detect (Sentry alert, uptime check, user report)
2. Acknowledge (on‑call)
3. Triage severity (Critical / Degraded)
4. Mitigate (rollback, feature flag, scale)
5. Fix (hotfix branch) → verify → deploy
6. Postmortem (root cause, actions, owners, due dates)

## Mitigation Playbook

- Rollback: `vercel rollback` to last green
- Feature flag off: disable risky code path
- Scale up: adjust plan/instances for transient load
- Cache: increase KV TTL for hot endpoints (if safe)

## Fix & Verify

- Branch `hotfix/<issue>` → PR with focused diff
- CI gates: lint, types, tests, build, targeted e2e
- Canary via preview; verify logs and Sentry
- Deploy to prod; run smoke tests (Admin → Diagrams, key routes)

## AI & Tooling Assists

- Claude summary of Sentry event → draft GitHub issue with steps and hypothesis (Anthropic)
- Vercel AI SDK prompt to generate regression tests from the stack trace
- Chrome AI to extract repro steps from user video/screenshots (if provided)

## Communications

- Status page update (if public impact)
- Stakeholder updates at key milestones (acknowledged, mitigated, resolved)

## Postmortem Template

- Impact summary
- Timeline (UTC)
- Root cause
- What went well / poorly
- Action items (owner, due date)

## References

- Anthropic Claude: https://docs.anthropic.com
- Vercel: https://vercel.com/docs/deployments/overview
- Appwrite Realtime & Functions: https://appwrite.io/docs/products
- Sentry: https://docs.sentry.io

Diagram: /admin/diagrams/workflows%3Afix-prod-incident
