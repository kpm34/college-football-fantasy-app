# Environment Variables

## Required Variables for Vercel

These environment variables should be set in Vercel Dashboard for Production, Preview, and Development:

### Core Appwrite Configuration
```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=college-football-fantasy-app
NEXT_PUBLIC_APPWRITE_DATABASE_ID=college-football-fantasy
APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=college-football-fantasy-app
DATABASE_ID=college-football-fantasy
APPWRITE_API_KEY=your-api-key-here
```

### Collection IDs
```env
NEXT_PUBLIC_APPWRITE_COLLECTION_LEAGUES=leagues
NEXT_PUBLIC_APPWRITE_COLLECTION_TEAMS=teams
NEXT_PUBLIC_APPWRITE_COLLECTION_ROSTERS=rosters
NEXT_PUBLIC_APPWRITE_COLLECTION_LINEUPS=lineups
NEXT_PUBLIC_APPWRITE_COLLECTION_GAMES=games
NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYERS=players
NEXT_PUBLIC_APPWRITE_COLLECTION_RANKINGS=rankings
NEXT_PUBLIC_APPWRITE_COLLECTION_ACTIVITY_LOG=activity_log
NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFT_PICKS=draft_picks
NEXT_PUBLIC_APPWRITE_COLLECTION_AUCTION_BIDS=auction_bids
NEXT_PUBLIC_APPWRITE_COLLECTION_AUCTION_SESSIONS=auction_sessions
NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYER_PROJECTIONS=player_projections
NEXT_PUBLIC_APPWRITE_COLLECTION_USERS=users
```

### Server-Side Only (Optional extras)
```env
# External APIs
CFBD_API_KEY=your-cfbd-api-key
AI_GATEWAY_API_KEY=your-ai-gateway-key

# Background Jobs (if using Inngest)
INNGEST_SIGNING_KEY=your-signing-key
INNGEST_EVENT_KEY=your-event-key

# Feature Flags (if using Edge Config)
EDGE_CONFIG=your-edge-config-url

# Design tooling
CODE_TO_DESIGN_API_KEY=your-code-to-design-api-key
```

## Important Notes

1. **NEXT_PUBLIC_** prefix is required for variables that need to be available in the browser
2. Don't duplicate variables with different names
3. Keep server-side API keys without the NEXT_PUBLIC_ prefix
4. All collection names should match exactly with Appwrite collection IDs
5. Avoid creating duplicate env var entries in Vercel (e.g., both `DATABASE_ID` and `NEXT_PUBLIC_DATABASE_ID`). Use the names above.

## Local Development

Copy to `.env.local` at the project root:
```bash
# Copy all NEXT_PUBLIC_* variables from above
# Add any server-side keys you need locally
# Include CODE_TO_DESIGN_API_KEY for Figma html.to.design imports
```
