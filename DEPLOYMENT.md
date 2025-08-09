# Deployment & Workflow Guide

## 🎯 Project Overview

### College Football Fantasy App
- **Production**: https://cfbfantasy.app
- **Framework**: Next.js 15 with App Router
- **Database**: Appwrite
- **Features**: Fantasy football for Power 4 conferences

### Future Enhancement (Not Yet Integrated)
- **Awwwards-Rig**: 3D graphics engine available in `vendor/awwwards-rig/`
- **Status**: Submodule present but not actively used
- **Purpose**: Future 3D visualizations and animations

## 🚀 Quick Deploy

### Prerequisites
- Node.js 18-22
- Vercel CLI installed (`npm i -g vercel`)
- Environment variables configured
- Git submodules initialized

### One-Command Deploy
```bash
# Deploy to production
npm run deploy

# Or manually
vercel --prod
```

## 📋 Deployment Checklist

### Before Deploying
- [ ] Environment variables set in `.env` and `frontend/.env.local`
- [ ] All tests passing
- [ ] Build successful locally (`npm run build`)
- [ ] Database migrations applied
- [ ] API keys valid and not expired

### Deploy Commands
```bash
# Development preview
vercel

# Production deployment  
vercel --prod

# Pull latest environment
vercel pull --yes --environment=production

# Check deployment status
vercel ls

# View logs
vercel logs
```

## 🔄 Development Workflow

### Local Development
```bash
# 1. Install dependencies
npm run install:all

# 2. Set up environment
cp .env.consolidated frontend/.env.local

# 3. Start development
npm run dev          # Frontend (port 3001)
npm run server       # Backend (port 3000)
```

### Feature Development Flow
1. **Branch Creation**
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Development**
   - Make changes
   - Test locally
   - Run linting: `npm run lint:fix`
   - Type check: `npm run typecheck`

3. **Testing**
   ```bash
   npm run build        # Ensure build works
   npm test            # Run tests
   ```

4. **Deployment**
   ```bash
   # Preview deployment
   vercel
   
   # After approval, deploy to production
   vercel --prod
   ```

## 🌍 Production URLs

### Main Domains
- https://cfbfantasy.app (Primary)
- https://www.cfbfantasy.app
- https://collegefootballfantasy.app
- https://www.collegefootballfantasy.app

### Vercel Domains
- https://college-football-fantasy-app.vercel.app
- https://college-football-fantasy-app-kpm34s-projects.vercel.app

## 🔐 Environment Variables

### Critical Variables
```bash
# Appwrite (Database)
APPWRITE_PROJECT_ID=college-football-fantasy-app  # NOT the numeric ID!
APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
APPWRITE_API_KEY=[configured]
APPWRITE_DATABASE_ID=college-football-fantasy

# APIs
CFBD_API_KEY=[configured]
AI_GATEWAY_API_KEY=[configured]

# Vercel
EDGE_CONFIG=[configured]
VERCEL_OIDC_TOKEN=[expires - refresh with vercel pull]
```

### Refresh OIDC Token
```bash
# Token expires after ~12 hours
vercel pull --yes --environment=production
```

## 🛠️ Vercel Configuration

### Project Settings
- **Framework**: Next.js
- **Build Command**: `next build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Development Command**: `next dev`

### Environment Variables in Vercel
1. Go to [Vercel Dashboard](https://vercel.com/kpm34s-projects/college-football-fantasy-app)
2. Settings → Environment Variables
3. Add/Update variables for Production/Preview/Development

### Edge Config
- Used for feature flags
- Real-time updates without redeploy
- Access via `EDGE_CONFIG` environment variable

## 📊 Monitoring

### Check Deployment Status
```bash
# List recent deployments
vercel ls

# Inspect specific deployment
vercel inspect [deployment-url]

# View logs
vercel logs --follow
```

### Analytics
- Vercel Analytics enabled
- View at: https://vercel.com/kpm34s-projects/college-football-fantasy-app/analytics

## 🔧 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

#### Environment Variable Issues
```bash
# Pull latest from Vercel
vercel pull --yes --environment=production

# Verify variables
vercel env ls
```

#### OIDC Token Expired
```bash
# Refresh token
vercel pull --yes --environment=production
# Check .env.production.local for new token
```

## 🏗️ CI/CD Pipeline

### Automatic Deployments
- **Production**: Pushes to `main` branch
- **Preview**: Pull requests automatically deployed
- **Rollback**: Available in Vercel dashboard

### Manual Deployment
```bash
# From any branch
vercel --prod --force
```

## 📝 Post-Deployment

### Verify Deployment
1. Check all production URLs
2. Test critical user flows:
   - Landing page loads
   - API endpoints respond
   - Database connections work
   - 3D graphics render
3. Monitor error logs
4. Check performance metrics

### Rollback if Needed
```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback [deployment-id]
```

## 🚨 Emergency Procedures

### Site Down
1. Check Vercel status: https://www.vercel-status.com/
2. View logs: `vercel logs --follow`
3. Rollback if needed: `vercel rollback`
4. Check database status in Appwrite console

### API Keys Compromised
1. Regenerate keys in respective services
2. Update in Vercel Dashboard
3. Redeploy: `vercel --prod --force`

## 📚 Resources

- [Vercel Dashboard](https://vercel.com/kpm34s-projects/college-football-fantasy-app)
- [Appwrite Console](https://cloud.appwrite.io/console/project-college-football-fantasy-app)
- [Project Repository](https://github.com/your-repo)
- Team: kpm34s-projects

---

**Last Updated**: 2025-08-09  
**Maintained by**: Development Team