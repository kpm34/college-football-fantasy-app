# Data Flow Alignment - Single Source of Truth

**Last Updated:** August 18, 2025  
**Status:** ✅ Aligned and Verified

## Overview

This document defines the canonical data flow for player projections across the entire system, ensuring consistency between Appwrite database, API endpoints, and UI components.

## Pipeline Architecture

```
External Data → Pipeline Scripts → Appwrite Database → API Routes → UI Components
```

### 1. Data Sources & Pipeline

**Primary Script:** `functions/project-yearly-simple/index.ts`
- **Inputs:** Team pace, efficiency, depth charts, usage priors, injury risk, NFL draft capital
- **Output:** Comprehensive fantasy projections stored in `college_players.fantasy_points`
- **Trigger:** `scripts/activate-pipeline-simple.ts`

**Key Data Inputs:**
- `model_inputs.depth_chart_json` - Depth chart positions and rankings
- `model_inputs.usage_priors_json` - Historical snap/rush/target shares
- `model_inputs.team_efficiency_json` - Offensive efficiency Z-scores
- `model_inputs.pace_estimates_json` - Team pace (plays per game)
- `model_inputs.ea_ratings_json` - Injury risk assessments
- `model_inputs.nfl_draft_capital_json` - NFL draft capital scores

### 2. Database Schema (Appwrite)

**Collection:** `college_players`
- **Projection Field:** `fantasy_points` (canonical source)
- **Legacy Field:** `projection` (maintained for compatibility)
- **Updated:** Via pipeline scripts only (never calculated in API)

**Data Flow:**
```
Pipeline → college_players.fantasy_points → API response → UI display
```

### 3. API Endpoints

**Primary Route:** `/api/draft/players`
- **Source:** Reads directly from `college_players.fantasy_points`
- **No Calculation:** API purely serves database values
- **Ordering:** `Query.orderDesc('fantasy_points')` for highest-to-lowest

**Removed Redundant Functions:**
- ~~`calculateBaseProjection()`~~ - Replaced by pipeline
- ~~`calculateProjection()`~~ - Replaced by pipeline  
- ~~`depthMultiplier()`~~ - Now handled in pipeline
- ~~Enhanced projections service~~ - Consolidated into pipeline

### 4. UI Components

**Draft Interface:** `/app/draft/[leagueId]/realtime/page.tsx`
- **Data Source:** `/api/draft/players?limit=10000&orderBy=projection`
- **Display:** Shows `projectedPoints` from API response
- **Ordering:** Highest to lowest projections (pre-sorted by API)

**Projection Showcase:** `/app/projection-showcase/page.tsx`
- **Purpose:** Demonstrates algorithm differentiation between starters and backups
- **Data Source:** Same API endpoint with position filtering
- **Algorithm Inputs Display:** Shows comprehensive data inputs used in projections

### 5. Verification & Testing

**Projection Verification:**
```bash
# Run pipeline to update projections
npm run tsx scripts/activate-pipeline-simple.ts

# Verify top players via API
curl "https://cfbfantasy.app/api/draft/players?limit=10&orderBy=projection"

# Check draft interface displays properly
# Visit: https://cfbfantasy.app/draft/[leagueId]/realtime
```

**Expected Results:**
- QB starters: 300-400 fantasy points
- QB backups: 75-100 fantasy points  
- RB starters: 200-300 fantasy points
- WR/TE starters: 180-250 fantasy points

## Routing Alignment

### ✅ Aligned Components

1. **Pipeline Scripts** → Write to `college_players.fantasy_points`
2. **API Routes** → Read from `college_players.fantasy_points`
3. **UI Components** → Display API projection values
4. **Database** → Single source of truth for all projections

### ✅ Removed Redundancies

1. **Deprecated Services:**
   - `/lib/services/enhanced-projections.service.ts` ❌ REMOVED
   - `/lib/services/projections.service.ts` ❌ REMOVED
   - `/lib/services/weekly-projections-builder.service.ts` ❌ REMOVED

2. **Deprecated API Endpoints:**
   - `/app/api/projections/route.ts` ❌ REMOVED

3. **Redundant Calculation Functions:**
   - `calculateBaseProjection()` in route.ts ❌ REMOVED
   - `depthMultiplier()` in route.ts ❌ REMOVED

## Single Source of Truth Verification

**Database Query:**
```sql
SELECT name, position, team, fantasy_points 
FROM college_players 
WHERE draftable = true 
ORDER BY fantasy_points DESC 
LIMIT 10;
```

**API Response:**
```javascript
GET /api/draft/players?limit=10&orderBy=projection
// Returns same data as database query
```

**UI Display:**
```javascript
// Draft interface shows projectedPoints from API
player.projectedPoints === player.fantasy_points (from DB)
```

## Deployment Pipeline

1. **Update Projections:** `npm run tsx scripts/activate-pipeline-simple.ts`
2. **Deploy to Vercel:** Automatic via Git push
3. **Verify API:** Test `/api/draft/players` endpoint
4. **Verify UI:** Check draft interface shows updated projections
5. **Monitor:** Projection showcase page displays algorithm results

## Recent Fixes (August 18, 2025)

### Commissioner Settings Schema Fix ✅

**Issue:** Commissioner settings were failing to save due to schema mismatch
- **Root Cause:** API endpoints were sending snake_case field names (`max_teams`, `pick_time_seconds`) but Appwrite database expected camelCase (`maxTeams`, `pickTimeSeconds`)
- **Service Worker Cache:** Old cached responses with incorrect field names persisted the issue

**Files Fixed:**
- `/app/api/leagues/[leagueId]/commissioner/route.ts` - Updated field mapping to camelCase
- `/app/api/leagues/[leagueId]/route.ts` - Fixed response to use `league.maxTeams`
- `/app/api/leagues/join/route.ts` - Removed `max_teams` fallback
- `/app/api/leagues/search/route.ts` - Removed `max_teams` fallbacks (4 instances)
- `/app/league/create/page.tsx` - Removed `max_teams` fallback
- `/public/sw.js` - Updated cache version to force refresh

**Result:** Commissioner settings now save successfully in production ✅

---

**Status:** ✅ All routing aligned - single source of truth established  
**Status:** ✅ Commissioner settings schema alignment completed  
**Next:** Regular pipeline updates as season data changes