# Claude Code Project Context - College Football Fantasy App
Last Updated: August 17, 2025 (12:30 AM PST)

## Project Overview
**Name**: College Football Fantasy App  
**Type**: Full-stack fantasy sports platform for Power 4 conferences
**Deployment**: Vercel  
**Current Production URL**: https://college-football-fantasy-fz3de5a3k-kpm34s-projects.vercel.app
**Target URLs**: 
- https://cfbfantasy.app (future)
- https://www.cfbfantasy.app (future)
- https://collegefootballfantasy.app
- https://www.collegefootballfantasy.app
**Framework**: Next.js 15 with App Router, TypeScript, Tailwind CSS
**Note**: Awwwards-rig submodule present in vendor/ for future 3D enhancements

## Tech Stack
- **Runtime**: Node.js 18-22
- **Framework**: Next.js 15.4.5 with App Router
- **Backend**: Express.js + TypeScript, Appwrite BaaS
- **Database**: Appwrite (NYC region) - Project ID: college-football-fantasy-app
- **3D Graphics**: Three.js, React Three Fiber, Spline
- **Animation**: Anime.js
- **Styling**: Tailwind CSS v3
- **Type Safety**: TypeScript 5.x with strict mode
- **AI Integration**: Vercel AI SDK, Anthropic Claude, Chrome AI
- **Data Sources**: College Football Data API (CFBD), ESPN API
- **Deployment**: Vercel with Edge Functions
- **CI/CD**: GitHub Actions + Vercel

## Project Structure
```
college-football-fantasy-app/
├── frontend/                    # Next.js 15 frontend application
│   ├── app/                    # App Router pages and API routes
│   │   ├── api/                # API endpoints
│   │   │   ├── acc/           # ACC conference data
│   │   │   ├── big12/         # Big 12 conference data
│   │   │   ├── bigten/        # Big Ten conference data
│   │   │   ├── sec/           # SEC conference data
│   │   │   ├── cfbd/          # College Football Data API
│   │   │   ├── draft/         # Draft system endpoints
│   │   │   ├── leagues/       # League management
│   │   │   ├── mcp/           # MCP integration
│   │   │   └── rotowire/      # Rotowire data integration
│   │   ├── auction/           # Auction draft interface
│   │   ├── draft/             # Snake draft interface
│   │   ├── league/            # League management pages
│   │   └── conference-showcase/ # Conference team displays
│   ├── components/            # React components
│   │   ├── auction/           # Auction-specific components
│   │   ├── draft/             # Draft-specific components
│   │   └── ui/                # Shared UI components
│   ├── lib/                   # Utilities and configurations
│   │   ├── appwrite.ts        # Appwrite client config
│   │   └── api/               # API client utilities
│   ├── types/                 # TypeScript type definitions
│   ├── public/                # Static assets
│   └── vendor/                # Submodules and vendor code
│       └── awwwards-rig/      # 3D graphics submodule
├── src/                        # Backend source code
│   ├── api/                   # Express API routes
│   ├── config/                # Configuration files
│   ├── scripts/               # Data management scripts
│   ├── services/              # Business logic services
│   ├── types/                 # Shared type definitions
│   └── utils/                 # Utility functions
├── confrence rosters/          # Conference team rosters (PDFs/Markdown)
│   ├── ACC/                   # ACC team rosters
│   ├── Big_12_2025/          # Big 12 team rosters
│   └── SEC_College_Football/  # SEC team rosters
├── .cursorrules               # Cursor AI configuration
├── .env.local                 # Local environment variables
├── .env.production.local      # Production environment variables
├── package.json               # Root dependencies
└── CLAUDE.md                  # This file (AI context)
```

