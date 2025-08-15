# College Football Fantasy App - Data Flow Architecture

Last Updated: August 14, 2025

## Key Integration Points

### 3D Features (Awwwards-rig)
- **Location**: `/vendor/awwwards-rig/`
- **Purpose**: 3D mascot generation and logo design tools
- **Integration**: Will provide APIs for custom team branding
- **Data Flow**: User Input → 3D Engine → Generated Assets → Blob Storage

## Overview
This document maps the complete data flow architecture of the College Football Fantasy App, highlighting the various patterns, sources, and destinations of data throughout the application.

## Data Sources

### 1. Primary Data Sources
- **Appwrite Database**: Main source of truth for all persistent data
- **College Football Data API (CFBD)**: External API for game/player statistics
- **ESPN API**: Game scores and live data (planned)
- **Rotowire API**: Player projections and fantasy data
- **Mock Data**: Fallback data for development/testing

### 2. Caching Layers
- **Vercel KV**: Session state, draft state (planned)
- **Edge Config**: Feature flags, configuration
- **Browser Cache**: Static assets, API responses
- **Service Worker**: Offline support, background sync

## Data Flow Patterns

### Authentication Flow
```
User Login → /api/auth/login → Appwrite Auth API
         ↓
    Session Cookie (appwrite-session)
         ↓
    Middleware Validation → Protected Routes
```

### League Management Flow
```
Create League:
User Input → /api/leagues/create → Appwrite SDK
         ↓
    Create League Document (leagues collection)
         ↓
    Create Commissioner Team (teams/rosters collection)
         ↓
    Generate Invite Code → Return to Client

Join League:
Invite Code → /api/leagues/join → Validate Code
         ↓
    Create Team/Roster → Add to League
         ↓
    Update League Member Count
```

### Draft System Flow (Multiple Implementations)

#### Implementation A: Main Draft
```
/draft/[leagueId] → /api/draft/[leagueId]/status
         ↓
    Load Draft State from Appwrite
         ↓
    Real-time Updates via Appwrite Realtime
         ↓
    Pick Selection → /api/draft/[leagueId]/pick
         ↓
    Update draft_picks collection
```

#### Implementation B: Draft Players API
```
/api/draft/players → Query college_players collection
         ↓
    Filter by conference/position/draftable
         ↓
    Apply pagination (limit/offset)
         ↓
    Return formatted player list
```

### Conference Data Flow (Inconsistent)

#### Pattern 1: Mock Data (ACC, SEC)
```
/api/acc or /api/sec → Return hardcoded JSON
         ↓
    No database interaction
```

#### Pattern 2: Hybrid (Big 12)
```
/api/big12 → Try Appwrite Query
         ↓
    If success → Return DB data
    If fail → Return mock fallback
```

#### Pattern 3: Complex Filtering (Big Ten)
```
/api/bigten → Parse query params
         ↓
    Build Appwrite Query with filters
         ↓
    Execute query → Format response
```

### Player Data Flow (3 Different Patterns)

#### Pattern 1: Draftable Players
```
/api/players/draftable → Query with draftable=true
         ↓
    Join with rankings/stats
         ↓
    Return enriched player data
```

#### Pattern 2: Direct SDK Access
```
Component → Import databases from @/lib/appwrite
         ↓
    Direct listDocuments() call
         ↓
    Process in component
```

#### Pattern 3: REST Wrapper
```
Component → Fetch from /api/players
         ↓
    API Route wraps SDK call
         ↓
    Return JSON response
```

### Scoring & Game Data Flow
```
External APIs (CFBD/ESPN) → /api/scraper
         ↓
    Process & Transform Data
         ↓
    Store in Appwrite (games/player_stats)
         ↓
    Cron Job (/api/cron/weekly-scoring)
         ↓
    Calculate Fantasy Points
         ↓
    Update rosters/lineups collections
```

### Real-time Updates Flow
```
User Action → Appwrite SDK Update
         ↓
    Appwrite Realtime Event
         ↓
    WebSocket to All Subscribers
         ↓
    UI Update (optimistic + confirmed)
```

## Projections Data Flow (2025)

### Ingestion → model_inputs
- EA Ratings (EA CSV) → `ea_ratings_json`
- Mock Draft (aggregated CSV/JSON) → `nfl_draft_capital_json`
- Depth Charts (team sites/OurLads/247) → `depth_chart_json` + `usage_priors_json`
- Team Efficiency & Pace (SP+/FEI + pace) → `team_efficiency_json` + `pace_estimates_json`
- Opponent Grades (derived) → `opponent_grades_by_pos`

