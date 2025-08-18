# Mascot Studio — Cursor AI Implementation Playbook (2025)

Goal: Ship a non-expert-friendly 3D model editor ("Mascot Studio") that automates Meshy → Blender → Appwrite storage with a dead-simple UI and rich presets.

## 0) North Star & UX Tenets

- Zero 3D jargon: Use plain-language options (Colors, Materials, Accessories, Decals, Effects)
- 1-click results: Every change should preview in < 5s (progress states + cached low-poly previews)
- Always recoverable: Version history + Undo/Redo
- Safe defaults: Preset palettes, materials, decals, and layouts
- Performance-first: Output GLB optimized for web (texture atlas, compression, < 5MB target when possible)

## 1) Feature Roadmap (Prioritized)

### Phase 1 — Thin Slice (MVP)
- Base model selection (template/upload GLB/OBJ)
- Color & material presets
- Decal text + positioning (side/front/back for helmets; chest/back for mascots)
- Meshy job submission → DCP → Blender clean → Appwrite upload
- Viewer (react-three-fiber) + thumbnail
- Save as template (optional public sharing)

### Phase 2 — Comfort Features
- Accessory library (horns, visors, gloves, tails, badges)
- Smart constraints (e.g., decals auto-fit to valid UV regions)
- Versioning with preview diffs (side-by-side)
- Per-material AO/roughness/metallic sliders (range-limited)

### Phase 3 — Power & Scale
- Bulk style application across a league/team set
- Theme packs (cartoon, chrome, leather, vintage)
- Asset kitbashing (attach/remove mesh parts)
- Texture upscaling/compression pipeline (gltfpack, BasisU/KTX2)
- Community template marketplace (moderation + license acceptance)

## 2) System Overview

- Frontend (Next.js/React): react-three-fiber viewer, form-driven editor, history manager
- Agent (Node/Python): Translates UI JSON → Meshy prompt, polls job, downloads asset, runs Blender headless, uploads to Appwrite, writes metadata
- Storage (Appwrite): Buckets for models/thumbnails/uploads; Collections for templates & jobs
- DCP/Workers: Long-running Meshy/Blender jobs; retriable; progress updates via webhooks

### Appwrite Project (existing)
- Project ID: `college-football-fantasy-app`
- Endpoint: `https://nyc.cloud.appwrite.io/v1`
- Database ID: `college-football-fantasy`
- Collections (existing): `leagues`, `teams`, `college_players`, `rosters`, `lineups`, `auctions`, `bids`, `games`, `rankings`, `player_stats`, `users`

### New Storage & Data
- Buckets: `mascot_models`, `mascot_thumbnails`, `user_uploads`
- Collections: `mascot_templates`, `mascot_jobs`

## 3) Cursor Working Agreement (How Cursor should operate)

- Plan: Propose options with tradeoffs, pick one, list risks
- Scaffold: Generate minimal file structure + contracts first
- Implement Thin Slice: One vertical path from UI → API → Meshy → Blender → Appwrite → UI
- Test: Unit + integration + manual script; mock Meshy if needed
- Instrument: Basic telemetry events + logs
- Docs: Update README and OPERATIONS.md with runbooks
- PR: Summarize scope, decisions, and how to revert

### Guardrails
- Use TypeScript, strict mode on
- No silent failures; return typed Result objects
- Idempotent job handlers
- Feature flags for experimental tools (Runway/ComfyUI)

## 4) Prompt Templates for Cursor

### 4.1 — Architecture/Plan Prompt
```text
You are my senior engineer building Mascot Studio (a non-expert 3D editor). Propose a plan for a THIN vertical slice that lets a user: (1) pick base model, (2) set colors/material preset, (3) add a single side decal, (4) submit to Meshy, (5) Blender cleanup, (6) Appwrite upload, (7) preview in viewer.

Constraints:

Next.js + TypeScript frontend
react-three-fiber viewer
Node worker for Meshy job; Blender runs headless via CLI
Appwrite project: id=college-football-fantasy-app, endpoint=https://nyc.cloud.appwrite.io/v1, db=college-football-fantasy
Create buckets: mascot_models, mascot_thumbnails, user_uploads; collections: mascot_templates, mascot_jobs

Deliver:

File tree
Contracts (TS types) for Job, Template, Decal
API routes & worker entrypoint
Acceptance criteria & tests
Risks + mitigations
```

