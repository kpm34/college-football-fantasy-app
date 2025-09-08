# Working Session Playbook (Cursor + App)

Goal: minimize troubleshooting; maximize creative build.

## 0) Prep (1 min)
- Terminal: `npm run session:fixport` (frees :3001)
- Pull env: `vercel env pull .env.local` if needed
- Ensure Appwrite creds in `.env.local`

## 1) Start (2 min)
- `npm run session:start` (kills port, preflight, starts dev)
- Open tabs auto via macOS: `/`, `/admin/draft-diagrams`, `/api/health`

## 2) Guardrails (always-on)
- Keep `npm run health:vercel` open for logs
- Use `.http` files in `docs/api` to test endpoints
- Run `npm run lint` and `npm run typecheck` before commits

## 3) Diagram workflow
- Source of truth: `docs/diagrams/**`
- Viewer uses `/docs/**` static path (symlinked)
- Add new draw.io files under `docs/diagrams/<area>/`

## 4) Fast debug
- If port clash: `npm run session:fixport`
- Quick rebuild: `npm run build` (SKIP_ENV_VALIDATION)
- Check SSR errors: browser console + Vercel logs

## 5) Deploy
- `npm run predeploy` → `vercel --prod`
- Alias to prod domain if needed

## 6) Closeout
- Commit with Conventional Commits
- Update `/docs` if diagrams or API change
