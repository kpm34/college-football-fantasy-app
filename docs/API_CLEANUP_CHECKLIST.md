### API Cleanup Checklist (Aug 24)

Consolidations done
- Unified source for user leagues: `/api/leagues/mine` (dashboard + sidebar)
- Unified members source: `/api/leagues/[leagueId]/members`
- Unified commissioner API: `/api/leagues/[leagueId]/commissioner`
- Legacy archived under `ops/archive`:
  - `leagues_[leagueId]_teams_route.ts`
  - `leagues_[leagueId]_update-settings_route.ts` (replaced with forwarder)
  - `app/(dashboard)/league/[leagueId]/commissioner/api-client.tsx`

Temporary forwarders
- `/api/leagues/[leagueId]/update-settings` → forwards to `/api/leagues/[leagueId]/commissioner` (PUT only)

Next steps before permanent deletion
- [ ] Verify League Home settings tab successfully saves (PUT commissioner)
- [ ] Verify Commissioner page still loads members (GET members) and settings (GET commissioner)
- [ ] Grep codebase for any calls to archived endpoints and replace
- [ ] After 1 week of logs without hits to forwarder, delete archived files and forwarder

Notes
- All league-member reads should fetch `league_memberships.display_name` for Manager column.
- All roster reads should use `fantasy_teams` with `league_id` and `owner_client_id`.
