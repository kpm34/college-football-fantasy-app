# Project Memory - College Football Fantasy App
Last Updated: August 15, 2025

## 🎯 Current Project State

### Recent Changes (last 7 days)
1. **Draft Pool & Projections**
   - `/api/draft/players` now reads strictly from `college_players` (Power 4; QB/RB/WR/TE/K; `draftable=true`)
   - Dedupe by `name|team|position`; cap to top 1000; projections = rating + depth + previous-year stats + SoS
   - Mock Draft UI: Team filter and Sort (Proj/Team/Name/ADP)

2. **Invite/Join Flow**
   - Dedicated `/invite/[leagueId]` with correct OG image and encoded redirects
   - Join only blocked when league is full; private leagues prompt password modal

3. **Admin Maintenance**
   - `/api/admin/dedupe/players`, `/api/admin/players/refresh`, `/api/admin/players/retire` added

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
1. **Collection Name Inconsistency** (partially resolved)
   - Standardize on `college_players`, `leagues`, `rosters`, `games`, `rankings`

2. **Duplicate Components**
   - 3 versions of conference showcase pages
   - Multiple Appwrite configuration files (6+)
   - 4 different draft implementations

3. **Console Logging**
   - Production console.log statements need removal
   - No unified error handling strategy

### Files Safe to Delete (verify)
- `/app/test-cors/page.tsx`
- `/app/test-sentry/page.tsx`
- `/lib/api.ts` (legacy)

### Files to Keep
- `/vendor/awwwards-rig/` - For 3D mascot/logo features

## 📅 Current Roadmap (4-Month Plan)

### August 2025 (NOW)
- Draft mock complete; real draft in progress (timer + realtime)
- Invite/Join flow fixed and live

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

## 🎨 Team Colors Preserved
All conference team colors have been preserved exactly in `/lib/conference-data.ts`:
- **ACC**: 17 teams with original hex colors
- **SEC**: 16 teams with original hex colors  
- **Big 12**: 16 teams with original hex colors
- **Big Ten**: 18 teams with original hex colors

## 🧮 Projections Pipeline (Aug 2025)
- New collections: `projections_yearly`, `projections_weekly`, `model_inputs`, `user_custom_projections`.
- Ingest scripts (Node/TS): EA ratings → `ea_ratings_json`, mock draft capital → `nfl_draft_capital_json`, depth charts → `depth_chart_json` + `usage_priors_json`, team efficiency/pace → `team_efficiency_json` + `pace_estimates_json`.
- Projectors: Yearly Simple (functions/project-yearly-simple) and Pro distributions (functions/project-pro-distributions).
- Custom recalculation (per-user): functions/recalc-custom-projection; reads `user_custom_projections`, returns ephemeral projections.
- API `/api/projections` can read from Appwrite (`source=db`) or compute (`source=calc`).

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