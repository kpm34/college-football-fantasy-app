# 🏈 College Football Fantasy App - Data Flow Documentation
Last Updated: August 16, 2025 (09:25 AM PST)

## Overview
This document outlines the complete data flow architecture for the College Football Fantasy platform, covering user interactions, database operations, and API integrations.

## Core Data Flow Architecture

### 1. User Authentication & Registration
```
User Registration/Login
    ↓
Appwrite Authentication Service
    ↓
User Profile Creation (users collection)
    ↓
Session Management & JWT Tokens
```

### 2. League Management Flow
```
League Creation
    ↓
Frontend Form (league/create)
    ↓
API Route (/api/leagues/create)
    ↓
Validation & Schema Check
    ↓
Appwrite Database (leagues collection)
    ↓
Response with League ID

League Search & Join Flow:
User Search → /api/leagues/search → Filter Results → Join Request
    ↓
/api/leagues/join → Validation → Database Update → Success Response
```

**Recent Updates to Join League Flow (August 16, 2025):**
- ✅ Fixed Appwrite schema to include `inviteToken`, `status`, and `expiresAt` fields in activity_log collection
- ✅ Resolved 'League ID is required' error by properly handling invite token validation
- ✅ Fixed invite API to use proper schema fields instead of searching in data field
- ✅ Updated schema sync script to include new invite-related fields
- ✅ All join league tests now passing (4/4)
- ✅ Updated schema constraints (max teams: 24 for college football)
- ✅ Fixed public/private league logic
- ✅ Implemented proper validation and error handling

### 3. Draft System Data Flow

#### Snake Draft Flow
```
Draft Initialization
    ↓
Draft Board UI (/draft/[leagueId])
    ↓
WebSocket Connection (real-time updates)
    ↓
Pick Selection → /api/draft/[leagueId]/pick
    ↓
Validation → Player Assignment → Roster Update
    ↓
Database Updates (rosters collection)
    ↓
Broadcast to All Participants
```

#### Auction Draft Flow
```
Auction Setup
    ↓
Auction Room (/auction/[leagueId])
    ↓
Bid Placement → /api/auction/[leagueId]/bid
    ↓
Real-time Bid Updates → Timer Management
    ↓
Auction Close → Winner Assignment
    ↓
Database Updates (auctions, bids, rosters)
```

### 4. Player Data Integration

#### College Football Data API (CFBD) Flow
```
External APIs (CFBD, ESPN)
    ↓
Data Sync Scripts (/scripts/sync-data.js)
    ↓
Data Transformation & Validation
    ↓
Appwrite Database Updates
    ↓
    ├── college_players collection
    ├── player_stats collection
    ├── teams collection
    └── games collection
```

#### Conference-Specific Data
```
Conference APIs
    ├── /api/sec → SEC data
    ├── /api/acc → ACC data
    ├── /api/big12 → Big 12 data
    └── /api/bigten → Big Ten data
    ↓
Unified Player Pool
    ↓
Draft-Eligible Players Filter
    ↓
Frontend Player Selection
```

### 5. Scoring & Game Management

#### Weekly Scoring Flow
```
Game Week Start
    ↓
Live Game Data (ESPN/CFBD APIs)
    ↓
Player Performance Tracking
    ↓
Eligibility Validation (AP Top-25 or Conference Games)
    ↓
Points Calculation
    ↓
Lineup Updates (lineups collection)
    ↓
Leaderboard Updates
```

#### Eligibility Rules Engine
```
Game Data Input
    ↓
Eligibility Check (/api/eligibility/check)
    ↓
Rules Validation:
    ├── vs AP Top-25 teams ✓
    ├── Conference games ✓
    └── Regular season only (no playoffs)
    ↓
Player Score Calculation
    ↓
Fantasy Points Assignment
```

## Database Schema Overview

### Core Collections
```
users
├── $id (string)
├── email (string)
├── username (string)
├── createdAt (datetime)
└── updatedAt (datetime)

leagues
├── $id (string)
├── name (string)
├── creatorId (string)
├── maxTeams (integer, max: 24) ✅ Fixed
├── currentTeams (integer, default: 0) ✅ Fixed
├── season (integer, e.g., 2025) ✅ Fixed
├── isPublic (boolean)
├── password (string, optional)
├── draftType (string: "snake" | "auction")
├── draftTime (datetime)
├── status (string)
├── createdAt (datetime)
└── updatedAt (datetime)

rosters
├── $id (string)
├── leagueId (string)
├── userId (string)
├── teamName (string)
├── players (array of player IDs)
├── draftPosition (integer)
└── totalSalary (integer, auction only)

college_players
├── $id (string)
├── name (string)
├── position (string)
├── team (string)
├── conference (string)
├── eligibleGames (array)
├── stats (object)
└── projections (object)
```

## API Endpoint Data Flow

