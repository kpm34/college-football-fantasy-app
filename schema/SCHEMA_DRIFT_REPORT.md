# Schema Drift Report

Generated: 2025-09-03T10:03:13.521Z

## Summary
- Live Collections: 29
- Schema Files Updated: ✅
- Registry Updated: ✅

## Collections Status

### activity_log (`activity_log`)
- Attributes: 20
- Indexes: 8
- Document Security: No
- Status: ✅ Synced

### Auctions (`auctions`)
- Attributes: 6
- Indexes: 3
- Document Security: No
- Status: ✅ Synced

### Bids (`bids`)
- Attributes: 11
- Indexes: 3
- Document Security: No
- Status: ✅ Synced

### clients (`clients`)
- Attributes: 6
- Indexes: 2
- Document Security: No
- Status: ✅ Synced

### College Players (`college_players`)
- Attributes: 16
- Indexes: 7
- Document Security: No
- Status: ✅ Synced

### draft_events (`draft_events`)
- Attributes: 8
- Indexes: 2
- Document Security: No
- Status: ✅ Synced

### Draft Picks (`draft_picks`)
- Attributes: 20
- Indexes: 3
- Document Security: No
- Status: ✅ Synced

### Draft States (`draft_states`)
- Attributes: 6
- Indexes: 2
- Document Security: Yes
- Status: ✅ Synced

### drafts (`drafts`)
- Attributes: 22
- Indexes: 2
- Document Security: No
- Status: ✅ Synced

### fantasy_teams (`fantasy_teams`)
- Attributes: 16
- Indexes: 5
- Document Security: No
- Status: ✅ Synced

### Games (`games`)
- Attributes: 16
- Indexes: 5
- Document Security: No
- Status: ✅ Synced

### invites (`invites`)
- Attributes: 9
- Indexes: 2
- Document Security: No
- Status: ✅ Synced

### league_memberships (`league_memberships`)
- Attributes: 7
- Indexes: 3
- Document Security: No
- Status: ✅ Synced

### Leagues (`leagues`)
- Attributes: 22
- Indexes: 3
- Document Security: No
- Status: ✅ Synced

### Lineups (`lineups`)
- Attributes: 8
- Indexes: 1
- Document Security: No
- Status: ✅ Synced

### Mascot Download Tasks (`mascot_download_tasks`)
- Attributes: 7
- Indexes: 0
- Document Security: No
- Status: ✅ Synced

### Mascot Jobs (`mascot_jobs`)
- Attributes: 19
- Indexes: 0
- Document Security: No
- Status: ✅ Synced

### Mascot Presets (`mascot_presets`)
- Attributes: 11
- Indexes: 0
- Document Security: No
- Status: ✅ Synced

### Matchups (`matchups`)
- Attributes: 10
- Indexes: 1
- Document Security: No
- Status: ✅ Synced

### meshy_jobs (`meshy_jobs`)
- Attributes: 11
- Indexes: 0
- Document Security: No
- Status: ✅ Synced

### Database Migrations (`migrations`)
- Attributes: 6
- Indexes: 1
- Document Security: No
- Status: ✅ Synced

### model_runs (`model_runs`)
- Attributes: 13
- Indexes: 1
- Document Security: No
- Status: ✅ Synced

### Model Versions (`model_versions`)
- Attributes: 11
- Indexes: 4
- Document Security: No
- Status: ✅ Synced

### Player Stats (`player_stats`)
- Attributes: 9
- Indexes: 5
- Document Security: No
- Status: ✅ Synced

### projections (`projections`)
- Attributes: 21
- Indexes: 1
- Document Security: No
- Status: ✅ Synced

### AP Rankings (`rankings`)
- Attributes: 9
- Indexes: 7
- Document Security: No
- Status: ✅ Synced

### roster_slots (`roster_slots`)
- Attributes: 5
- Indexes: 2
- Document Security: No
- Status: ✅ Synced

### schools (`schools`)
- Attributes: 8
- Indexes: 2
- Document Security: No
- Status: ✅ Synced

### Transactions (`transactions`)
- Attributes: 7
- Indexes: 3
- Document Security: No
- Status: ✅ Synced

## ⚠️ Extra in appwrite-generated.ts
These collections are in constants but not in live:
- AP Rankings
- Auctions
- Bids
- College Players
- Database Migrations
- Draft States
- Games
- Leagues
- Lineups
- Matchups
- Model Versions
- Player Stats
- Transactions

## Recommendations
1. ✅ All collections present in constants
2. Review and remove obsolete collection references
3. ✅ Schema files are now synchronized with live database
4. ✅ Type definitions are up to date

## Next Steps
- Run `npm run typecheck` to verify TypeScript compilation
- Review any breaking changes in collection schemas
- Update application code if schema changes affect functionality
