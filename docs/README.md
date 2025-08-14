# College Football Fantasy App - Documentation Hub

## 📚 Documentation Overview

This directory contains comprehensive documentation for the College Football Fantasy App, ensuring consistent development and preventing synchronization issues between code and database.

## 📖 Documentation Files

### Core Documentation (Start Here)
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** ⭐ - High-level project overview, updated every 4 major edits
- **[DATA_FLOW.md](./DATA_FLOW.md)** ⭐ - Technical architecture and data flow diagrams, updated every 30 minutes
- **[PROJECT_UPDATE_TRACKER.md](./PROJECT_UPDATE_TRACKER.md)** - Tracks edits and update schedules
- **[UPDATE_SYSTEM_GUIDE.md](./UPDATE_SYSTEM_GUIDE.md)** - How to maintain documentation

### Technical Reference
1. **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Complete Appwrite schema reference
   - Collection definitions
   - Attribute specifications  
   - Permission requirements
   - Index recommendations
   - Relationship mappings

2. **[API_ROUTES.md](./API_ROUTES.md)** - All API endpoints documentation
   - Route paths and methods
   - Authentication requirements
   - Request/response formats
   - Database operations
   - Error codes

3. **[ERROR_TRACKING.md](./ERROR_TRACKING.md)** - Common errors and solutions
   - Error code reference
   - Debugging steps
   - Quick fixes
   - Prevention strategies

4. **[DEVELOPMENT_WORKFLOW.md](./DEVELOPMENT_WORKFLOW.md)** - Development best practices
   - Pre-development checks
   - Schema change process
   - Testing procedures
   - Deployment checklist

### Platform Reviews & Guides
- [APPWRITE_COMPREHENSIVE_REVIEW.md](./APPWRITE_COMPREHENSIVE_REVIEW.md) - Appwrite Pro features
- [VERCEL_COMPREHENSIVE_REVIEW.md](./VERCEL_COMPREHENSIVE_REVIEW.md) - Vercel Pro capabilities
- [INTEGRATIONS_COMPREHENSIVE_GUIDE.md](./INTEGRATIONS_COMPREHENSIVE_GUIDE.md) - All available integrations
- [ZERO_ADDITIONAL_COST_STRATEGY.md](./ZERO_ADDITIONAL_COST_STRATEGY.md) - Cost optimization guide

## 🚀 Quick Start

### Initial Setup
```bash
# 1. Clone the repository
git clone [repository-url]
cd college-football-fantasy-app

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Appwrite credentials

# 4. Sync database schema
APPWRITE_API_KEY="your-key" node scripts/sync-appwrite-complete.js

# 5. Start development server
npm run dev
```

### Daily Development
```bash
# Before starting work
git pull origin main
npm run update:check  # Check if docs need updating
APPWRITE_API_KEY="your-key" node scripts/check-all-permissions.js

# After making changes
npm run update:track "Description of your changes"  # Track major edits

# After making schema changes
APPWRITE_API_KEY="your-key" node scripts/sync-appwrite-complete.js

# Every 30 minutes during active development
npm run update:dataflow  # Update data flow timestamps

# Before deploying
npm run lint
npm run type-check
```

## 🔧 Key Scripts

### Documentation Management
- `npm run update:check` - Check if documentation needs updating
- `npm run update:track "Edit description"` - Track a major edit
- `npm run update:summary` - Update project summary (after 4 edits)
- `npm run update:dataflow` - Update data flow (every 30 min)

### Database Management
- `scripts/sync-appwrite-complete.js` - Sync entire schema with Appwrite
- `scripts/check-all-permissions.js` - Verify collection permissions
- `scripts/fix-rosters-permissions.js` - Fix specific collection
- `scripts/add-commissioner-fields.js` - Add commissioner settings fields

