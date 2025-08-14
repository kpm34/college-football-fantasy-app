# College Football Fantasy App - Comprehensive Project Summary

## 🎯 Project Overview
**Last Updated**: 2025-08-14 (12:57 PM)  
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

### Key Changes Summary
- **Consolidated Documentation**: Reduced from 40+ files to 4 essential guides
- **Fixed Project IDs**: All numeric IDs replaced with readable format
- **Environment Cleanup**: Standardized .env files across all environments
- **Added Dependencies**: Integrated 3D/animation libraries from awwwards-rig
- **Improved Structure**: Clear separation of core features and future enhancements
- **Custom Roster Schema**: Per-league RB/WR/Bench configuration with mode-based caps (Conference: RB≤2, WR≤5; Power-4: WR≤6)
- **Locker Room UX**: Palette-aligned tables, roster summary chips, guardrails, and drag-and-drop + MOVE actions

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

### Frontend Application Structure
```
frontend/
├── app/                          # Next.js App Router
│   ├── api/                      # Backend API Routes
│   │   ├── acc/                  # ACC conference data endpoints
│   │   ├── big12/                # Big 12 conference data endpoints
│   │   ├── bigten/               # Big Ten conference data endpoints
│   │   ├── sec/                  # SEC conference data endpoints
│   │   ├── cfbd/                 # College Football Data API integration
│   │   ├── draft/                # Draft system endpoints
│   │   ├── leagues/              # League management endpoints
│   │   │   ├── create/           # League creation
│   │   │   └── [leagueId]/       # League-specific operations
│   │   ├── players/              # Player data endpoints
│   │   ├── rotowire/             # Injury/news data integration
│   │   ├── edge-config/          # Vercel Edge Config
│   │   └── mcp/                  # MCP tool integration
│   │
│   ├── league/                   # League Pages
│   │   └── [leagueId]/           # Dynamic league routes
│   │       ├── page.tsx          # League dashboard
│   │       ├── locker-room/      # Team management
│   │       ├── commissioner/     # Commissioner tools
│   │       ├── draft/            # Draft interface
│   │       └── standings/        # League standings
│   │
│   ├── draft/                    # Draft System
│   │   └── [leagueId]/
│   │       └── draft-room/       # Live draft interface
│   │
│   ├── auction/                  # Auction Draft
│   │   └── [leagueId]/           # Auction-specific UI
│   │
│   ├── dashboard/                # User Dashboard
│   │   ├── page.tsx              # Main dashboard
│   │   └── components/           # Dashboard widgets
│   │
│   ├── conference-showcase/      # Conference Displays
│   │   ├── acc/                  # ACC teams showcase
│   │   ├── big12/                # Big 12 teams showcase
│   │   ├── bigten/               # Big Ten teams showcase
│   │   └── sec/                  # SEC teams showcase
│   │
│   ├── account/                  # User Account
│   │   ├── settings/             # User settings
│   │   └── profile/              # User profile
│   │
│   ├── login/                    # Authentication
│   │   └── page.tsx              # Login interface
│   │
│   ├── scoreboard/               # Live Scores
│   │   └── page.tsx              # Scoreboard display
│   │
│   └── layout.tsx                # Root layout with providers
│
├── components/                   # React Components
│   ├── league/                   # League-specific components
│   │   ├── LeagueCard.tsx        # League display card
│   │   ├── LeagueSettings.tsx    # Settings interface
│   │   └── TeamRoster.tsx        # Team roster display
│   │
│   ├── draft/                    # Draft components
│   │   ├── DraftBoard.tsx        # Draft board UI
│   │   ├── PlayerCard.tsx        # Player selection card
│   │   └── Timer.tsx             # Draft timer
│   │
│   ├── ui/                       # Shared UI components
│   │   ├── Button.tsx            # Button component
│   │   ├── Card.tsx              # Card component
│   │   └── Modal.tsx             # Modal component
│   │
│   ├── Navbar.tsx                # Navigation bar
│   ├── SideDrawer.tsx            # Mobile navigation drawer
│   ├── FootballHamburger.tsx     # Custom hamburger menu
│   └── CFPLoadingScreen.tsx      # Loading animation
│
├── lib/                          # Utilities & Libraries
│   ├── config/                   # Configuration files
│   │   ├── constants.ts          # App constants
│   │   └── scoring.ts            # Scoring configuration
│   │
│   ├── services/                 # Service layers
│   │   ├── league.service.ts     # League operations
│   │   ├── draft.service.ts      # Draft operations
│   │   └── player.service.ts     # Player operations
│   │
│   ├── theme/                    # Theme configuration
│   │   ├── colors.ts             # Color palette
│   │   └── typography.ts         # Typography settings
│   │
│   ├── appwrite.ts               # Appwrite client setup
│   ├── appwrite-config.ts        # Appwrite configuration
│   └── utils.ts                  # Utility functions
│
├── types/                        # TypeScript Definitions
│   ├── league.ts                 # League types
│   ├── player.ts                 # Player types
│   ├── draft.ts                  # Draft types
│   ├── projections.ts            # Projection types
│   └── index.ts                  # Type exports
│
├── public/                       # Static Assets
│   ├── icons/                    # App icons
│   │   ├── icon-192.png         # PWA icon
│   │   └── icon-512.png         # PWA icon large
│   ├── images/                   # Image assets
│   └── manifest.json             # PWA manifest
│
├── scripts/                      # Utility Scripts
│   ├── sync-rosters.ts           # Roster synchronization
│   └── update-stats.ts           # Statistics updater
│
├── vendor/                       # External Code
│   └── awwwards-rig/            # 3D Graphics (Future Enhancement)
│       ├── src/                  # Source code
│       ├── package.json          # Dependencies
│       └── README.md             # Documentation
│
└── Configuration Files
    ├── .env.local                # Local environment
    ├── package.json              # Frontend dependencies
    ├── next.config.mjs           # Next.js configuration
    ├── tailwind.config.ts        # Tailwind CSS config
    └── tsconfig.json             # TypeScript config
```

