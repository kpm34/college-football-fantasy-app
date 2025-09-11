---
title: Workflow Diagram — Planning & Authoring Playbook
source: Drive Section 5 — Workflow Diagrams Planning & Authoring Playbook
updated: 2025-09-11
---

## Purpose
Define async/background processes (cron jobs, ETL, queues) with clear triggers, steps, and observability. Workflows are organized under `docs/diagrams/workflows/`.

## Visual style
- Use Mermaid `flowchart TD` or `sequenceDiagram` when interactions are time‑ordered.
- Show triggers (cron, webhook), workers (Appwrite Functions, workers/), queues, and data sinks (Appwrite, KV, Storage) with labeled edges.

## Content rules
- One workflow per diagram; include retry/backoff and failure sinks.
- Indicate schedule (cron) or event source; show idempotency keys when relevant.
- Add monitoring hooks (Sentry, logs) and SLAs if defined.

## Authoring steps
1. Name the workflow and its trigger.
2. List steps in order; draw as nodes with concise verbs.
3. Add error branches and compensation steps.
4. Annotate time windows and rate limits.

## Parser‑safe Mermaid conventions
- Quote labels with slashes/parentheses: `["/api/jobs/run"]`.
- Prefer simple lane titles; avoid bracketed subgraph titles.
- Keep shapes consistent; avoid special variants like `[/ ... /]`.

## Mermaid template
```mermaid
flowchart TD
  cron([Cron Trigger]) --> step1[Fetch Data]
  step1 --> step2[Transform]
  step2 --> step3[Upsert to DB]
  step2 -->|Error| deadletter[(DLQ)]
```

## Render & audit
- Preview via Admin: `/admin/diagrams/workflows:index` and specific slugs.
- Live audit (production):
  - `BASE_URL=https://<deploy-url> npx tsx ops/common/scripts/audit-diagrams-live.ts`

### Citations
- Drive PDS Folder: https://drive.google.com/drive/folders/1WDCsre-t8J5EBk_-cJrm-B0iSb7t0WzD?usp=sharing
- Section 5: https://drive.google.com/file/d/1FPK9vfsEUfFGT6SWMVB1yZxbWPQxtEWT/view?usp=drive_link
