# Project Overview

Start here:
- docs/PROJECT_MAP.md
- schema/zod-schema.ts (SSOT)
- ops/playbooks.md (AI toolbox)
- GET /api/health

/app           # Next.js App Router + /app/api/* HTTP endpoints
/components    # Reusable UI
/lib           # SDK clients (Appwrite, OpenAI), utilities, domain logic under /lib/domain
/schema        # SSOT (e.g., zod-schema.ts) and generators (never write generated files back here)
/functions     # Non-HTTP runtime: Appwrite Functions, workers, queues, ETL, cron tasks
/ops           # AI toolbox only: prompts, playbooks, codemods, guards (dev-time), Cursor/Claude helpers
/docs          # Project map, diagrams, runbooks
/data          # Datasets and processed inputs (EA ratings, depth charts, efficiency)
/data-io       # Data scripts & utilities (Python, ETL helpers)
/public        # Static assets and public JSON (if truly needed)
