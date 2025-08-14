# Project Memory - College Football Fantasy App
Last Updated: August 14, 2025

## 🎯 Current Project State

### Recent Changes (August 14, 2025)
1. **Consolidated Documentation**
   - Merged 3 product vision files into single `PRODUCT_VISION.md`
   - Created unified `VERCEL_GUIDE.md` from 4 separate docs
   - Created `DATA_FLOW.md` for architecture documentation
   - Created `CODE_AUDIT_REPORT.md` identifying technical debt

2. **API Consolidation**
   - Created unified conference API: `/api/conferences/[conference]/route.ts`
   - Preserved all team colors in `/lib/conference-data.ts`
   - Now using Appwrite database for player data (not mock data)
   - Old conference APIs can be deleted: `/api/acc`, `/api/sec`, `/api/big12`, `/api/bigten`

3. **Cleaned Up Files**
   - Deleted old migration scripts (`migrate-to-kash.sh`, etc.)
   - Removed test pages from production
   - Kept `/vendor/awwwards-rig/` for 3D mascot features

## 🏗️ Technical Architecture

### Database (Appwrite)
- **Endpoint**: https://nyc.cloud.appwrite.io/v1
- **Project ID**: college-football-fantasy-app
- **Database ID**: college-football-fantasy
- **Key Collections**: 
  - `college_players` (not `players`)
  - `leagues`, `rosters` (sometimes called `teams`)
  - `games`, `rankings`, `draft_picks`

### Deployment (Vercel)
- **Team**: kpm34s-projects
- **Primary Domain**: cfbfantasy.app
- **Node Version**: 20.x or 22.x
- **Region**: US East (iad1)

## ✅ Completed Features

### Commissioner Tools
Comprehensive commissioner system already implemented at `/app/league/[leagueId]/commissioner/page.tsx`:
- Full scoring customization (PPR, passing/rushing/receiving/kicking)
- Member management with text/iMessage-friendly invites
- Draft settings (date, time, pick timer)
- Schedule configuration (round-robin, balanced, rivalry)
- Playoff settings (teams, byes, reseeding)
- Theme customization (colors, logo, trophy)
- Import/export league settings as JSON

## 🔴 Critical Technical Debt

### High Priority Issues
1. **Collection Name Inconsistency**
   - `players` vs `college_players` used interchangeably
   - `teams` vs `rosters` confusion
   - Will cause database query failures

2. **Duplicate Components**
   - 3 versions of conference showcase pages
   - Multiple Appwrite configuration files (6+)
   - 4 different draft implementations

3. **Console Logging**
   - Production console.log statements need removal
   - No unified error handling strategy

### Files Safe to Delete
- `/app/test-cors/page.tsx`
- `/app/test-sentry/page.tsx`
- `/lib/api.ts` (legacy, replaced by modular clients)
- Python scoring scripts (`scoring.py`, `scoring_example.py`)

### Files to Keep
- `/vendor/awwwards-rig/` - For 3D mascot/logo features

## 📅 Current Roadmap (4-Month Plan)

### August 2025 (NOW)
- ✅ Core platform setup
- ✅ Unified conference APIs
- ✅ Commissioner tools complete
- ⏳ Complete draft system
- ⏳ Real-time scoring
- ⏳ Authentication finalization

### September 2025
- Live draft rooms
- Waiver wire system
- Trade improvements
- Viral referral program
- Target: 50,000 users

### October 2025
- 3D logos & mascots
- Tournament mode with prizes
- Advanced analytics
- College sports partnerships
- Target: 250,000 users

### November 2025
- AI Integration (Draft Assistant, Lineup Optimizer, Trade Analyzer)
- Voice commands
- Vision analysis
- Target: 1,000,000+ users
- Market leader position

## 🎨 Team Colors Preserved
All conference team colors have been preserved exactly in `/lib/conference-data.ts`:
- **ACC**: 17 teams with original hex colors
- **SEC**: 16 teams with original hex colors  
- **Big 12**: 16 teams with original hex colors
- **Big Ten**: 18 teams with original hex colors

## 🚀 Quick Commands

### Development
```bash
npm run dev                 # Start dev server
npm run build              # Build for production
npm run lint               # Check for issues
npm run typecheck          # TypeScript checking
```

### Deployment
```bash
vercel                     # Deploy preview
vercel --prod             # Deploy production
vercel logs --follow      # Watch logs
```

### Testing APIs
```bash
# Test unified conference API
curl https://cfbfantasy.app/api/conferences/sec?type=teams
curl https://cfbfantasy.app/api/conferences/acc?type=players
curl https://cfbfantasy.app/api/conferences/big12?type=games
```

## 💡 Important Notes

1. **Appwrite Configuration**: Use `/lib/appwrite.ts` for client, `/lib/appwrite-server.ts` for server
2. **Collection Names**: Always use `college_players` not `players`
3. **Conference APIs**: Use new `/api/conferences/[conference]` endpoint
4. **Deployment**: No special root directory config needed anymore
5. **Environment Variables**: All prefixed with `NEXT_PUBLIC_` for client-side

## 🔗 Key Resources
- **Production**: https://cfbfantasy.app
- **Vercel Dashboard**: https://vercel.com/kpm34s-projects/college-football-fantasy-app
- **Appwrite Console**: https://cloud.appwrite.io/console/project-college-football-fantasy-app

---
This memory file should be updated after significant changes to maintain project continuity.