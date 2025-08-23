# Ops Attic

This directory contains archived scripts and files from the schema migration completed on Aug 23, 2025.

## Migration Scripts (`migration-scripts/`)

Single-use scripts that were used to migrate from the old 42-collection schema to the new 24-collection schema:

### Data Migration Scripts
- `migrate_teams_to_schools.ts` - Migrated teams → schools collection
- `rewrite_college_players_team_fk.ts` - Updated foreign keys in college_players
- `rename_users_to_clients.ts` - Renamed users → clients
- `rename_user_teams_to_fantasy_teams.ts` - Renamed user_teams → fantasy_teams
- `merge_draft_picks_and_mock_picks_to_draft_events.ts` - Consolidated draft picks
- `merge_auction_bids_to_bids.ts` - Consolidated auction bids
- `merge_scores_to_matchups.ts` - Merged scores into matchups
- `consolidate_projections.ts` - Unified all projection tables
- `projection_runs_to_model_runs.ts` - Renamed and consolidated model runs
- `add_roster_slots_from_user_teams.ts` - Created roster_slots collection
- `lineups_rosterid_to_fantasy_team_id.ts` - Updated field names

### Utility Scripts
- `check_*.ts` - Various validation and debugging scripts
- `debug_*.ts` - Debug versions of migration scripts
- `fix_*.ts` - Data correction scripts
- `sync_*.ts` - Synchronization scripts
- `recreate_*.ts` - Collection recreation scripts
- `drop_*.ts` - Collection deletion scripts
- `export_*.ts` - Data export scripts

## Old Schemas (`old-schemas/`)

Historical schema files from before the consolidation:

- `schema_mapping.json` - Old-to-new collection mapping (42 → 24)
- `target_schema_registry.json` - Target schema definitions
- `appwrite-current-schema.json` - Snapshot of schema before cleanup
- `Schema Table.csv` - Original schema documentation

## Note

These files are preserved for historical reference but are no longer used in production.
The current schema uses 25 collections (24 core + 1 migrations tracking) with snake_case naming throughout.
