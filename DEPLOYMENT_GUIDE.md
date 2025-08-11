# College Football Fantasy App - Complete Deployment Guide

## Overview
This guide ensures perfect synchronization between your code, Vercel, Appwrite, and GitHub.

## Prerequisites
- GitHub account with repository access
- Vercel account linked to GitHub
- Appwrite Cloud account (or self-hosted instance)
- Node.js 18+ installed locally

## 1. Local Development Setup

### Clone and Install
```bash
git clone https://github.com/kpm34/college-football-fantasy-app.git
cd college-football-fantasy-app/frontend
npm install
```

### Environment Variables
Create `frontend/.env.local` with:
```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=college-football-fantasy-app
NEXT_PUBLIC_APPWRITE_DATABASE_ID=college-football-fantasy
```

### Run Development Server
```bash
npm run dev
```
Visit http://localhost:3000

## 2. Appwrite Configuration

### Required Platforms
Add these domains in Appwrite Console → Settings → Platforms:
- `localhost`
- `cfbfantasy.app`
- `*.cfbfantasy.app`
- `collegefootballfantasy.app`
- `*.collegefootballfantasy.app`
- `*.vercel.app`

### Collections Required
- leagues
- teams
- rosters
- players
- games
- rankings
- users
- activity_log
- draft_picks
- auction_bids
- auction_sessions

## 3. Vercel Deployment

### Initial Setup (One Time)
1. Link to Vercel:
   ```bash
   cd college-football-fantasy-app
   vercel link --yes --project college-football-fantasy-app
   ```

2. Set Root Directory in Vercel Dashboard:
   - Go to: https://vercel.com/[your-team]/college-football-fantasy-app/settings/general
   - Under "Build & Development Settings"
   - Set "Root Directory" to: `frontend`
   - Save changes

3. Configure Environment Variables in Vercel:
   - Go to Settings → Environment Variables
   - Add all variables from `.env.local`

### Deploy Commands
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## 4. Authentication Flow

### How It Works
1. **Server-Side Auth**: All authentication happens through API routes
2. **Secure Sessions**: Uses httpOnly cookies for session management
3. **No CORS Issues**: Server-to-server communication with Appwrite

### API Routes
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/user` - Get current user

### Frontend Usage
```tsx
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, loading, logout } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please log in</div>;
  
  return <div>Welcome {user.email}!</div>;
}
```

## 5. Common Issues & Solutions

### Issue: API routes return 404 on production
**Solution**: Ensure Vercel's root directory is set to `frontend`

### Issue: Login works locally but not on production
**Solution**: Check that all domains are added to Appwrite platforms

### Issue: "Invalid Origin" error
**Solution**: This should not happen with our server-side approach. If it does, check Appwrite platforms.

### Issue: Session not persisting
**Solution**: Ensure cookies are enabled and using HTTPS in production

## 6. Development Workflow

### Feature Development
1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes and test locally
3. Commit and push: `git push origin feature/my-feature`
4. Create PR on GitHub
5. Vercel creates preview deployment automatically
6. Merge to main after review

### Production Deployment
- Pushing to `main` branch triggers automatic production deployment
- Or manually: `vercel --prod`

## 7. Monitoring & Maintenance

### Check Deployment Status
```bash
vercel ls
```

### View Logs
```bash
vercel logs
```

### Rollback if Needed
1. Go to Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "Promote to Production"

## 8. Best Practices

1. **Always test locally first**
2. **Use preview deployments** for testing
3. **Keep environment variables in sync** between local and Vercel
4. **Monitor error logs** in Vercel dashboard
5. **Regular backups** of Appwrite data

## 9. Emergency Contacts

- Vercel Status: https://vercel-status.com
- Appwrite Status: https://status.appwrite.io
- GitHub Status: https://githubstatus.com

## 10. Quick Commands Reference

```bash
# Local development
cd frontend && npm run dev

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs

# Link to project
vercel link

# Pull environment variables
vercel env pull
```

---

Remember: The key to avoiding issues is maintaining consistency across all platforms. When in doubt, refer to this guide!