### Projectors
- Yearly Simple: reads model_inputs → writes `projections_yearly` (games_played_est, usage_rate, pace_adj, statline_simple_json, fantasy_points_simple)
- Pro Distributions: Monte Carlo → writes:
  - weekly: floor/median/ceiling, boom/bust, grades, rank_pro
  - yearly: range_*, percentiles_json, volatility_score, replacement_value

### User Custom Recalc (Pro)
- Read overrides from `user_custom_projections` and merge into baselines
- Recalculate (weekly/yearly) on demand and return ephemeral result (no global mutation)

## Data Models & Collections

### Core Collections (Appwrite)
1. **users** - User profiles and preferences
2. **leagues** - League settings and configuration
3. **teams/rosters** - Team rosters (naming inconsistency)
4. **players/college_players** - Player database (naming conflict)
5. **draft_picks** - Draft selections
6. **lineups** - Weekly lineup submissions
7. **games** - Game schedules and scores
8. **player_stats** - Statistical data
9. **rankings** - AP Top 25 rankings
10. **auctions** - Auction draft data
11. **bids** - Auction bid history

### Data Relationships
```
User (1) → (N) Teams/Rosters
League (1) → (N) Teams/Rosters
League (1) → (N) Draft Picks
Team/Roster (1) → (N) Players
Team/Roster (1) → (N) Lineups
Player (1) → (N) Stats
Game (1) → (N) Player Stats
```

## API Endpoints Map

### Authentication APIs
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/user` - Get current user
- `POST /api/auth/update-profile` - Update profile

### League APIs
- `POST /api/leagues/create` - Create new league
- `GET /api/leagues/[leagueId]` - Get league details
- `GET /api/leagues/my-leagues` - Get user's leagues
- `GET /api/leagues/search` - Search leagues
- `POST /api/leagues/invite` - Generate/validate invite

### Draft APIs
- `GET /api/draft/[leagueId]/status` - Draft status
- `POST /api/draft/[leagueId]/pick` - Make pick
- `GET /api/draft/players` - Get draftable players

### Conference APIs (Needs Consolidation)
- `GET /api/acc` - ACC data
- `GET /api/big12` - Big 12 data
- `GET /api/bigten` - Big Ten data
- `GET /api/sec` - SEC data

### Data Sync APIs
- `GET /api/scraper` - Sync external data
- `GET /api/cron/weekly-scoring` - Calculate scores
- `GET /api/projections` - Player projections

## Data Flow Issues & Recommendations

### Critical Issues
1. **Multiple Sources of Truth**
   - Collection names inconsistent (players vs college_players)
   - Configuration spread across 6+ files
   - Mixed SDK vs REST API usage

2. **Conference API Fragmentation**
   - 4 different implementations for same purpose
   - Inconsistent response formats
   - Mixed mock/real data strategies

3. **Authentication Complexity**
   - Cookie-based for some routes
   - Direct SDK for others
   - Session validation inconsistent

### Recommendations

#### Short-term (1-2 weeks)
1. **Standardize Collection Names**: Pick one naming convention
2. **Unify Conference APIs**: Single implementation, consistent format
3. **Consolidate Appwrite Config**: Single source of truth

#### Medium-term (1 month)
1. **Implement Caching Strategy**: Use Vercel KV for hot data
2. **Standardize Data Access**: Choose SDK or REST, not both
3. **Add Data Validation**: Zod schemas for all API responses

#### Long-term (3 months)
1. **Implement GraphQL**: Single endpoint, efficient queries
2. **Add Redis/KV Layer**: Reduce database load
3. **Event-Driven Architecture**: Pub/sub for real-time updates

## Performance Considerations

### Current Bottlenecks
- No caching on frequently accessed data
- Multiple database queries per request
- Large payload sizes without pagination
- Synchronous data processing in API routes

### Optimization Opportunities
1. **Implement ISR**: For static-heavy pages
2. **Add Edge Caching**: For read-heavy endpoints
3. **Use Streaming**: For large data responses
4. **Batch Operations**: Reduce database round trips

## Security Considerations

### Current Gaps
- API keys exposed in client code (some instances)
- Inconsistent permission checking
- No rate limiting on critical endpoints
- Session validation varies by route

### Required Improvements
1. **Centralize Auth**: Single middleware for all routes
2. **Add Rate Limiting**: Especially for write operations
3. **Implement RBAC**: Role-based access control
4. **Audit Logging**: Track all data modifications

## Monitoring & Observability

### Current State
- Basic console.error logging
- Sentry integration (partial)
- No structured logging
- Limited performance metrics

### Recommended Stack
1. **Structured Logging**: Winston/Pino
2. **APM**: Datadog or New Relic
3. **Error Tracking**: Complete Sentry setup
4. **Analytics**: Vercel Analytics + custom events

---

This data flow documentation should be updated as the architecture evolves. Priority should be given to standardizing data access patterns and reducing duplication.