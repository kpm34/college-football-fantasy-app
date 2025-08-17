# 🏈 College Football Fantasy App - Data Flow Documentation
Last Updated: August 17, 2025 (10:15 AM PST)

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

#### **✅ ENHANCED: Projections System Flow (August 17, 2025)**
```
Enhanced Projections Pipeline:

External Data Sources
    ├── CFBD API (Player data)
    ├── ESPN API (Live stats)
    └── Depth Chart Sources
    ↓
Data Ingestion & Validation
    ↓
Appwrite Database Storage:
    ├── college_players collection (fantasy_points field)
    ├── model_inputs collection (depth charts, team data)
    ├── player_stats collection (game-by-game)
    └── teams collection (team metadata)
    ↓
On-Demand Projection Calculation (/api/draft/players)
    ↓
Depth Chart Logic Application:
    ├── QB1: 100% share (~340 fantasy points)
    ├── QB2: 25% share (~85 fantasy points)
    ├── QB3+: 5% share (~17 fantasy points)
    └── Similar multipliers for RB, WR, TE positions
    ↓
Fantasy Draft Interface
```

#### **Migration from Legacy Projections (Completed)**
```
❌ DEPRECATED (August 17, 2025):
├── /lib/services/projections.service.ts (760 lines removed)
├── /lib/services/weekly-projections-builder.service.ts
├── /api/projections route (now returns HTTP 410 Gone)
├── Sync scripts (deprecated with clear error messages)
└── Pre-computed projection storage

✅ NEW APPROACH:
├── Real-time calculation in /api/draft/players
├── Depth chart multipliers applied on-demand
├── Field priority: fantasy_points > calculated > legacy
├── Enhanced schema with model_inputs collection
└── Error-first approach (prefer errors over old data)
```

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
    ├── college_players collection (with enhanced projections)
    ├── player_stats collection
    ├── teams collection
    ├── games collection
    └── model_inputs collection (NEW)
```

#### Conference-Specific Data
```
Conference APIs
    ├── /api/sec → SEC data
    ├── /api/acc → ACC data
    ├── /api/big12 → Big 12 data
    └── /api/bigten → Big Ten data
    ↓
Enhanced Player Pool with Projections
    ↓
Draft-Eligible Players Filter (with depth chart rankings)
    ↓
Frontend Player Selection (showing accurate projected points)
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

### 6. Projection Model Evaluation System

#### Evaluation Pipeline Flow
```
Projection Data (projections_weekly, projections_yearly)
    ↓
Actual Performance Data (scoring, player_stats)
    ↓
CLI Trigger: eval_proj --weeks 2024W1-2024W14 --out reports/eval.md
    ↓
Data Matching & Position-Tier Assignment
    ↓
Metrics Calculation:
    ├── MAE (Mean Absolute Error)
    ├── sMAPE (Symmetric Mean Absolute Percentage Error)
    ├── R² (Correlation Strength)
    ├── RMSE (Root Mean Squared Error)
    └── Calibration Analysis
    ↓
Tier Analysis:
    ├── Top-12 (QB1-12, RB1-12, WR1-12, TE1-12)
    ├── Mid-Tier (QB13-24, RB13-24, WR13-24, etc.)
    ├── Deep Tiers (RB25-36, WR25-48, etc.)
    └── Bench/Streaming (Others)
    ↓
Report Generation:
    ├── Markdown Report (executive summary, tables, recommendations)
    ├── JSON Report (machine-readable, API integration)
    └── Parquet Report (data science workflows)
    ↓
Model Improvement Feedback Loop
```

**Evaluation System Features (August 17, 2025):**
- ✅ Complete CLI interface with `npm run eval_proj` command
- ✅ Position-tier analysis with standard fantasy tiers
- ✅ Multiple output formats (Markdown, JSON, Parquet)
- ✅ Time series and calibration analysis options
- ✅ Objective locked: Beat current model by ≥10% MAE across RB/WR
- ✅ 7 core evaluation modules in `/evaluation/` directory
- ✅ Test validation system ensuring all components work
- ✅ Ready for model improvement iteration cycles

#### CLI Usage Examples
```bash
# Basic evaluation
npm run eval_proj -- --weeks 2024W1-2024W14 --out reports/season_eval.md

# Advanced analysis with calibration
npm run eval_proj -- --weeks 2024W10-2024W14 --positions QB,RB,WR --calibration --time-series --out reports/deep_analysis.md

# Multiple output formats for data science
npm run eval_proj -- --weeks 2023W1-2024W14 --format markdown,json,parquet --out reports/full_analysis
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

✅ NEW: GET /api/draft/players (Enhanced Projections)
├── Input: Position, conference, search filters
├── Processing: 
│   ├── Database query (college_players collection)
│   ├── Depth chart logic application
│   ├── Real-time projection calculation
│   └── Field priority: fantasy_points > calculated > legacy
├── Output: Players with accurate projected points
└── Caching: None (real-time depth chart adjustments)

❌ DEPRECATED: GET /api/projections (Returns HTTP 410 Gone)
├── Status: 410 Gone
├── Message: "Endpoint removed - use /api/draft/players instead"
├── Migration: Clear guidance to new endpoint
└── Reason: Consolidation to prevent confusion and technical debt
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

### **✅ NEW: Comprehensive Monitoring Infrastructure (August 17, 2025)**

#### Synthetic Monitoring System
```
Health Endpoint (/api/health)
    ↓
