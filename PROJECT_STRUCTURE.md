# College Football Fantasy App - Complete Project Structure

## ⚠️ IMPORTANT: Avoiding Conflicts and Duplicates

### Current Deployment Status
- **vercel.json**: Simplified to `{"framework": "nextjs"}` for automatic Next.js detection
- **Frontend**: Next.js app in `/frontend` directory
- **Backend**: Mixed approach with TypeScript (`/src/api`) and Python (`/api`) functions

### Critical Path Warnings
1. **DO NOT** mix static HTML files with Next.js pages - causes routing conflicts
2. **DO NOT** duplicate API endpoints between `/src/api` and `/api` directories
3. **DO NOT** have multiple package.json files with conflicting dependencies
4. **ALWAYS** check existing files before creating new ones

## Overview
This document provides a comprehensive map of every folder and file in the College Football Fantasy App, including their purposes and relationships.

## Root Directory Structure

```
college-football-fantasy-app/
├── frontend/                 # Next.js frontend application
├── api/                      # Serverless API functions (Vercel)
├── workers/                  # Background workers (Fly.io)
├── src/                      # Backend TypeScript source
│   ├── api/                 # Express API server
│   ├── scripts/             # Setup and sync scripts
│   └── services/            # Service implementations
├── .github/                  # GitHub Actions CI/CD
│
├── Configuration Files
│   ├── vercel.json          # Vercel deployment configuration
│   ├── .vercelignore        # Files to exclude from deployment
│   ├── .env.example         # Environment variable template
│   ├── package.json         # Root package.json
│   └── tsconfig.json        # TypeScript configuration
│
├── Deployment Scripts
│   ├── deploy.sh            # Standard deployment script
│   ├── deploy-with-token.sh # Token-based deployment script
│   └── DEPLOYMENT_CHECKLIST.md # Deployment checklist
│
├── Documentation
│   ├── ROLLOUT_PLAN.md      # Supabase to Appwrite migration plan
│   ├── PROJECT_STRUCTURE.md # This file
│   ├── VERCEL_DEPLOYMENT.md # Vercel deployment guide
│   └── VERCEL_TOKEN_GUIDE.md # Token deployment instructions
│
└── Scoring System
    ├── scoring.py           # Fantasy scoring calculation engine
    ├── test_scoring.py      # Scoring system tests
    └── scoring_example.py   # Scoring system usage examples
```

## Frontend Directory (`/frontend`)

### Core Application Files
```
frontend/
├── app/                      # Next.js 13+ App Router
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout component
│   ├── page.tsx             # Landing page
│   └── (other pages...)     # Additional routes
│
├── components/              # React components
│   ├── features/            # Feature-specific components
│   ├── layouts/             # Layout components
│   └── ui/                  # Reusable UI components
│
├── lib/                     # Utilities and helpers
│   ├── api/                 # API client functions
│   │   └── api.ts          # API configuration
│   ├── hooks/              # Custom React hooks
│   └── utils/              # Utility functions
│
├── styles/                  # Additional stylesheets
├── types/                   # TypeScript type definitions
├── public/                  # Static assets
│   └── service-worker.js   # PWA service worker
│
├── package.json            # Frontend dependencies
└── next.config.js          # Next.js configuration
```

### Component Breakdown

#### Features (`/frontend/components/features/`)
- **DraftLobby.tsx** - Snake draft interface with real-time updates
- **AuctionDraft.tsx** - Auction draft add-on component
- **PlayerCard.tsx** - Individual player display component
- **LeagueSettings.tsx** - Commissioner league configuration
- **Roster.tsx** - Team roster management
- **Scoreboard.tsx** - Live scoring display

#### UI Components (`/frontend/components/ui/`)
- Reusable components like buttons, modals, cards, forms
- Consistent design system components

#### API Integration (`/frontend/lib/api/`)
- **api.ts** - Appwrite client configuration
- API wrapper functions for all backend calls
- Real-time subscription handlers

## Backend Source Directory (`/src`)

### TypeScript Backend Structure
```
src/
├── api/
│   └── server.ts           # Express API server (if using Node.js backend)
├── scripts/
│   ├── setup-appwrite.ts   # Appwrite database setup
│   └── sync-data.ts        # Data synchronization scripts
├── services/
│   ├── appwrite.ts         # Appwrite service wrapper
│   ├── cfbd.ts            # College Football Data API
│   └── espn.ts            # ESPN data scraping
└── test-services.ts        # Service integration tests
```

## API Directory (`/api`)

### Serverless Functions (Vercel)
```
api/
├── rankings_refresh.py      # AP Top-25 rankings updater
├── eligibility.py          # Player eligibility checker
├── requirements.txt        # Python dependencies
├── test_eligibility.py     # Eligibility API tests
└── test_rankings_api.py    # Rankings API tests
```

### API Function Details

#### `rankings_refresh.py`
- **Purpose**: Fetches latest AP Top-25 from CFBD API
- **Schedule**: Runs as Vercel Cron (Tuesdays at 6 AM UTC)
- **Features**:
  - Updates Appwrite "rankings" collection
  - Sets 35-day TTL on documents
  - Returns `{"updated": 25}` on success