### Development Tools
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run type-check` - Check TypeScript types
- `npm run test:commissioner` - Test commissioner settings

### Deployment
- `vercel --prod` - Deploy to production
- `vercel alias [url] cfbfantasy.app` - Update production URL

## 🏗️ Architecture Overview

### Frontend
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **State Management**: React hooks + Appwrite Realtime
- **Type Safety**: TypeScript

### Backend
- **API Routes**: Next.js API routes
- **Database**: Appwrite
- **Authentication**: Appwrite Auth
- **External APIs**: ESPN, College Football Data API

### Data Flow
1. User interacts with UI
2. UI calls Next.js API route
3. API route validates permissions
4. API route interacts with Appwrite
5. Response sent back to UI
6. UI updates based on response

## 🔒 Security Model

### Collection-Level Permissions
- Set broad permissions (e.g., `Role.users()`)
- Enforced by Appwrite

### Document-Level Security
- Implemented in API routes
- Check ownership (e.g., user owns roster)
- Verify roles (e.g., user is commissioner)

### Authentication Flow
1. User signs up/logs in via API route
2. API route creates Appwrite session
3. Session cookie set in browser
4. Subsequent requests include cookie
5. API routes verify session

## 📊 Data Model

### Core Entities
- **Users**: Account information
- **Leagues**: Fantasy leagues
- **Rosters**: Teams within leagues
- **Players**: College football players
- **Games**: CFB game schedule
- **Draft Picks**: Draft history

### Relationships
```
Users (1) ─── (*) Leagues (as commissioner)
Users (1) ─── (*) Rosters (as owner)
Leagues (1) ─── (*) Rosters
Rosters (*) ─── (*) Players
Leagues (1) ─── (*) Draft Picks
```

## 🐛 Troubleshooting

### Common Issues

1. **"Unauthorized" Error (401)**
   - Check if user is logged in
   - Verify collection permissions
   - Ensure session cookie exists

2. **"Not Found" Error (404)**
   - Verify resource ID is correct
   - Check if resource was deleted
   - Ensure user has access

3. **"Permission Denied" Error (403)**
   - Verify user role (e.g., commissioner)
   - Check document-level permissions
   - Ensure action is allowed

### Debug Commands
```bash
# Check all permissions
APPWRITE_API_KEY="..." node scripts/check-all-permissions.js

# View collection details in Appwrite Console
# https://cloud.appwrite.io/console/project-[id]/databases/database-[id]/collection-[id]

# Test API endpoint
curl -X GET https://cfbfantasy.app/api/auth/user \
  -H "Cookie: [session-cookie-from-browser]"
```

## 📝 Contributing

### Making Changes
1. Create feature branch
2. Update schema documentation if needed
3. Run sync script after schema changes
4. Update API documentation for new routes
5. Test as regular user (not admin)
6. Create PR with clear description

### PR Requirements
- [ ] Schema docs updated (if applicable)
- [ ] API docs updated (if applicable)
- [ ] Sync script updated (if applicable)
- [ ] TypeScript types updated
- [ ] Error handling implemented
- [ ] Tested with regular user account
- [ ] No linting errors

## 🚨 Emergency Procedures

### If Production Is Down
1. Check Appwrite service status
2. Verify API keys haven't changed
3. Run permission check script
4. Check recent deployments
5. Rollback if necessary

### Quick Fixes
```bash
# Reset all permissions
APPWRITE_API_KEY="..." node scripts/sync-appwrite-complete.js

# Force user logout (in browser console)
document.cookie = "appwrite-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
window.location.href = "/login";
```

## 📞 Support

### Resources
- [Appwrite Documentation](https://appwrite.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Project Issues](https://github.com/[repo]/issues)

### Getting Help
1. Check ERROR_TRACKING.md for known issues
2. Search existing GitHub issues
3. Create new issue with:
   - Error message
   - Steps to reproduce
   - Browser console output
   - Network tab screenshots

---

Remember: **Always sync schema before deploying!** 🚀