Vercel Cron (Every 5 minutes)
    ↓
System Status Checks:
    ├── Appwrite Connection
    ├── Database Collections
    ├── External API Status
    └── KV Storage Health
    ↓
Synthetic Monitoring (/api/cron/synthetic-monitoring)
    ↓
Comprehensive Testing (Every 10 minutes):
    ├── Critical Page Loading
    ├── API Endpoint Response Times
    ├── Database Query Performance
    └── End-to-End User Flows
    ↓
Alert Generation & Storage (KV)
    ↓
Monitoring Dashboard (/api/monitoring/dashboard)
```

#### Contract Testing & Schema Validation
```
Schema Enforcer (core/validation/schema-enforcer.ts)
    ↓
Repository-Level Validation:
    ├── Create Operations
    ├── Update Operations
    ├── Bulk Import Validation
    └── Data Transformation
    ↓
Contract Tests (tests/schema.contract.test.ts)
    ↓
Automated Schema Compliance:
    ├── Collection Existence
    ├── Attribute Type Validation
    ├── Index Performance
    └── Relationship Integrity
    ↓
Infrastructure Tests (tests/infrastructure.contract.test.ts)
    ↓
Production Infrastructure Validation:
    ├── Permission Systems
    ├── Performance Indexes
    ├── Storage Buckets
    └── Serverless Functions
```

#### Test Isolation & Reliability
```
MSW (Mock Service Worker)
    ↓
API Mocking Infrastructure:
    ├── Appwrite Database Operations
    ├── External API Responses (CFBD, ESPN)
    ├── Error Simulation & Testing
    └── Performance Testing
    ↓
Realistic Mock Data Generators
    ↓
Isolated Unit & Integration Tests
    ↓
Playwright Smoke Tests (30-second regression detection)
    ↓
Post-Deploy Automation:
    ├── Critical Path Validation
    ├── Performance Budget Checks
    ├── Mobile Responsiveness
    └── Error Handling Verification
```

### Data Quality Assurance
- **Schema Validation**: Zod-first validation with runtime enforcement
- **Data Integrity Tests**: Automated contract test suite with drift detection
- **Manual Verification**: Admin dashboard for data review
- **✅ Schema Enforcer**: Automatic data transformation and validation at repository level
- **✅ Contract Tests**: Prevent schema drift with automated compliance testing
- **✅ MSW Isolation**: Eliminate flaky network dependencies in tests

## Development Tools & Testing

### **✅ ENHANCED: Data Flow Testing (August 17, 2025)**
```
Schema & Infrastructure Testing:
├── scripts/sync-appwrite-simple.ts ✅ (Basic schema sync)
├── scripts/sync-appwrite-complete.ts ✅ (Full infrastructure sync)
├── scripts/validate-schema-compliance.ts ✅ (Compliance validation)
├── tests/schema.contract.test.ts ✅ (Schema drift protection)
└── tests/infrastructure.contract.test.ts ✅ (Infrastructure validation)

Test Isolation & Reliability:
├── tests/mocks/msw-setup.ts ✅ (API mocking infrastructure)
├── tests/mocks/mock-data.ts ✅ (Realistic data generators)
└── tests/setup.ts ✅ (Test environment configuration)

Smoke Testing & Regression Detection:
├── tests/smoke/smoke.spec.ts ✅ (30-second critical path tests)
├── tests/smoke/playwright.config.ts ✅ (Browser testing config)
└── .github/workflows/post-deploy-smoke.yml ✅ (Automated post-deploy testing)

Legacy Test Coverage:
├── Unit Tests: Individual functions (MSW-isolated)
├── Integration Tests: API endpoints (Contract-tested)
├── E2E Tests: Complete user workflows (Playwright smoke tests)
└── Load Tests: High concurrent usage (Performance budgets)

Test Commands:
├── npm run test:schema ✅ (Schema contract tests)
├── npm run test:infrastructure ✅ (Infrastructure contract tests)  
├── npm run test:contracts ✅ (All contract tests)
├── npm run test:smoke ✅ (Playwright smoke tests)
└── npm run test:smoke:ci ✅ (CI-optimized smoke tests)
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

## 📋 Comprehensive System Summary

The College Football Fantasy App now implements an **enterprise-grade data flow architecture** with comprehensive monitoring, testing, and validation infrastructure:

### 🏗️ Core Data Infrastructure
1. **User Management**: Secure authentication and profile management with Appwrite
2. **League Operations**: Creation, search, and join functionality (schema-validated)
3. **Draft Systems**: Both snake and auction formats with real-time WebSocket updates
4. **Player Data**: Comprehensive college football database with eligibility validation
5. **Live Scoring**: Real-time game tracking with AP Top-25 and conference rules
6. **Performance**: Compound database indexes and multi-level caching strategies
7. **Security**: Multi-layer protection, input validation, and role-based permissions

