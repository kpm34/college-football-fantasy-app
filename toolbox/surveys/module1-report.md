# Module 1 Audit Report - Projections Collections
**Date**: December 2024  
**Status**: INCOMPLETE ⚠️

## Executive Summary
The projections collections (`projections_yearly` and `projections_weekly`) **exist in the schema but are NOT being used**. Instead, projections are calculated on-demand in `/api/draft/players`, bypassing the intended data flow architecture.

## 🔍 Key Findings

### 1. Collections Status
✅ **Collections Exist**:
- `projections_yearly` - Present in schema
- `projections_weekly` - Present in schema

⚠️ **Missing Fields**:
- **yearly_projections**: Missing `team`, `projection_type`, `stats`, `updated_at`
- **weekly_projections**: Missing `team`, `position`, `projection_type`, `stats`, `model_version`, `updated_at`

⚠️ **Missing Indexes**:
- **yearly_projections**: Missing `(team, position)` index
- **weekly_projections**: Missing `(team, position, week)` index

### 2. Repository Status
**Endpoints Found**:
- `GET /api/projections` - **DEPRECATED** (returns HTTP 410 Gone)
- `GET /api/draft/players` - **ACTIVE** (calculates projections on-demand)
- `GET /api/players/cached` - Alternative endpoint
- `POST /api/admin/model-inputs/backfill` - Admin data management

**Tests**: ❌ No projection tests found

### 3. Current Implementation Reality

#### What's Actually Happening:
```
Raw Data → /api/draft/players (inline calculation) → Draft UI
```

#### What Should Be Happening (Per Architecture):
```
[Sourcing System] → [Projections Algo] → [Projections Collections] → [Draft UI]
    Module 4           Module 2              Module 1            Module 3
```

### 4. Data Population Status
- Collections are **EMPTY** - No data being written to them
- Projections calculated on-demand with depth chart multipliers
- No automated pipeline populating these collections

## 📊 Detailed Analysis

### Collection Schema vs Requirements
| Collection | Required Fields | Existing Fields | Missing Fields |
|------------|----------------|-----------------|----------------|
| projections_yearly | 8 | 4 | 4 (50% missing) |
| projections_weekly | 9 | 3 | 6 (67% missing) |

### Index Coverage
| Collection | Required Indexes | Existing Indexes | Coverage |
|------------|-----------------|------------------|----------|
| projections_yearly | 2 | 1 | 50% |
| projections_weekly | 2 | 1 | 50% |

## 🔴 Critical Issues

1. **Bypassed Data Flow**: The entire projections pipeline is bypassed
2. **No Pre-computation**: Everything calculated on-demand, causing performance issues
3. **No Historical Tracking**: Can't compare projections vs actuals
4. **Missing Evaluation Loop**: Can't improve models without stored projections
5. **Inconsistent Field Names**: Schema expects `player_id` but code uses different naming

## 🟡 Migration Path Required

### From Current State:
```typescript
// /api/draft/players/route.ts (current)
fantasyPoints = calculateProjection(position, rating);
if (depthChart) {
  fantasyPoints *= depthMultiplier(position, rank);
}
```

### To Target State:
```typescript
// Read from pre-populated collections
const projection = await databases.getDocument(
  DATABASE_ID,
  'projections_yearly',
  playerId
);
return projection.fantasy_points_simple;
```

## ✅ Recommendations

### Immediate Actions:
1. **Populate Collections**: Run initial data population to fill `projections_yearly`
2. **Fix Schema**: Add missing fields to match TypeScript interfaces
3. **Add Indexes**: Create missing compound indexes for performance
4. **Create Tests**: Add unit tests for projection calculations

### Architectural Alignment:
1. **Activate Module 4**: Implement sourcing system to populate collections
2. **Refactor Module 2**: Move calculation logic to separate service
3. **Update Module 3**: Point Draft UI to read from collections, not calculate

### Sample Fix Script:
```typescript
// scripts/populate-projections.ts
async function populateProjections() {
  const players = await getPlayers();
  for (const player of players) {
    const projection = calculateProjection(player);
    await databases.createDocument(
      DATABASE_ID,
      'projections_yearly',
      {
        player_id: player.$id,
        season: 2025,
        team: player.team,
        position: player.position,
        projection_type: 'simple',
        stats: projection.stats,
        model_version: 'v1.0',
        fantasy_points_simple: projection.points,
        updated_at: new Date().toISOString()
      }
    );
  }
}
```

## 📈 Impact Assessment

**Current Performance Impact**:
- ⚠️ Every draft board load recalculates all projections
- ⚠️ No caching of complex calculations
- ⚠️ Harrison Bailey incorrectly showing as top QB

**With Proper Implementation**:
- ✅ Instant draft board loading
- ✅ Consistent projections across all users
- ✅ Ability to A/B test projection models
- ✅ Historical accuracy tracking

## Next Steps
1. Run Module 2 audit to examine algorithm implementation
2. Run Module 3 audit to check Draft UI integration
3. Run Module 4 audit to verify sourcing system
4. Create migration plan to activate the proper data flow

---
**Audit completed by**: Module 1 Survey Tool  
**Report location**: `/tmp/projections_collections_report.json`