## Key Commands & Scripts
```bash
# Development
npm run dev                     # Start Next.js dev server (port 3001)
npm run server                  # Start Express backend (port 3000)
npm run build                   # Production build
npm run start                   # Start production server

# Data Management
npm run sync-data               # Sync data from APIs to Appwrite
npm test                        # Run API tests

# Code Quality
npm run lint                    # ESLint checks
npm run typecheck              # TypeScript type checking

# Deployment
vercel                         # Deploy preview
vercel --prod                  # Deploy to production
vercel pull                    # Pull environment variables
```

## Appwrite CLI Status
- **Status**: ✅ Configured and authenticated
- **User**: kashpm2002@gmail.com  
- **Project ID**: college-football-fantasy-app
- **Database ID**: college-football-fantasy
- **Config Files**: `appwrite.json`, `appwrite.config.json`
- **CLI Version**: 8.3.0

## Environment Variables
```bash
# Appwrite Configuration
APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=college-football-fantasy-app
APPWRITE_API_KEY=[configured]
APPWRITE_DATABASE_ID=college-football-fantasy
DATABASE_ID=college-football-fantasy

# Frontend Public Variables
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=college-football-fantasy-app
NEXT_PUBLIC_APPWRITE_DATABASE_ID=college-football-fantasy

# Collection Names
NEXT_PUBLIC_APPWRITE_COLLECTION_AUCTIONS=auctions
NEXT_PUBLIC_APPWRITE_COLLECTION_BIDS=bids
NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFTED_PLAYERS=user_teams
NEXT_PUBLIC_APPWRITE_COLLECTION_GAMES=games
NEXT_PUBLIC_APPWRITE_COLLECTION_LEAGUES=leagues
NEXT_PUBLIC_APPWRITE_COLLECTION_MATCHUPS=lineups
NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYERS=college_players
NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYER_STATS=player_stats
NEXT_PUBLIC_APPWRITE_COLLECTION_RANKINGS=rankings
NEXT_PUBLIC_APPWRITE_COLLECTION_TEAMS=teams
NEXT_PUBLIC_APPWRITE_COLLECTION_USERS=users

# APIs
CFBD_API_KEY=[configured]
CFBD_API_KEY_BACKUP=[configured]
AI_GATEWAY_API_KEY=[configured]
AI_GATEWAY_URL=https://ai-gateway.vercel.sh/v1/ai

# Inngest (Background Jobs)
INNGEST_EVENT_KEY=[configured]
INNGEST_SIGNING_KEY=[configured]

# Edge Config (Feature Flags)
EDGE_CONFIG=[configured]

# External APIs (optional)
ODDS_API_KEY=your_key_here
ROTOWIRE_API_KEY=your_key_here

# Development
SEASON_YEAR=2025
NEXT_DISABLE_FAST_REFRESH=true
```

## Current Features
1. **Power 4 Conference Focus**: Exclusive to SEC, ACC, Big 12, and Big Ten
2. **Unique Eligibility Rules**: Players only eligible vs AP Top-25 teams or in conference games
3. **12-Week Regular Season**: No playoffs or bowls
4. **Draft Systems**: 
   - Snake draft with timer and auto-pick
   - Auction draft with bidding system
5. **Real-time Data**: Live scoring via ESPN/CFBD APIs
6. **3D Visualizations**: Spline and Three.js for immersive UI
7. **League Management**: Create, join, and manage fantasy leagues
8. **Progressive Web App**: Offline support with service worker

## API Endpoints
- `/api/games` - Current week games
- `/api/games/week/:week` - Specific week games
- `/api/games/eligible` - Only eligible games
- `/api/rankings` - AP Top 25
- `/api/teams` - Power 4 teams
- `/api/eligibility/check` - Check game eligibility
- `/api/draft/[leagueId]/pick` - Make draft pick
- `/api/draft/[leagueId]/status` - Draft status
- `/api/leagues/create` - Create new league
- `/api/leagues/search` - Search for leagues
- `/api/leagues/join` - Join a league (✅ Fixed database schema issues)

