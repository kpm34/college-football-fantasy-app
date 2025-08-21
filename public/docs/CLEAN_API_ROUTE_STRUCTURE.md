# Clean API Route Structure

## 🎯 Overview
This document outlines the cleaned and synchronized API route structure for the College Football Fantasy App.

## 📁 API Routes Directory Structure

```
app/api/
├── auth/                    # Authentication routes
│   ├── login/              # Email/password login
│   ├── logout/             # Session logout
│   ├── oauth/              # OAuth providers
│   │   ├── apple/
│   │   ├── callback/
│   │   ├── google/
│   │   └── success/
│   ├── signup/             # New user registration
│   ├── sync-oauth/         # OAuth sync
│   ├── update-profile/     # Profile updates
│   └── user/               # Get current user
│
├── cache/                  # Cache management
│   ├── invalidate/         # Clear cache
│   └── stats/              # Cache statistics
│
├── conferences/            # Conference data (UNIFIED)
│   └── [conference]/       # Dynamic route for SEC, ACC, Big 12, Big Ten
│                          # Supports: ?type=teams|players|games|stats|draft-board
│
├── cron/                   # Scheduled jobs
│   ├── data-sync/          # Sync data from CFBD
│   └── weekly-scoring/     # Calculate weekly scores
│
├── draft/                  # Draft functionality
│   ├── [leagueId]/
│   │   ├── pick/           # Make a draft pick
│   │   └── status/         # Get draft status
│   └── players/            # Get draftable players
│
├── games/                  # Game data
│   └── cached/             # Cached game data
│
├── leagues/                # League management
│   ├── [leagueId]/        # League-specific routes
│   │   ├── commissioner/   # Commissioner tools
│   │   ├── locker-room/   # Team management
│   │   ├── members/       # League members
│   │   ├── update-settings/ # Update league settings
│   │   └── update-team/   # Update team info
│   ├── create/            # Create new league
│   ├── invite/            # Send league invites
│   ├── is-commissioner/   # Check commissioner status
│   │   └── [leagueId]/
│   ├── my-leagues/        # User's leagues
│   ├── schedule/          # League schedule
│   ├── search/            # Search leagues
│   └── set-commissioner/  # Transfer commissioner
│
├── players/               # Player data
│   ├── cached/           # Cached player data
│   ├── cleanup/          # Clean duplicate players
│   └── draftable/        # Get draftable players
│
├── rankings/             # AP Top 25 rankings
│   └── cached/          # Cached rankings
│
├── rotowire/            # RotoWire integration
│   └── news/           # Player news
│
├── cfbd/               # College Football Data API
│   └── players/        # CFBD player data
│
├── projections/        # Player projections
├── scraper/           # Web scraping endpoints
├── sync/              # Data synchronization
├── health/            # Health check
├── test-deployment/   # Deployment test
└── test-sentry-error/ # Sentry test
```

## 🔑 Key Changes Made

### ✅ Removed Redundant Routes
- ❌ `/api/sec` - Use `/api/conferences/sec` instead
- ❌ `/api/acc` - Use `/api/conferences/acc` instead
- ❌ `/api/big12` - Use `/api/conferences/big12` instead
- ❌ `/api/bigten` - Use `/api/conferences/bigten` instead
- ❌ `/api/fix-roster-usernames` - One-time fix, no longer needed
- ❌ `/api/leagues/fix-rosters-to-teams` - One-time fix, no longer needed

### ✅ Collection Name Alignment
All routes now use the centralized `COLLECTIONS` object from `@/lib/appwrite-server`:

```typescript
export const COLLECTIONS = {
  LEAGUES: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_LEAGUES || 'leagues',
  TEAMS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_TEAMS || 'teams',
  ROSTERS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFTED_PLAYERS || 'rosters',
  LINEUPS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_MATCHUPS || 'matchups',
  GAMES: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_GAMES || 'games',
  PLAYERS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYERS || 'college_players',
  RANKINGS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_RANKINGS || 'rankings',
  USERS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USERS || 'users',
  AUCTIONS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_AUCTIONS || 'auction_sessions',
  BIDS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BIDS || 'auction_bids',
  // Collections without env vars yet
  ACTIVITY_LOG: 'activity_log',
  DRAFT_PICKS: 'draft_picks',
  PLAYER_PROJECTIONS: 'player_projections',
  PLAYER_STATS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYER_STATS || 'player_stats'
};
```

### ✅ Route Consistency
All routes now follow these patterns:
- Use `NextRequest` and `NextResponse` from 'next/server'
- Import `serverDatabases`, `DATABASE_ID`, and `COLLECTIONS` from '@/lib/appwrite-server'
- Use proper error handling with try/catch
- Return consistent JSON responses

## 🚀 Usage Examples

### Conference Data (Unified)
```bash
# Get SEC teams
GET /api/conferences/sec?type=teams

# Get Big Ten players
GET /api/conferences/bigten?type=players

# Get ACC games
GET /api/conferences/acc?type=games

# Get Big 12 draft board
GET /api/conferences/big12?type=draft-board
```

### League Management
```bash
# Get league info
GET /api/leagues/[leagueId]

# Get locker room data
GET /api/leagues/[leagueId]/locker-room

# Update team name
PUT /api/leagues/[leagueId]/update-team

# Commissioner settings
GET /api/leagues/[leagueId]/commissioner
PUT /api/leagues/[leagueId]/update-settings
```

## 🔒 Authentication
All league-specific routes require authentication via:
- Session cookie: `appwrite-session`
- Routes check authentication using `createSessionClient` from '@/lib/auth-utils'

## 📝 Environment Variables
Ensure these are set in Vercel:
```env
# Appwrite
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=college-football-fantasy-app
NEXT_PUBLIC_APPWRITE_DATABASE_ID=college-football-fantasy
APPWRITE_API_KEY=[server-side-key]

# Collections
NEXT_PUBLIC_APPWRITE_COLLECTION_LEAGUES=leagues
NEXT_PUBLIC_APPWRITE_COLLECTION_TEAMS=teams
NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFTED_PLAYERS=rosters
NEXT_PUBLIC_APPWRITE_COLLECTION_MATCHUPS=matchups
NEXT_PUBLIC_APPWRITE_COLLECTION_GAMES=games
NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYERS=college_players
NEXT_PUBLIC_APPWRITE_COLLECTION_RANKINGS=rankings
NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYER_STATS=player_stats
NEXT_PUBLIC_APPWRITE_COLLECTION_USERS=users
NEXT_PUBLIC_APPWRITE_COLLECTION_AUCTIONS=auction_sessions
NEXT_PUBLIC_APPWRITE_COLLECTION_BIDS=auction_bids
```

## ✅ Next Steps
1. Deploy to Vercel with clean build
2. Test all routes work correctly
3. Update frontend to use unified conference routes
4. Monitor for any 404 errors

