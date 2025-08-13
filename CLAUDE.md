# Claude Code Project Context - College Football Fantasy App
Last Updated: 2025-08-13

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
NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFTED_PLAYERS=rosters
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
SEASON_YEAR=2024
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

## Known Issues & Fixes
1. **Port Conflicts**: Dev server uses port 3001 if 3000 is in use
2. **Multiple Lockfiles**: Prefer root package-lock.json
3. **WebGL Performance**: Reduced DPR and multisampling for stability
4. **Type Issues**: Ignore TypeScript errors during build (SKIP_ENV_VALIDATION=true)

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
- Git branch: feat/animations-style
- Node version: 18-22
- Vercel CLI: 44.7.3

## Links & Resources
- [Vercel Dashboard](https://vercel.com/kpm34s-projects/college-football-fantasy-app)
- [Appwrite Console](https://cloud.appwrite.io/console/project-college-football-fantasy-app)
- [College Football Data API](https://collegefootballdata.com/)
- [Next.js Docs](https://nextjs.org/docs)
- [Claude Code Docs](https://docs.anthropic.com/en/docs/claude-code)

---
*This file should be updated whenever significant architectural changes occur.*