## Database Collections (Appwrite)
- `games` - Game data with scores and status
- `rankings` - AP Top 25 weekly rankings
- `teams` - Power 4 team information
- `leagues` - User leagues
- `rosters` - Team rosters
- `lineups` - Weekly lineups
- `college_players` - Player database
- `player_stats` - Player statistics
- `auctions` - Auction draft data
- `bids` - Auction bid history

## MCP (Model Context Protocol) Tools
Available MCP tools for Claude Code:
- File system operations (Read, Write, Edit, MultiEdit)
- Web fetching and searching
- Task management (TodoWrite)
- Git operations
- IDE diagnostics
- Jupyter notebook execution

### MCP Server Setup (Dev-time Automation)
Configure MCP servers in `~/.cursor/mcp.json` so Cursor/Claude can operate our stack [[memory:6191194]]. Example:

```json
{
  "mcpServers": {
    "appwrite": {
      "command": "uvx",
      "args": ["mcp-server-appwrite", "--users"],
      "env": {
        "APPWRITE_ENDPOINT": "https://nyc.cloud.appwrite.io/v1",
        "APPWRITE_PROJECT_ID": "college-football-fantasy-app",
        "APPWRITE_API_KEY": "<SECRET>"
      }
    },
    "vercel": {
      "command": "npx",
      "args": ["mcp-server-vercel"],
      "env": {
        "VERCEL_TOKEN": "<SECRET>"
      }
    }
  }
}
```

Reference capabilities file: `tools/capabilities.json` (stack, env, APIs, commands, MCP servers).

## Vercel Configuration
```json
{
  "framework": "nextjs",
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/.next",
  "installCommand": "npm install",
  "devCommand": "npm run dev"
}
```

## Recent Updates & Fixes ✅

### August 17, 2025 (Data Flow Alignment Complete)
1. **Redundant Algorithm Removal**: Complete cleanup of projection redundancies ✅
   - **Removed**: `/lib/services/enhanced-projections.service.ts`
   - **Removed**: `/app/api/projections/route.ts` 
   - **Removed**: Redundant calculation functions in `/app/api/draft/players/route.ts`
   - **Result**: Single source of truth for all projections

2. **Pipeline Routing Alignment**: Comprehensive data flow verification ✅
   - **Created**: `/docs/DATA_FLOW_ALIGNMENT.md` - Single source of truth documentation
   - **Created**: `/scripts/verify-data-flow-alignment.ts` - Alignment verification script
   - **Verified**: Database → API → UI consistency (100% aligned)
   - **Data Flow**: `functions/project-yearly-simple/` → `college_players.fantasy_points` → `/api/draft/players` → UI
   - **Projection Sources**: Team pace, efficiency, depth charts, usage priors, injury risk, NFL draft capital

### August 17, 2025 (Earlier)
1. **QB Projection Algorithm Enhancement**: Major fix for depth chart logic ⚡
   - **Problem**: QB projections were too similar (Miller Moss ~300 pts, backups similar)
   - **Solution**: Enhanced depth chart logic with proper multipliers
   - **Changes Made**:
     - Fixed API data source in `/app/api/players/cached/route.ts` to use correct database fields
     - Updated ordering to use `fantasy_points` instead of `projections.fantasyPoints`
     - Fixed search field to use `name` instead of `playerName`
     - Switched to server-side database connection for proper authorization
     - Applied depth chart multipliers: QB1 gets 100%, QB2 gets 25%, QB3+ gets 5%
   - **Result**: Miller Moss now shows 333 fantasy points (up from ~300)
   - **Impact**: Proper fantasy value differentiation between starting and backup QBs in draft interface

2. **Production Deployment**: Live projection fixes deployed ✅
   - Successfully deployed enhanced projection algorithm to production
   - Ran projection sync script on production database  
   - Verified QB rankings now show proper differentiation on live site
   - Added sync scripts: `scripts/sync-enhanced-projections.js` and `.ts`

