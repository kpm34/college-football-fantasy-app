# Vercel Deploy Guide

## Quick Deploy Commands

### Basic Deployment
```bash
# Deploy to preview (from frontend directory)
cd frontend
vercel

# Deploy to production
vercel --prod

# Deploy with automatic yes to all prompts
vercel --yes --prod
```

### Force Deploy (Skip Cache)
```bash
# Force new deployment without cache
vercel --force --prod

# Force deploy but keep build cache
vercel --force --with-cache --prod
```

## Project Setup

### First Time Setup
```bash
# Link to existing project
vercel link

# Deploy new project with defaults
vercel --yes
```

### Environment Variables
```bash
# Deploy with build-time env vars
vercel --build-env KEY1=value1 --build-env KEY2=value2

# Deploy with runtime env vars
vercel --env KEY1=value1 --env KEY2=value2
```

## Advanced Options

### Deployment Options
```bash
# Deploy without waiting for completion
vercel --no-wait

# Deploy with build logs
vercel --logs

# Deploy to specific region
vercel --regions iad1

# Skip domain assignment (production only)
vercel --prod --skip-domain
```

### Archive & Optimization
```bash
# Deploy with archive (for large projects)
vercel --archive=tgz

# Build locally then deploy
vercel build
vercel deploy --prebuilt --archive=tgz
```

## Troubleshooting

### Common Issues

1. **Root Directory Error**
   - Set in Vercel Dashboard Settings, not vercel.json
   - Go to Settings → General → Root Directory → Set to "frontend"

2. **CORS/API Routes Not Working**
   - Ensure root directory is set correctly
   - Redeploy after changing settings
   - Clear browser cache and service workers

3. **Build Failures**
   ```bash
   # Force rebuild without cache
   vercel --force --prod
   
   # Check build logs
   vercel --logs
   ```

## Project Configuration

### vercel.json (Keep it simple)
```json
{
  "version": 2
}
```

### Environment Setup
1. Set environment variables in Vercel Dashboard
2. Use `.env.local` for local development
3. Never commit sensitive keys

## Deployment Workflow

### From Command Line
```bash
# 1. Make changes and commit
git add .
git commit -m "fix: your changes"
git push origin main

# 2. Deploy manually if needed
cd frontend
vercel --prod
```

### From Dashboard
1. Go to Deployments tab
2. Click "Redeploy" on latest deployment
3. Or create new deployment from specific commit

## Useful Scripts

### Check Deployment Status
```bash
# Save deployment URL
vercel > deployment-url.txt

# Check deployment with error handling
vercel deploy >deployment-url.txt 2>error.txt
if [ $? -eq 0 ]; then
    echo "Deployed to: $(cat deployment-url.txt)"
else
    echo "Error: $(cat error.txt)"
fi
```

### Alias to Custom Domain
```bash
# Deploy and alias
deploymentUrl=$(vercel)
vercel alias $deploymentUrl my-custom-domain.com
```

## Best Practices

1. **Always test locally first**
   ```bash
   npm run build
   npm run start
   ```

2. **Use preview deployments**
   ```bash
   # Deploy to preview first
   vercel
   # Then promote to production
   vercel --prod
   ```

3. **Monitor deployments**
   - Check build logs: `vercel --logs`
   - View in dashboard for detailed errors
   - Test API routes after deployment

## Quick Reference

| Command | Description |
|---------|-------------|
| `vercel` | Deploy to preview |
| `vercel --prod` | Deploy to production |
| `vercel --yes` | Skip prompts |
| `vercel --force` | Force new build |
| `vercel --logs` | Show build logs |
| `vercel link` | Link to project |
| `vercel env pull` | Pull env vars |

## For This Project

```bash
# Ensure you're in frontend directory
cd frontend

# Deploy to production with our settings
vercel --yes --prod --force

# Test API routes after deployment
curl https://cfbfantasy.app/api/auth-test
```
