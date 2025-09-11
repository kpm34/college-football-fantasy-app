---
title: Track Events Correctly — Spec → QA → Dashboards
updated: 2025-09-11
---

## Event Spec

- Naming: `domain.action.object` (e.g., `draft.pick.submitted`)
- Required fields: `userId`, `sessionId`, `timestamp`, `source`, `context`
- Privacy: no PII in free‑text; hash when necessary

## Implementation

- Client emits via thin wrapper; server validates and enriches
- Store in Appwrite `events` collection and/or forward to analytics sink

## QA Matrix

- Unit: schema validity; required fields present
- Integration: event fired on UI actions; rate/volume sane
- E2E: golden path emits expected sequence

## Dashboards & KPIs

- Build core dashboards (DAU, activation, draft funnel)
- Iteration cadence: weekly review → adjust events

## AI & Tools

- Use Claude to review event taxonomy and suggest gaps
- Use Vercel AI SDK to generate test event payloads for QA

Diagram: /admin/diagrams/workflows%3Atrack-events-correctly