### Critical Endpoints
```
POST /api/leagues/create
├── Input: League configuration
├── Validation: Schema compliance
├── Output: League object with ID
└── Side Effects: Database insertion

POST /api/leagues/join ✅ Recently Fixed
├── Input: League ID, user credentials
├── Validation: Capacity, password (if private)
├── Output: Join confirmation
└── Side Effects: Roster creation, team count update

GET /api/leagues/search
├── Input: Search criteria
├── Processing: Database query & filtering
├── Output: Filtered league list
└── Caching: None (real-time)

POST /api/draft/[leagueId]/pick
├── Input: Player selection, draft position
├── Validation: Turn order, player availability
├── Output: Pick confirmation
└── Side Effects: Roster update, draft progression
```

## Real-time Data Synchronization

### WebSocket Implementation
```
Client Connection
    ↓
WebSocket Server (draft rooms)
    ↓
Event Broadcasting:
    ├── Draft picks
    ├── Auction bids
    ├── League updates
    └── Live scoring
    ↓
UI State Synchronization
```

### Data Consistency Patterns
- **Optimistic Updates**: UI updates immediately, reverts on failure
- **Event Sourcing**: All draft actions logged for replay capability
- **Conflict Resolution**: Last-writer-wins with timestamp validation

## External API Integration

### College Football Data API (CFBD)
```
Endpoints Used:
├── /games → Game schedules and results
├── /players → Player roster data
├── /stats → Player performance statistics
├── /rankings → AP Top-25 rankings
└── /teams → Team information

Rate Limits: 200 requests/hour (with backup key)
Caching Strategy: 15-minute cache for live data, daily for historical
```

### ESPN API Integration
```
Live Scoring:
├── Game status updates
├── Play-by-play data
├── Real-time statistics
└── Injury reports

Update Frequency: Every 5 minutes during games
```

## Performance & Optimization

### Database Query Optimization
- **Indexed Fields**: User email, league name, player name
- **Compound Queries**: League search with multiple filters
- **Pagination**: All list endpoints support pagination
- **Caching**: Redis for frequently accessed data

### Frontend Performance
- **Code Splitting**: Route-based chunks
- **Image Optimization**: Next.js automatic optimization
- **API Caching**: SWR for client-side caching
- **Progressive Loading**: Skeleton screens and lazy loading

## Security & Data Protection

### Authentication Flow
```
User Login
    ↓
Appwrite Authentication
    ↓
JWT Token Generation
    ↓
Server-side Validation
    ↓
Protected Route Access
```

### Data Validation
- **Input Sanitization**: All user inputs validated
- **SQL Injection Prevention**: Parameterized queries via Appwrite SDK
- **XSS Protection**: React's built-in escaping
- **CSRF Protection**: Same-origin policy enforcement

## Error Handling & Recovery

### Database Error Handling
```
Operation Attempt
    ↓
Error Detection
    ↓
    ├── Validation Error → User feedback
    ├── Network Error → Retry logic
    ├── Permission Error → Auth refresh
    └── Unknown Error → Fallback UI
    ↓
Error Logging (Sentry integration)
```

### Graceful Degradation
- **Offline Support**: Service Worker caching
- **API Fallbacks**: Multiple data sources
- **UI Fallbacks**: Static content when dynamic fails

## Monitoring & Analytics

### Performance Metrics
- **Database Query Times**: Monitored via Appwrite console
- **API Response Times**: Vercel analytics
- **User Engagement**: Custom event tracking
- **Error Rates**: Sentry error monitoring

### Data Quality Assurance
- **Schema Validation**: Strict TypeScript types
- **Data Integrity Tests**: Automated test suite
- **Manual Verification**: Admin dashboard for data review

## Development Tools & Testing

### Data Flow Testing
```
Test Scripts:
├── scripts/test-join-league.js ✅ (4/4 tests passing)
├── scripts/sync-appwrite-schema.js ✅ (Schema synchronization)
└── scripts/cleanup-test-data.js ✅ (Test data management)

Test Coverage:
├── Unit Tests: Individual functions
├── Integration Tests: API endpoints
├── E2E Tests: Complete user workflows
└── Load Tests: High concurrent usage
```

### Debugging & Troubleshooting
```
Debug Tools:
├── Appwrite Console → Database inspection
├── Vercel Dashboard → Deployment logs
├── Browser DevTools → Client-side debugging
└── VS Code Debugger → Server-side debugging

Logging Strategy:
├── Error Logs → Sentry
├── Performance Logs → Vercel Analytics
├── User Activity → Custom tracking
└── Database Logs → Appwrite built-in
```

---

## Summary

The College Football Fantasy App implements a robust data flow architecture that handles:

1. **User Management**: Secure authentication and profile management
2. **League Operations**: Creation, search, and join functionality (recently fixed)
3. **Draft Systems**: Both snake and auction formats with real-time updates
4. **Player Data**: Comprehensive college football player database
5. **Live Scoring**: Real-time game tracking with eligibility rules
6. **Performance**: Optimized queries and caching strategies
7. **Security**: Multi-layer protection and validation
8. **Monitoring**: Comprehensive error tracking and performance metrics

**Recent Improvements (August 2025):**
- ✅ Fixed join league database schema issues
- ✅ Updated max teams to 24 for college football
- ✅ Implemented proper public/private league logic
- ✅ All critical data flows tested and verified

This architecture supports the unique requirements of college football fantasy sports while maintaining scalability and reliability for growing user base.