### 4.2 — Feature Spec Template (fill before coding)
```text
Title:

Why / Outcome:

User Stories:
As a user, I can …

API & Contracts:
- Types (TS)
- REST endpoints (method, path, payload, response)

Data Model:
- Appwrite buckets/collections touched, fields, indexes

UX Notes:
- States, loading, error, empty

Perf & Limits:
- Target sizes, timeouts, retries

Security:
- Auth, permissions

Testing:
- Unit, integration, e2e

DoD:
- Checklist with screenshots, logs, docs
```

### 4.3 — Implementation Prompt
```text
Implement the Thin Slice plan now. Generate:

TS types in packages/contracts/mascot.ts
API route apps/web/app/api/mascot/generate/route.ts
Worker apps/worker/src/meshyWorker.ts
Blender script apps/worker/blender/blender_job_runner.py
Appwrite ensure script tools/ensureAppwrite.ts
React viewer apps/web/components/MascotEditor.tsx

Follow contracts, add TODOs where external keys are needed. Write basic unit tests and a manual scripts/dev/run-thin-slice.sh to simulate a job end-to-end (mock Meshy allowed). Update README.
```

### 4.4 — Test Prompt
```text
Write unit tests for:

- promptBuilder: JSON → Meshy text prompt
- validateDecalPlacement: ensure decal within UV region bounds
- worker idempotency: reprocess same job safely
- appwrite ensure script: no-op if resources exist

Provide vitest setup and sample fixtures.
```

### 4.5 — Refactor Prompt
```text
Refactor worker to use a clean state machine with explicit transitions: PENDING → SUBMITTED → MESHY_DONE → BLENDER_DONE → UPLOADED → COMPLETED | FAILED. Make transitions typed; log at INFO level; metrics events emitted on each transition.
```

### 4.6 — Debug Prompt
```text
We’re seeing missing thumbnails for some jobs. Add robust error handling and retries around Blender render and Appwrite upload; attach job-level lastError field; write a scripts/ops/retry-job.ts CLI.
```

### 4.7 — Review/PR Prompt
```text
Create a PR description summarizing: scope, decisions made (libraries, formats), how to test locally, risks, and rollback steps. Include before/after screenshots and log snippets.
```

---

## Acceptance Criteria (Thin Slice)
- User can select a base model (from default football/helmet or upload)
- User can pick a color/material preset and add one side decal
- Submitting triggers Meshy job → webhook queues Blender clean → Appwrite upload
- UI shows progress and renders the resulting GLB in the viewer
- Saved template appears under “Your Saved Mascots” and can be reloaded
- Output GLB ≤ 5 MB (if feasible) with KTX2 textures and reasonable draw calls

## Risks & Mitigations (Selected)
- Meshy latency: cache low-poly previews; show progress; allow cancel/retry
- Blender headless failures: implement idempotent retry with backoff; job lastError and logs
- CORS/file hosting: serve via Appwrite bucket + signed URL proxy if needed
- Schema drift: ensure migrations; fetch attributes before updates; feature flags for new ops
- Cost control: cap job concurrency; throttle per user; archive large assets; enforce size limits

## Runbooks
- Ensure resources: call `/api/migrations/ensure-buckets` and `/api/migrations/ensure-blender-jobs` and `/api/migrations/ensure-meshy-jobs`
- Check pipeline health: `/api/meshy/jobs`, `/api/meshy/webhook`, `/api/blender/jobs`, `/api/blender/exports`
- Retry a failed job: scripts/ops/retry-job.ts (to be added)

## Links
- Meshy Docs: https://docs.meshy.ai/en
- Next.js App: `app/team/[teamId]/mascot` (main) and `vendor/awwwards-rig/src/app/mascot` (studio prototype)
- Appwrite Console: https://cloud.appwrite.io
- Vercel Dashboard: https://vercel.com
