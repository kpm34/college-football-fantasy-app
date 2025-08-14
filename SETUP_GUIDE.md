# College Football Fantasy App - Complete Setup Guide

## 🚀 Quick Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Appwrite account with API key
- Vercel account (for deployment)

### Initial Setup

1. **Clone and Install**
```bash
git clone [repository-url]
cd college-football-fantasy-app
npm install
```

2. **Configure Environment**
```bash
# Copy example env file
cp .env.example .env.local

# Edit .env.local and add your keys:
# - APPWRITE_ENDPOINT
# - APPWRITE_PROJECT_ID  
# - APPWRITE_API_KEY
# - APPWRITE_DATABASE_ID
# - And other required keys
```

3. **Sync Database Schema**
```bash
# This creates all collections with proper permissions
APPWRITE_API_KEY="your-key" npm run db:sync
```

4. **Verify Setup**
```bash
# Check all permissions are correct
APPWRITE_API_KEY="your-key" npm run db:check
```

5. **Start Development**
```bash
npm run dev
# Visit http://localhost:3000
```

## 📋 Daily Development Workflow

### Before Starting Work
```bash
# Get latest code
git pull origin main

# Check database is in sync (runs automatically with npm run dev)
npm run dev
```

### Making Changes

#### Adding a Database Field:
1. Update `docs/DATABASE_SCHEMA.md`
2. Update `scripts/sync-appwrite-complete.js`
3. Run `APPWRITE_API_KEY="your-key" npm run db:sync`
4. Update TypeScript types
5. Update relevant API routes

#### Adding an API Route:
1. Create route file in `app/api/`
2. Document in `docs/API_ROUTES.md`
3. Add error handling
4. Test with regular user account

#### Before Committing:
```bash
# Lint and type check
npm run lint
npm run typecheck

# Format code
npm run format
```

## 🚨 Common Issues & Solutions

### 1. "Unauthorized" Error (401)
```bash
# Fix permissions
APPWRITE_API_KEY="your-key" npm run db:sync

# Or fix specific collection
APPWRITE_API_KEY="your-key" npm run db:fix-rosters
APPWRITE_API_KEY="your-key" npm run db:fix-players
```

### 2. "League not found" Error
- Check league ID is correct
- Verify user is member of league
- Check league wasn't deleted

### 3. "Cannot read locker room"
```bash
# This usually means rosters permissions are wrong
APPWRITE_API_KEY="your-key" npm run db:fix-rosters
```

### 4. Session/Cookie Issues
```javascript
// Force logout in browser console
document.cookie = "appwrite-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
window.location.href = "/login";
```

## 🏗️ Project Structure

```
college-football-fantasy-app/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── league/            # League pages
│   └── ...               # Other pages
├── components/            # React components
├── lib/                   # Utilities and configs
├── types/                 # TypeScript types
├── scripts/               # Database sync scripts
├── docs/                  # Documentation
│   ├── DATABASE_SCHEMA.md # Database structure
│   ├── API_ROUTES.md      # API documentation
│   ├── ERROR_TRACKING.md  # Error reference
│   └── DEVELOPMENT_WORKFLOW.md
└── public/                # Static assets
```

## 📦 Key NPM Scripts

```bash
# Development
npm run dev              # Start dev server (checks DB first)
npm run build           # Build for production
npm run lint            # Run linter
npm run typecheck       # Check TypeScript

# Database Management  
npm run db:sync         # Sync complete schema
npm run db:check        # Check permissions only
npm run db:fix-rosters  # Fix rosters permissions
npm run db:fix-players  # Fix players permissions

# Deployment
npm run deploy          # Deploy to Vercel (checks DB first)
vercel alias [url] cfbfantasy.app  # Update production URL

# Data Sync
npm run sync:cfbd       # Sync game data
npm run sync:rotowire   # Sync player data
```

## 🔐 Environment Variables

### Required for Development
```env
# Appwrite
APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=college-football-fantasy-app
APPWRITE_API_KEY=your-api-key
APPWRITE_DATABASE_ID=college-football-fantasy

# Next.js
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=college-football-fantasy-app
NEXT_PUBLIC_APPWRITE_DATABASE_ID=college-football-fantasy

# External APIs (optional for basic dev)
CFBD_API_KEY=your-cfbd-key
ESPN_API_KEY=your-espn-key
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] Create account
- [ ] Login/logout
- [ ] Create league
- [ ] Join league  
- [ ] Access locker room
- [ ] Add/remove players
- [ ] Make draft pick
- [ ] View other teams

### Test as Regular User
1. Create a test account (not admin)
2. Join a test league
3. Verify all features work
4. Check browser console for errors

## 🚀 Deployment

### Deploy to Production
```bash
# Pre-deployment checks (automatic)
npm run deploy

# This runs:
# - db:check (verify permissions)
# - lint (check code quality)
# - typecheck (verify types)
# - Then deploys to Vercel

# Update production URL
vercel alias [deployment-url] cfbfantasy.app
```

### Post-Deployment
1. Test login on production
2. Create test league
3. Access locker room
4. Monitor browser console
5. Check Appwrite dashboard

## 📝 Documentation

### Key Documentation Files
- `docs/README.md` - Documentation overview
- `docs/DATABASE_SCHEMA.md` - Complete database reference
- `docs/API_ROUTES.md` - All API endpoints
- `docs/ERROR_TRACKING.md` - Error solutions
- `docs/DEVELOPMENT_WORKFLOW.md` - Development guide

### When to Update Docs
- Adding new collections/fields → Update DATABASE_SCHEMA.md
- Creating new API routes → Update API_ROUTES.md  
- Encountering new errors → Update ERROR_TRACKING.md
- Changing workflows → Update DEVELOPMENT_WORKFLOW.md

## 🆘 Getting Help

### Debug Information to Collect
1. Browser console errors
2. Network tab failed requests
3. Response status codes
4. Appwrite collection permissions
5. User authentication status

### Quick Diagnostics
```bash
# Check database sync status
APPWRITE_API_KEY="your-key" npm run db:check

# View detailed logs
npm run dev
# Then check terminal output

# Test specific API
curl -X GET http://localhost:3000/api/auth/user \
  -H "Cookie: [your-session-cookie]"
```

## ✅ Production Checklist

Before going live:
- [ ] All collections synced
- [ ] Permissions verified
- [ ] Environment variables set
- [ ] External APIs configured
- [ ] Error tracking enabled
- [ ] Documentation updated
- [ ] Manual testing completed
- [ ] Deployment successful

## 🎯 Remember

1. **Always sync database first** - Schema changes before code
2. **Test as regular user** - Not with admin account
3. **Check permissions** - Most errors are permission-related
4. **Document changes** - Update docs with code
5. **Handle errors gracefully** - User-friendly messages

---

**Need help?** Check `docs/ERROR_TRACKING.md` first, then create an issue with:
- Error message
- Steps to reproduce  
- Browser console output
- Which user account (test/admin)

Happy coding! 🏈
