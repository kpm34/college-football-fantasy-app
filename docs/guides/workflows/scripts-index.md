---
title: Active Scripts Index
updated: 2025-09-11
---

This page lists the scripts we keep as “active” (not archived) and what they do. Legacy/duplicates were moved to `ops/attic/scripts-legacy/`.

## Diagrams (ops/diagrams)
- `generate-sitemap-from-routes.ts`: Scans Next.js `app/**/page.tsx` and generates the inverted tree site maps (Mermaid `graph TD`).
- `generateApiRoutingMaps.ts`: Scans API routes and emits routing, externals, and data-sources diagrams.
- `reportCodedVsWorking.ts`: Import graph + route health report.
- `export-live-schema-mermaid.ts`: Mermaid from live Appwrite schema.
- `generateDraftBoard.ts`: Compose draft board diagram from draft data.

## Appwrite / Data (ops/common/scripts)
- `appwrite/appwrite-enhancements.ts`: One-off QoL improvements for Appwrite config.
- `appwrite/appwrite-user-enhancements.ts`: User-level Appwrite fixes.
- `appwrite/fetch-current-schema.ts`: Pull SSOT from Appwrite.
- `sync-appwrite-simple.ts`: Push SSOT to Appwrite (simple sync).
- `validate-current-schema.ts`: Validate Appwrite schema integrity.
- `validate-schema-compliance.ts`: Check schema compliance vs SSOT rules.
- `export-live-schema.ts`: Export schema snapshot.
- `export-complete-database.ts`: Full DB export.

## Ingestion & Normalization (ops/common/scripts)
- `ingestEA.ts`, `ingestTeamEfficiency.ts`, `ingestDepthCharts.ts`: Source-specific imports.
- `run-data-ingestion.ts`: Orchestrate ingestion pipeline.
- `normalize-ea-ratings.ts`, `normalize-depth-charts.ts`: Cleanup and normalization.
- `populate-model-inputs.ts`: Build `model_inputs` collection documents.
- `cleanup-draft-pool.ts`, `fix-draftable-players.ts`, `fix-depth-chart-projections.ts`: Maintenance/repair tasks.

## Draft / Testing (ops/common/scripts/mock-draft)
- `human-e2e.ts`: End‑to‑end draft run.
- `concurrency-test.ts`, `concurrency-test-simple.ts`: Stress tests.
- `run.ts`: Entry to launch mock drafts.

## Misc Utilities (ops/common/scripts)
- `capture-inspiration.ts`: Save design inspiration assets.
- `generate-icons.js`, `generate-pwa-icons.js`: Asset generation.
- `open-latest-context.ts`: Opens the latest context pack.
- `test-*` scripts: Small health checks (e.g., OAuth config, draft button window).

## Archived (ops/attic/scripts-legacy/)
- `audit-diagrams.ts` (replaced by `audit-diagrams-live.ts` and admin audits).
- `generate-project-map-diagrams.ts` (manual generator superseded by current diagram flow).
- `eval_proj.ts` (misc evaluation now unused).

> Tip: Add new scripts under `ops/common/scripts/` with a one‑line header comment describing purpose and usage. Keep long‑lived/infra scripts here; ad‑hoc experiments go to `ops/attic/scripts-legacy/` when done.
