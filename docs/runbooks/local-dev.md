# Local Development

- Node.js: use .nvmrc or latest LTS
- Install deps: npm install
- Env: vercel pull --environment=development
- Start dev: npm run dev (port 3001)
- Typecheck: npm run typecheck
- Lint: npm run lint
- Health: curl http://localhost:3001/api/health
