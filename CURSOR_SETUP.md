# Cursor AI Setup Guide

## Quick Reference for Environment Variables

All environment variables are now accessible in multiple locations for Cursor:

### 📁 Environment Files
1. **`.env`** (root) - Main reference for Cursor AI
2. **`frontend/.env.local`** - Runtime environment for Next.js
3. **`.env.production.local`** - Production environment pulled from Vercel

### 🔑 Key Variables Available

#### Database (Appwrite)
```bash
APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=college-football-fantasy-app
APPWRITE_DATABASE_ID=college-football-fantasy
```

#### API Keys
```bash
CFBD_API_KEY         # College Football Data API
AI_GATEWAY_API_KEY   # Vercel AI Gateway
INNGEST_EVENT_KEY    # Background jobs
EDGE_CONFIG          # Feature flags
```

#### Collections (All prefixed with NEXT_PUBLIC_APPWRITE_COLLECTION_)
- AUCTIONS - Auction draft data
- BIDS - Auction bid history
- DRAFTED_PLAYERS - Team rosters
- GAMES - Game schedules and scores
- LEAGUES - Fantasy leagues
- MATCHUPS - Weekly lineups
- PLAYERS - College players database
- PLAYER_STATS - Statistics
- RANKINGS - AP Top 25
- TEAMS - Power 4 teams
- USERS - User accounts

### 📋 Quick Commands for Cursor

When using Cursor AI, you can reference these commands:

```bash
# Development
npm run dev              # Start frontend (port 3001)
npm run server           # Start backend (port 3000)

# Deployment
vercel                   # Deploy preview
vercel --prod           # Deploy to production
vercel pull             # Pull environment variables

# Data Management
npm run sync-data       # Sync from APIs to database
npm test                # Test API endpoints

# Code Quality
npm run lint            # Check code style
npm run typecheck       # TypeScript validation
```

### 🎯 Cursor AI Context Files

These files provide context for Cursor:

1. **`.cursorrules`** - AI behavior guidelines
2. **`CLAUDE.md`** - Comprehensive project documentation
3. **`cursor.config.json`** - Tool and path configurations
4. **This file** (`CURSOR_SETUP.md`) - Quick reference

### 🛠️ Available Tools via MCP

When using Cursor with Claude Code, these tools are available:
- File operations (Read, Write, Edit, MultiEdit)
- Web fetching and searching
- Task management (TodoWrite)
- Git operations
- IDE diagnostics
- Code execution

### 📂 Important Paths

```
frontend/               # Next.js application
├── app/api/           # API routes
├── components/        # React components
├── lib/              # Utilities and configs
└── types/            # TypeScript definitions

src/                   # Backend code
├── services/         # Business logic
├── scripts/          # Data management
└── config/           # Configuration

confrence rosters/     # Team roster data
```

### 🚀 Getting Started with Cursor

1. Open the project in Cursor
2. Point Cursor to `.env` file for environment variables
3. Reference `.cursorrules` for coding guidelines
4. Use `cursor.config.json` for project structure
5. Check `CLAUDE.md` for comprehensive documentation

### 💡 Tips for Cursor Usage

1. **Environment Variables**: Always reference `.env` in root for latest values
2. **API Endpoints**: Check `frontend/app/api/` for all available routes
3. **Type Definitions**: Use `frontend/types/` for TypeScript interfaces
4. **Database Schema**: Reference Appwrite collections in cursor.config.json
5. **Deployment**: Use Vercel CLI commands for deployment tasks

### 🔗 Useful Links

- Vercel Dashboard: https://vercel.com/kpm34s-projects
- Appwrite Console: https://cloud.appwrite.io/console
- Production Site: https://cfbfantasy.app
- CFBD API Docs: https://collegefootballdata.com/

---

All tools and configurations are now properly set up for Cursor AI to access and understand the project structure, environment variables, and available commands.