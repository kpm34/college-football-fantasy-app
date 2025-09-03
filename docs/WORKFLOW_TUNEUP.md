# Workflow Tune-up (Weekly 10 minutes)

Goal: remove friction; boost creative time.

## 1) Dev session hygiene
- Run `npm run session:preflight` and address recurring lint/type errors
- Kill stale dev servers (`npm run session:fixport`)

## 2) Prompts & patterns
- Review `docs/PROMPT_TEMPLATES.md` → add any new recurring prompts
- Trim overly long prompts; ensure Goal/Context/Constraints clear

## 3) Editor & extensions
- Confirm required extensions installed (`docs/VS_CODE_EXTENSIONS_GUIDE.md`)
- Update `.vscode/settings.json` if any tweak improves DX

## 4) Health & smoke
- Keep `docs/api/*.http` working for key endpoints
- Add/update a Playwright smoke for any new critical flow

## 5) Docs & diagrams
- New flows → add `.drawio` under `docs/diagrams/**`; verify `/docs/...` loads
- Remove duplicates; move legacy to `ops/attic`

## 6) CI/CD & deploy
- Ensure `npm run predeploy` is green
- After deploy, verify `/api/health` and one end-to-end click path

## 7) Retrospective (2 min)
- What slowed us down last week? One tweak to remove it.
- What should we automate next?
