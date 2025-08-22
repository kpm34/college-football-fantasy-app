# Deploy Runbook

- Pull env: vercel pull --environment=production
- Build locally: npm run build
- Deploy: vercel --prod
- Alias: vercel alias set <deployment> cfbfantasy.app
- Verify: vercel logs --follow