### August 16, 2025
1. **Join League Feature**: Complete implementation and fixes
   - Fixed Appwrite schema to include inviteToken, status, and expiresAt fields in activity_log collection
   - Resolved 'League ID is required' error by properly handling invite token validation
   - Fixed invite API to use proper schema fields instead of searching in data field
   - Updated schema sync script to include new invite-related fields
   - All join league tests now passing (4/4)

2. **Code Consolidation**: Reduced technical debt
   - Consolidated projection services into single canonical source
   - Redirected legacy draft pages to realtime draft room
   - Improved UI contrast for commissioner page buttons
   - Removed duplicate implementations

3. **3D Mascot System**: Enhanced visualization features
   - Integrated enhanced 3D mascot editing system
   - Awwwards-rig submodule for future enhancements
   - Improved performance with WebGL optimizations

## Known Issues & Technical Debt

### Outstanding Issues
1. **Conference API Duplication**: 4 separate conference APIs with different implementations
   - `/api/acc`, `/api/big12`, `/api/sec`, `/api/bigten` - need unification
2. **Appwrite Config Fragmentation**: 6+ different Appwrite configuration files
   - Primary: `/lib/appwrite.ts`, `/lib/appwrite-server.ts`
   - Duplicates: `/lib/config/appwrite.config.ts`, `/lib/appwrite-client-fix.ts`
3. **Collection Name Inconsistency**: `players` vs `college_players` used interchangeably
4. **Draft System Redundancy**: 4 different draft implementations

### Code Quality Issues
1. **Duplicate Components**: 
   - 3 versions of conference showcase pages
   - 2 versions of HeroSection component
   - Multiple service worker implementations
2. **Unused Code**:
   - Test pages in production (`/test-cors`, `/test-sentry`)
   - Legacy API client (`/lib/api.ts`)
   - Python scoring scripts alongside TypeScript versions
3. **Data Flow Inconsistencies**:
   - Player data fetched via 3 different patterns
   - Mixed use of SDK vs REST API for same operations
4. **Vendor Submodule**: `/vendor/awwwards-rig/` - KEEP (for 3D mascot/logo design features)

### Quick Fixes
1. **Port Conflicts**: Dev server uses port 3001 if 3000 is in use
2. **Multiple Lockfiles**: Prefer root package-lock.json
3. **Type Issues**: Use SKIP_ENV_VALIDATION=true for builds

## AI Assistant Instructions
When working on this project:

1. **Fantasy Sports Logic First**: Ensure eligibility rules are enforced
2. **Type Safety**: Use TypeScript strict mode throughout
3. **Performance**: Optimize for mobile and desktop
4. **Data Integrity**: Validate all data from external APIs
5. **User Experience**: Smooth animations and responsive design
6. **Code Style**: Follow existing patterns in neighboring files
7. **Testing**: Test draft systems thoroughly
8. **Documentation**: Update this file with significant changes

## Quick Debugging
```bash
# Check build errors
npm run build

# Type checking
npm run typecheck

# Lint issues
npm run lint

# Vercel logs
vercel logs

# Check deployment
vercel ls

# Environment info
vercel env ls
```

## Session Context
- Team: kpm34s-projects
- Latest deployment: https://cfbfantasy.app
- Git branch: main
- Node version: 18-22
- Vercel CLI: 44.7.3
- Last sync: August 16, 2025
- Repository: Up to date with origin/main

## Links & Resources
- [Vercel Dashboard](https://vercel.com/kpm34s-projects/college-football-fantasy-app)
- [Appwrite Console](https://cloud.appwrite.io/console/project-college-football-fantasy-app)
- [College Football Data API](https://collegefootballdata.com/)
- [Next.js Docs](https://nextjs.org/docs)
- [Claude Code Docs](https://docs.anthropic.com/en/docs/claude-code)

---
*This file should be updated whenever significant architectural changes occur.*