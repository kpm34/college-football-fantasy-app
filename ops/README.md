# Ops Guide (Single Source)

This is the single, consolidated guide for all operational tooling. Tell ChatGPT to “reference the ops folder” and use the commands below.

## Structure
```
ops/
  common/scripts/        # Shared scripts for all providers (canonical source)
  claude-ops/            # Claude CLI and provider-specific helpers
  cursor-ops/            # Cursor toolbox + commands
  chatgpt-ops/           # ChatGPT-specific guidance/integrations
```

Rules:
- All runnable scripts live in `ops/common/scripts/`.
- Do not duplicate scripts across providers; reference the common path.
- When moving scripts, update package.json and docs to the new path.

## Quick Commands (use ops/common/scripts)

Schema & Guards
```bash
npx tsx ops/common/scripts/sync-appwrite-simple.ts
npx tsx ops/common/scripts/validate-ssot-schema.ts
npx tsx ops/common/scripts/guards/validate-ssot-integrity.ts
npx tsx ops/common/scripts/guards/forbid-legacy-collections.ts
```

Data & Ingestion
```bash
# Ingest data
ts-node ops/common/scripts/ingestEA.ts --season=2025
npx tsx ops/common/scripts/run-data-ingestion.ts --season 2025 --week 5

# Exports
npx tsx ops/common/scripts/export-college-players-json.ts
npx tsx ops/common/scripts/export-complete-database.ts
```

Mock Draft & Tests
```bash
npx tsx ops/common/scripts/mock-draft/run.ts
node ops/common/scripts/test-e2e.js
```

Design & Media
```bash
node ops/common/scripts/figma-sync.js all
node ops/common/scripts/video-workflow.js create-highlight --input "clips"
```

## Provider Tooling

Claude (Anthropic)
```bash
node ops/claude-ops/claude-cli.js
# Commands: /code, /review, /explain, /test
```

Cursor
- Toolbox: `ops/cursor-ops/TOOLBOX_CURSOR.md`
- Commands: `ops/cursor-ops/CURSOR_COMMANDS.md`

ChatGPT
- Use the shared scripts in `ops/common/scripts`.

## ChatGPT + GitHub
1) Connect GitHub to ChatGPT and grant access to `kpm34/college-football-fantasy-app`.
2) Share the active PR/branch URL so ChatGPT sees the latest structure.
3) Tell ChatGPT explicitly: “Use `ops/common/scripts` for scripts; refer to `ops/` docs.”

## Maintenance
- Scripts only in `ops/common/scripts/`.
- Provider-specific docs live in `ops/*-ops/`.
- Repository diagrams reflect `ops/common/scripts` as canonical scripts location.
