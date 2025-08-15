# College Football Fantasy App - Comprehensive Project Summary

## 🎯 Project Overview
**Last Updated**: 2025-08-15  
**Status**: Active Development  
**Deployment**: Vercel (Production) ✅ Latest build successful  

### Core Application
- **Name**: College Football Fantasy App
- **Type**: Full-stack fantasy sports platform for Power 4 conferences
- **Primary URLs**: 
  - https://cfbfantasy.app (main)
  - https://collegefootballfantasy.app (alternate)
- **Framework**: Next.js 15.4.5 with App Router, TypeScript, Tailwind CSS
- **Database**: Appwrite BaaS (NYC Region)
- **Project ID**: `college-football-fantasy-app` (readable format, NOT numeric)

### Key Changes Summary (last 7 days)
- Draft: `/api/draft/players` now sources strictly from `college_players` (Power 4 only; QB/RB/WR/TE/K; `draftable=true`), dedupes by `name|team|position`, caps to top 1000, and computes projections using rating + depth + previous-year stats + strength of schedule
- Mock Draft UI: added Team filter and Sort (Proj/Team/Name/ADP)
- Admin: added maintenance endpoints `/api/admin/dedupe/players`, `/api/admin/players/refresh`, `/api/admin/players/retire`
- Invite/Join: dedicated `/invite/[leagueId]` with proper OG image and encoded redirects; join only blocks when league is full; private leagues prompt password modal
- League: replaced Locker Room quick action with Weekly Scoreboard; improved button contrast

## 📊 Data Flow Architecture

### 1. User Authentication Flow
```
User Login → Frontend (Next.js) → Appwrite Auth → Session Token → Protected Routes
```

### 2. League Management Flow
```
Create League → API Route → Appwrite Database → Real-time Updates → All Members
```

### 3. Draft System Flow
```
Draft Room → WebSocket Connection → Draft Logic → Database Updates → Live UI Updates
```

### 4. Game Data Pipeline
```
CFBD API → Scheduled Jobs → Data Processing → Appwrite Storage → Frontend Display
```

### 5. Scoring Engine Flow
```
Live Game Data → Scoring Algorithm → Player Points → League Standings → User Dashboard
```

## 🗂️ Complete File Mapping

### Root Configuration Files
```
/
├── .env                          # Main environment variables (Cursor AI visibility)
├── .env.production.local         # Production env from Vercel
├── README.md                     # Project overview and quick start
├── CLAUDE.md                     # Claude Code context and instructions
├── DEPLOYMENT.md                 # Consolidated deployment guide
├── WORKFLOW.md                   # Development workflow and practices
├── PROJECT_SUMMARY.md            # This comprehensive summary
├── package.json                  # Root package configuration
├── vercel.json                   # Vercel deployment settings
├── cursor.config.json            # Cursor AI tool configurations
└── .cursorrules                  # Cursor AI behavior rules
```

### Frontend Application Structure (current)
```
/
├── app/                          # Next.js App Router
│   ├── api/                      # Backend API Routes
│   │   ├── conferences/          # Unified conference data endpoints
│   │   ├── cfbd/                 # College Football Data API integration
│   │   ├── draft/                # Draft system endpoints
│   │   ├── leagues/              # League management endpoints
│   │   ├── players/              # Player data endpoints
│   │   ├── admin/                # Admin maintenance endpoints (dedupe/refresh/retire)
│   │   └── og/                   # Open Graph image routes
│   │
│   ├── league/                   # League Pages
│   │   └── [leagueId]/           # Dynamic league routes
│   │       ├── page.tsx          # League dashboard
│   │       ├── locker-room/      # Team management
│   │       ├── commissioner/     # Commissioner tools
│   │       ├── scoreboard/       # Weekly scoreboard
│   │       └── draft/            # Draft interface (future real draft)
│   │
│   ├── draft/                    # Draft System
│   │   └── mock/                 # Mock draft interface
│   │
│   ├── auction/                  # Auction Draft (future)
│   │
│   ├── dashboard/                # User Dashboard
│   │   └── page.tsx              # Main dashboard
│   │
│   ├── login/                    # Authentication
│   │   └── page.tsx              # Login interface
│   │
│   ├── invite/                   # Invite landing
│   │   └── [leagueId]/page.tsx   # Invite redirect + OG metadata
│   │
│   ├── scoreboard/               # Live Scores (global)
│   │   └── page.tsx              # Scoreboard display
│   │
│   └── layout.tsx                # Root layout with providers
```

### Components/Lib/Types
```
components/
lib/
│  ├── appwrite.ts               # Client
│  ├── appwrite-server.ts        # Server (API key)
│  └── theme/colors.ts           # Palette
types/
```

### Appwrite Collections
```
college_players, leagues, rosters, games, rankings, player_stats, auctions, bids, lineups, draft_picks
```

## 🔐 Environment Variables

### Critical Variables (All Fixed)
```bash
# Appwrite Configuration
APPWRITE_PROJECT_ID=college-football-fantasy-app
APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
APPWRITE_DATABASE_ID=college-football-fantasy
APPWRITE_API_KEY=[secured]

# External APIs
CFBD_API_KEY=[secured]
AI_GATEWAY_API_KEY=[secured]
```

## 📝 Recent Changes Log (last 7 days)
- Fixed invite/redirect flow and OG images; added `/invite/[leagueId]`
- League join only closes when full; private leagues prompt password
- Added team filter and sort in mock draft UI
- Draft API updated to use `college_players` strictly; added dedupe, top-1000 cap, and richer projections
- Added admin endpoints: dedupe, refresh from CFBD, retire

## 🎯 Current State
- Production builds green; database connected; auth working
- Draft mock ready; real draft in progress (realtime + timer pending)

## 🔮 Near-term Enhancements (next 2 weeks)
- Schedule generator when league fills
- Real-time draft: Appwrite Realtime + Functions for timer/auto-pick
- Live scoring integration