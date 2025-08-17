# College Football Fantasy App - Complete Project Overview for GPT

**Last Updated:** August 17, 2025  
**Status:** Production Deployed ✅  
**Data Flow:** Fully Aligned ✅  

## Quick Project Summary

This is a **College Football Fantasy Sports Platform** exclusively for Power 4 conferences (SEC, ACC, Big 12, Big Ten) with unique eligibility rules where players are only fantasy-relevant when playing vs AP Top-25 teams or in conference games. The platform features sophisticated projection algorithms, real-time draft rooms, auction systems, and comprehensive data pipeline architecture.

**Live URL:** https://cfbfantasy.app  
**Tech Stack:** Next.js 15, TypeScript, Appwrite, Vercel, CFBD API  
**Unique Features:** 12-week regular season only, Power 4 exclusive, complex eligibility rules  

## 🏗️ Project Architecture Overview

### Current Directory Structure
```
college-football-fantasy-app/
├── app/                          # Next.js 15 App Router
│   ├── api/                     # API routes (aligned data flow)
│   │   ├── draft/players/       # Main player API (10K players, ordered projections)
│   │   ├── leagues/             # League management
│   │   ├── cfbd/               # CFBD API integration
│   │   └── [conference]/        # Conference-specific endpoints
│   ├── draft/[leagueId]/realtime/ # Real-time draft room
│   ├── auction/                 # Auction draft interface
│   ├── league/                  # League management pages
│   └── projection-showcase/     # Algorithm demonstration
├── functions/project-yearly-simple/ # 🎯 CANONICAL PROJECTION PIPELINE
├── scripts/                     # Data management and verification
│   ├── activate-pipeline-simple.ts # Pipeline activation
│   └── verify-data-flow-alignment.ts # Data flow verification
├── lib/                         # Utilities and configurations
│   ├── appwrite.ts              # Database client
│   └── services/                # Business logic (cleaned up)
├── core/                        # Architecture and pipeline
│   ├── pipeline/data-flow-map.ts # Complete system architecture
│   └── schema/                  # Database schema definitions
├── docs/                        # Documentation
│   └── DATA_FLOW_ALIGNMENT.md   # Single source of truth documentation
├── data/                        # Static data files
│   ├── depth/                   # Depth charts and overrides
│   └── processed/               # Processed data files
└── CLAUDE.md                    # Complete project context
```

## 🚀 Core Technology Stack

- **Frontend:** Next.js 15.4.5 with App Router, TypeScript 5.x, Tailwind CSS v3
- **Backend:** Node.js 18-22, Express.js, Appwrite BaaS (NYC region)
- **Database:** Appwrite with structured collections and relationships
- **APIs:** College Football Data API (CFBD), ESPN API, Rotowire integration
- **Deployment:** Vercel with Edge Functions and GitHub Actions CI/CD
- **3D Graphics:** Three.js, React Three Fiber, Spline (future enhancements)
- **AI Integration:** Vercel AI SDK, Anthropic Claude, Chrome AI

## 🎯 Unique Fantasy Rules

1. **Power 4 Exclusive:** Only SEC, ACC, Big 12, and Big Ten conferences
2. **Eligibility Logic:** Players only score fantasy points when:
   - Playing against AP Top-25 ranked teams, OR
   - Playing in conference games (intra-conference matchups)
3. **Season Structure:** 12-week regular season only (no playoffs/bowls)
4. **Draft Systems:** Snake draft with timer + Auction draft with real-time bidding

## 📊 Data Pipeline Architecture (ALIGNED - August 17, 2025)

### Single Source of Truth Flow
```
functions/project-yearly-simple/ → college_players.fantasy_points → /api/draft/players → UI
```

### Comprehensive Projection Algorithm Inputs
1. **Team Pace** - Plays per game estimates
2. **Offensive Efficiency** - Team efficiency Z-scores  
3. **Depth Chart Position** - Player ranking within position group
4. **Usage Priors** - Historical snap/rush/target share data
5. **Injury Risk Assessment** - Player health and availability
6. **NFL Draft Capital** - Future pro potential multipliers
7. **Conference Strength** - Power 4 conference adjustments

### Key Database Collections (Appwrite)
- **`college_players`** - Player database with `fantasy_points` field (canonical source)
- **`model_inputs`** - Algorithm inputs (depth charts, usage priors, team efficiency)
- **`games`** - Game schedules with eligibility logic
- **`rankings`** - AP Top 25 weekly rankings
- **`leagues`** - User fantasy leagues
- **`rosters`** - Draft results and team rosters
- **`auctions`** - Auction draft state and bidding