### 🔥 NEW: Enterprise Monitoring & Testing (August 17, 2025)
8. **Synthetic Monitoring**: 
   - Vercel Cron health checks every 5 minutes
   - Comprehensive system testing every 10 minutes
   - Real-time alerting with KV storage and dashboard
   - Performance SLA monitoring and degradation detection

9. **Contract Testing & Schema Validation**:
   - Zod-first schema validation with runtime enforcement
   - Automated schema drift protection via contract tests
   - Repository-level data transformation and validation
   - Infrastructure compliance testing for permissions, indexes, functions

10. **Test Isolation & Reliability**:
    - MSW (Mock Service Worker) eliminates flaky network dependencies
    - Realistic mock data generators for consistent testing
    - Comprehensive API mocking for Appwrite and external services
    - Error simulation and performance testing capabilities

11. **Regression Detection**:
    - 30-second Playwright smoke tests for critical paths
    - Post-deploy automation via GitHub Actions
    - Performance budget validation and mobile responsiveness
    - Cross-browser testing (Desktop Chrome + Mobile Chrome)

12. **Production Infrastructure**:
    - Complete Appwrite schema with permissions, indexes, functions, storage
    - Role-based access control with ownership and membership rules
    - Performance-optimized compound indexes for complex queries
    - Serverless functions for data sync and real-time calculations

**Recent Improvements (August 2025):**
- ✅ Fixed join league database schema issues
- ✅ Updated max teams to 24 for college football  
- ✅ Implemented proper public/private league logic
- ✅ All critical data flows tested and verified

**✅ PROJECTIONS MIGRATION COMPLETED (August 17, 2025):**
- 🔄 **Enhanced Projections System**: Migrated from legacy to on-demand calculation with depth chart logic
- 🏈 **QB Differentiation**: Starters now show ~340 points, backups ~85 points (vs previous similar values)
- 🗑️ **Legacy Code Removal**: Eliminated 7 files including 760-line projections.service.ts to prevent confusion
- 🛠️ **DJ Lagway Depth Chart Fix**: Created depth chart infrastructure, made DJ Lagway Florida's starting QB
- 📊 **Field Priority System**: fantasy_points > calculated > legacy to ensure data accuracy
- ❌ **Deprecated Endpoints**: /api/projections returns HTTP 410 Gone with migration guidance
- 🚀 **Production Deployment**: Successfully deployed enhanced system with fresh Vercel cache
- 🔍 **Database Schema**: Enhanced college_players and added model_inputs collection for depth chart data

**✅ MAJOR INFRASTRUCTURE UPGRADE (August 17, 2025):**
- 🔥 **Synthetic Monitoring**: Vercel Cron health checks every 5 minutes with comprehensive system monitoring
- 🛡️ **Contract Testing**: Schema drift protection with automated compliance validation 
- 🎭 **MSW Test Isolation**: Eliminated flaky network dependencies with comprehensive API mocking
- 🎪 **Playwright Smoke Tests**: 30-second regression detection with post-deploy automation
- 🏗️ **Complete Infrastructure Schema**: Production-ready permissions, indexes, functions, and storage
- 📊 **Monitoring Dashboard**: Real-time system health with KV-stored metrics and alerting
- 🔒 **Schema Enforcer**: Repository-level validation with automatic data transformation
- 🚀 **GitHub Actions Integration**: Automated post-deploy testing and monitoring

### 🎯 Architecture Benefits

This enhanced architecture now provides:

- **🔒 Bulletproof Data Integrity**: Schema-first validation prevents data inconsistencies
- **📊 Enterprise-Grade Monitoring**: Real-time health tracking with proactive alerting
- **🎪 Zero-Downtime Reliability**: Comprehensive testing catches regressions before users
- **⚡ Performance Optimization**: Compound indexes and intelligent caching for fast queries
- **🛡️ Production Readiness**: Complete infrastructure automation and validation
- **🚀 Developer Velocity**: MSW isolation and contract testing enable confident deployments
- **📈 Scalable Foundation**: Robust infrastructure supports growing user base
- **🎭 Testing Confidence**: Multi-layered testing prevents production issues

### 🔗 Key Integration Points

**Data Flow**: External APIs → Schema Validation → Appwrite → Enhanced Projections (On-Demand) → Repository Layer → Frontend → User Actions → Monitoring → Alerts

**Testing Flow**: Code Changes → Contract Tests → MSW Isolation → Playwright Smoke Tests → Production Monitoring → Health Dashboard

**Monitoring Flow**: Vercel Cron → Health Checks → Synthetic Testing → KV Storage → Dashboard → Alerts → Team Notifications

This architecture supports the unique requirements of college football fantasy sports while providing enterprise-grade reliability, comprehensive monitoring, and bulletproof data integrity for a scalable, production-ready platform.