#### `eligibility.py`
- **Purpose**: FastAPI endpoint for player eligibility checks
- **Route**: GET `/api/eligibility/{player_id}/{week}`
- **Features**:
  - Queries Appwrite "player_game_eligibility" collection
  - Returns eligibility status and reason
  - 404 if no record exists
  - Optimized for <300ms cold starts

## Workers Directory (`/workers`)

### Background Workers (Fly.io)
```
workers/
├── live_worker.py          # ESPN live game scraper
├── requirements.txt        # Python dependencies
└── Dockerfile             # Container configuration
```

#### `live_worker.py`
- **Purpose**: Real-time game statistics scraper
- **Features**:
  - Loads games from CFBD (SEC/ACC/Big 12/Big Ten)
  - Polls ESPN every 15s (±4s jitter)
  - Aggregates player deltas in Redis
  - Publishes to Appwrite Realtime
  - Sleeps midnight-8AM ET to save credits
  - Exponential backoff for 403 errors

## Root Level Files

### Migration & Planning
- **ROLLOUT_PLAN.md** - Detailed 5-week Supabase → Appwrite migration plan
- **vercel.json** - Vercel deployment configuration with cron jobs

### Scoring System
- **scoring.py** - Core fantasy scoring engine
  - `calc_points()` function
  - ESPN-style default scoring
  - Commissioner customization via `ScoringSystem` class
  - Support for all positions (QB, RB, WR, TE, K, DEF/ST)
  
- **test_scoring.py** - Comprehensive pytest test suite
  - 40+ tests covering all scoring scenarios
  - Tests for customization and validation
  
- **scoring_example.py** - Usage examples for commissioners

## Database Collections (Appwrite)

### Core Collections
```
appwrite/
├── users                    # User accounts
├── teams                    # Fantasy teams
├── players                  # Player data from CFBD
├── leagues                  # League configurations
├── rosters                  # Team rosters by week
├── transactions             # Add/drop/trade history
├── games                    # College football games
├── player_stats             # Individual game statistics
├── draft_picks              # Draft history
├── rankings                 # AP Top-25 rankings
├── player_game_eligibility  # Eligibility records
└── auction_bids            # Auction draft bids
```

## Environment Variables

### Required for All Services
```
APPWRITE_ENDPOINT           # Appwrite API endpoint
APPWRITE_PROJECT_ID         # Appwrite project ID
APPWRITE_API_KEY           # Appwrite API key
APPWRITE_DATABASE_ID       # Database ID (default: 'default')
```

### Service-Specific
```
# Rankings Refresh
CFBD_API_KEY               # College Football Data API key
SEASON_YEAR                # Current season (auto-defaults)

# Live Worker
REDIS_URL                  # Upstash Redis connection
APPWRITE_FUNCTIONS_ENDPOINT # Functions endpoint
APPWRITE_FUNCTIONS_KEY     # Functions API key
FANTASY_SCORING_JSON       # Scoring configuration

# Frontend
NEXT_PUBLIC_APPWRITE_ENDPOINT
NEXT_PUBLIC_APPWRITE_PROJECT_ID
```

## Data Flow

### 1. Player Data Pipeline
```
CFBD API → Nightly ETL → Appwrite Collections → Frontend
                ↓
         ESPN Live Scraper → Redis → Realtime Updates
```

### 2. Draft Flow
```
Frontend Draft UI → Appwrite Realtime → All Participants
         ↓
    Draft Picks Collection → Roster Generation
```

### 3. Live Scoring Flow
```
ESPN API → Live Worker → Redis Aggregation
                ↓
         Appwrite Realtime → Frontend Updates
                ↓
         Scoring Engine → Fantasy Points
```

## Deployment Architecture

### Frontend (Vercel)
- Next.js application with SSR/SSG
- API routes for serverless functions
- Automatic deployments from main branch

### Workers (Fly.io)
- Dockerized Python workers
- Auto-scaling based on load
- Scheduled sleep periods

### Database (Appwrite)
- Self-hosted or Appwrite Cloud
- Real-time subscriptions
- Built-in authentication

### Caching (Upstash Redis)
- Player stat deltas
- Live game state
- Temporary data aggregation

## Development Workflow

### Local Development
1. Frontend: `npm run dev` in `/frontend`
2. API: `vercel dev` in root
3. Workers: `python live_worker.py` locally

### Testing
- Frontend: `npm test` (Jest/React Testing Library)
- API: `pytest` for Python tests
- E2E: Playwright tests (if configured)

### CI/CD Pipeline
1. GitHub Actions on push to main
2. Run tests
3. Deploy frontend to Vercel
4. Deploy workers to Fly.io
5. Run database migrations if needed

## Security Considerations

### API Security
- All endpoints require authentication
- Rate limiting on public endpoints
- Input validation on all user inputs

### Data Security
- Encrypted connections to Appwrite
- API keys stored as environment variables
- No sensitive data in client-side code

### Real-time Security
- Channel-based permissions
- User-scoped subscriptions
- Validated message formats