### Removed Redundancies (August 17, 2025)
- ❌ `/lib/services/enhanced-projections.service.ts` 
- ❌ `/app/api/projections/route.ts`
- ❌ `calculateBaseProjection()` functions in API routes
- ❌ Multiple duplicate projection algorithms
- ✅ **Single comprehensive pipeline** as source of truth

## 🔧 Key API Endpoints

### Primary Data Endpoints
- **`/api/draft/players`** - Main player API (up to 10,000 players)
  - `?orderBy=projection` - Ordered by fantasy points (highest first)
  - `?limit=10000` - All available players
  - `?position=QB|RB|WR|TE` - Position filtering
  - `?conference=SEC|ACC|Big 12|Big Ten` - Conference filtering

### Draft & League Endpoints  
- **`/api/draft/[leagueId]/pick`** - Make draft selection
- **`/api/leagues/create`** - Create new fantasy league  
- **`/api/leagues/join`** - Join league via invite token
- **`/api/auction/[leagueId]/bid`** - Place auction bid

### External Data Integration
- **`/api/cfbd/`** - CFBD API proxy with rate limiting
- **`/api/rankings`** - AP Top 25 weekly rankings
- **`/api/games`** - Game schedules with eligibility calculations

## 🎮 Frontend Components & Pages

### Draft System
- **`/draft/[leagueId]/realtime`** - Real-time snake draft room
- **`/auction/[leagueId]`** - Live auction draft interface
- **`/draft/mock`** - Mock draft for testing

### League Management  
- **`/league/create`** - League creation wizard
- **`/league/[leagueId]`** - League dashboard and management
- **`/league/[leagueId]/standings`** - Weekly standings and scores

### Showcase & Info
- **`/projection-showcase`** - Algorithm demonstration (starters vs backups)
- **`/conference-showcase`** - Power 4 conference team displays
- **`/`** - Landing page with 3D graphics

## ⚙️ Scripts & Automation

### Pipeline Management
- **`scripts/activate-pipeline-simple.ts`** - Main projection pipeline activation
- **`scripts/verify-data-flow-alignment.ts`** - Data flow verification
- **`scripts/sync-enhanced-projections.js/.ts`** - Projection sync utilities

### Data Management
- **`functions/project-yearly-simple/index.ts`** - Canonical projection algorithm
- **`core/data-ingestion/`** - 4-layer data ingestion system
- **`scripts/sync-appwrite-schema.js`** - Database schema management

## 🔍 Recent Major Updates (August 17, 2025)

### ✅ Data Flow Alignment Completed
1. **Removed Redundant Algorithms** - Cleaned up duplicate projection calculations
2. **Established Single Source** - `functions/project-yearly-simple/` as canonical pipeline
3. **Aligned API Layer** - Routes now passthrough database values (no calculations)
4. **Verified 100% Consistency** - Database ↔ API ↔ UI alignment confirmed
5. **Enhanced Player Display** - Draft interface now shows all 10,000+ players
6. **Fixed Projection Ordering** - Highest to lowest projections working correctly

### 📚 Documentation Created
- **`/docs/DATA_FLOW_ALIGNMENT.md`** - Single source of truth documentation
- **`/core/pipeline/data-flow-map.ts`** - Complete system architecture mapping
- **`/scripts/verify-data-flow-alignment.ts`** - Automated verification system

## 🌐 Production Deployment

### Current Status
- **Production URL:** https://cfbfantasy.app
- **Deployment Platform:** Vercel with Edge Functions
- **Database:** Appwrite (NYC region) - Project ID: `college-football-fantasy-app`
- **CI/CD:** GitHub Actions + Vercel automatic deployments
- **Monitoring:** Health endpoints, synthetic monitoring, Playwright smoke tests

### Environment Configuration
```bash
# Appwrite (Database)
APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=college-football-fantasy-app
APPWRITE_DATABASE_ID=college-football-fantasy

# External APIs
CFBD_API_KEY=[configured]
CFBD_API_KEY_BACKUP=[configured]

# AI & Monitoring  
AI_GATEWAY_URL=https://ai-gateway.vercel.sh/v1/ai
INNGEST_EVENT_KEY=[configured]
EDGE_CONFIG=[configured]
```

## 🧪 Testing & Quality Assurance

### Testing Infrastructure
- **Contract Tests** - API schema validation
- **Playwright Smoke Tests** - 30-second regression detection
- **Synthetic Monitoring** - Real-time health checks
- **MSW Handlers** - Mock service worker for testing