### Backend Services Structure
```
src/
├── services/                     # Business Logic
│   ├── cfbd.service.ts          # CFBD API integration
│   ├── scoring.service.ts       # Scoring calculations
│   └── notification.service.ts  # User notifications
│
├── scripts/                      # Data Management
│   ├── import-rosters.ts        # Roster importer
│   └── update-rankings.ts       # Rankings updater
│
└── config/                       # API Configurations
    ├── api.config.ts            # API settings
    └── database.config.ts       # Database settings
```

### Data Directory
```
conference rosters/               # Team Roster Data
├── ACC/                         # ACC team rosters
├── Big 12/                      # Big 12 team rosters
├── Big Ten/                     # Big Ten team rosters
└── SEC/                         # SEC team rosters
```

## 🔄 API Endpoints Map

### Public Endpoints
- `GET /api/cfbd/teams` - Get all teams
- `GET /api/cfbd/players` - Get all players
- `GET /api/cfbd/games` - Get game schedules
- `GET /api/rankings` - Get AP Top 25

### Protected Endpoints (Auth Required)
- `POST /api/leagues/create` - Create new league
- `GET /api/leagues/[id]` - Get league details
  - Persists `rosterSchema` { rb, wr, benchSize } with mode caps
- `POST /api/draft/pick` - Make draft pick
- `GET /api/draft/[id]/status` - Get draft status
- `POST /api/lineup/set` - Set weekly lineup
- `GET /api/player/stats` - Get player statistics

## 🗄️ Database Collections

### Appwrite Collections
```
Database: college-football-fantasy
├── leagues                      # Fantasy leagues
├── users                        # User profiles
├── college_players              # Player database
├── teams                        # College teams
├── games                        # Game schedules
├── rankings                     # AP rankings
├── rosters                      # Drafted players
├── lineups                      # Weekly lineups
├── player_stats                 # Statistics
├── auctions                     # Auction drafts
└── bids                         # Auction bids

### League Document (key fields)
```
{
  name: string,
  gameMode: 'CONFERENCE' | 'POWER4',
  selectedConference?: string,
  maxTeams: number,
  seasonStartWeek: number,
  rosterSchema: {
    rb: number,           // capped by mode
    wr: number,           // capped by mode
    benchSize: number
  },
  ...
}
```
```

## 🔐 Environment Variables

### Critical Variables (All Fixed)
```bash
# Appwrite Configuration
APPWRITE_PROJECT_ID=college-football-fantasy-app  # Readable format
APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
APPWRITE_DATABASE_ID=college-football-fantasy
APPWRITE_API_KEY=[secured]

# External APIs
CFBD_API_KEY=[secured]
AI_GATEWAY_API_KEY=[secured]

# Vercel Services
EDGE_CONFIG=[secured]
VERCEL_OIDC_TOKEN=[refresh with vercel pull]
```

## 🚀 Deployment Information

### Vercel Deployment
- **Team**: kpm34s-projects
- **Project**: college-football-fantasy-app
- **Framework**: Next.js
- **Region**: Global Edge Network
- **Domains**: 4 custom domains configured

### Build Configuration
```json
{
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/.next",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

## 📝 Recent Changes Log

### Latest Updates (August 14, 2025 1:10 PM)
- ✅ Fixed locker room 401 authorization errors by creating server-side API route
- ✅ Fixed createSessionClient import warnings in lib/auth-utils.ts
- ✅ Added comprehensive locker room API endpoint `/api/leagues/[leagueId]/locker-room`
- ✅ Updated locker room page to use server-side data fetching
- ✅ Documented all API routes and data flow architecture

### Environment & Configuration
- ✅ Fixed all Appwrite project IDs from numeric to readable format
- ✅ Consolidated environment variables across all .env files
- ✅ Added VERCEL_OIDC_TOKEN to main configuration
- ✅ Removed old script files with incorrect IDs

### Documentation
- ✅ Consolidated 40+ documentation files into 4 essential guides
- ✅ Created unified DEPLOYMENT.md guide
- ✅ Updated WORKFLOW.md with current practices
- ✅ Cleaned up duplicate and outdated documentation
- ✅ Created comprehensive API_ROUTES.md documentation
- ✅ Updated DATA_FLOW.md with current architecture

### Dependencies
- ✅ Added 3D/animation libraries from awwwards-rig submodule
- ✅ Updated package.json with missing dependencies
- ✅ Fixed version conflicts with React Three Fiber
- ✅ Added date-fns for date formatting

### Code Updates
- ✅ Enhanced user settings page with comprehensive options
- ✅ Improved league dashboard with better data handling
- ✅ Updated login page with proper authentication flow
- ✅ Fixed Appwrite client initialization with correct project ID
- ✅ Added customizable roster schema, locker room drag-and-drop, and guardrails
- ✅ Created server-side API routes for secure data access

## 🎯 Current State
- Development server running on port 3001
- All environment variables properly configured
- Database connections verified
- API integrations functional
- Ready for feature development

## 🔮 Future Enhancements
- Awwwards-rig 3D graphics (submodule present, not integrated)
- Enhanced real-time features with WebSockets
- Advanced analytics dashboard
- Mobile app development
- AI-powered draft assistant

---
**Generated**: 2025-08-09
**Project Status**: Active Development
**Next Steps**: Continue core fantasy features implementation