### Data Validation
- **Schema Enforcement** - Strict TypeScript + Appwrite validation
- **Pipeline Verification** - Automated projection accuracy checks
- **API Consistency** - Database ↔ API ↔ UI alignment verification

## 🎯 Business Logic & Rules

### Fantasy Scoring System
- **Passing:** 0.04 pts/yard, 4 pts/TD, -2 pts/INT
- **Rushing:** 0.1 pts/yard, 6 pts/TD
- **Receiving:** 0.1 pts/yard, 6 pts/TD, 1 pt/reception
- **Kicking:** Standard field goal and extra point scoring

### Player Eligibility Logic
```typescript
// Players only score when:
const isEligible = (game) => {
  const hasRankedOpponent = rankings.some(rank => 
    rank.team === game.opponent && rank.rank <= 25
  );
  const isConferenceGame = 
    POWER_4_CONFERENCES.includes(game.home_conference) && 
    POWER_4_CONFERENCES.includes(game.away_conference);
  
  return hasRankedOpponent || isConferenceGame;
};
```

### Draft Algorithm Differentiation
- **Starters:** Full projection multiplier (1.0x)
- **Backups:** Reduced based on position depth
  - QB2: 25%, QB3+: 8%
  - RB2: 60%, RB3: 40%  
  - WR2: 80%, WR3: 60%
  - TE2: 35%, TE3+: 15%

## 🔒 Security & Performance

### Security Measures
- **API Keys:** Secure environment variable management
- **Rate Limiting:** CFBD API and internal endpoint protection
- **Input Validation:** Strict schema enforcement across all inputs
- **Authentication:** Appwrite user management and session handling

### Performance Optimizations  
- **Edge Functions:** Vercel edge deployment for global performance
- **Database Indexing:** Optimized queries for large player datasets
- **API Caching:** TTL-based caching for frequently accessed endpoints
- **Progressive Loading:** 10K+ players loaded efficiently in draft interface

## 🚨 Known Technical Considerations

### Current Challenges
1. **Data Quality** - Some outdated player records (transfers, graduations)
2. **Depth Chart Logic** - Limited differentiation between starter/backup projections
3. **Conference API Duplication** - 4 separate conference endpoints need unification
4. **Collection Naming** - `players` vs `college_players` inconsistency

### Planned Improvements
1. **Enhanced Depth Charts** - Better starter/backup differentiation
2. **Real-time Updates** - Live game scoring integration
3. **3D Enhancements** - Awwwards-rig integration for mascot system
4. **Mobile Optimization** - Progressive Web App improvements

## 📈 Analytics & Monitoring

### System Monitoring
- **Health Endpoint:** `/api/health` - System status checks
- **Synthetic Monitoring:** Automated testing every 5 minutes
- **KV Storage:** Performance metrics and alerting
- **GitHub Actions:** Deployment and testing automation

### Performance Metrics
- **API Response Times:** Sub-200ms for player queries
- **Database Connections:** Stable Appwrite connectivity
- **Projection Accuracy:** Evaluation system for algorithm performance
- **User Engagement:** Draft completion rates and league activity

## 🎓 For ChatGPT Context

### When Working on This Project:
1. **Fantasy Logic First** - Always consider Power 4 + eligibility rules
2. **Single Source of Truth** - Use `college_players.fantasy_points` for projections
3. **No Redundant Calculations** - API routes should passthrough database values
4. **Type Safety** - Strict TypeScript throughout
5. **Performance Focus** - Mobile + desktop optimization
6. **Test Thoroughly** - Especially draft systems and projection algorithms

### Key Files to Reference:
- **`CLAUDE.md`** - Complete project context and recent updates
- **`core/pipeline/data-flow-map.ts`** - System architecture
- **`docs/DATA_FLOW_ALIGNMENT.md`** - Current data flow documentation
- **`functions/project-yearly-simple/index.ts`** - Canonical projection algorithm
- **`app/api/draft/players/route.ts`** - Main player API endpoint

### Architecture Principles:
- **Comprehensive Projections** - 6+ data inputs for accurate fantasy predictions
- **Real-time Capabilities** - Live draft rooms and auction systems
- **Scalable Data Pipeline** - 4-layer ingestion with monitoring
- **Production Ready** - Deployed, tested, and monitored system

This project represents a sophisticated, production-ready fantasy sports platform with unique rules, comprehensive projection algorithms, and a fully aligned data architecture optimized for performance and accuracy.

---
**Generated:** August 17, 2025  
**For:** ChatGPT project understanding  
**Status:** ✅ Complete and Current