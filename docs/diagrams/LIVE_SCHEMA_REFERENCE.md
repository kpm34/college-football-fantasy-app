# Live Appwrite Schema Reference

Generated from production Appwrite database
Last Updated: ${new Date().toISOString()}

## Quick Reference

### Collection IDs (Use these in code)

```javascript
const COLLECTIONS = {
  ACTIVITY_LOG: 'activity_log',
  RANKINGS: 'rankings',
  AUCTIONS: 'auctions',
  BIDS: 'bids',
  CLIENTS: 'clients',
  COLLEGE_PLAYERS: 'college_players',
  MIGRATIONS: 'migrations',
  DRAFT_STATES: 'draft_states',
  DRAFT_EVENTS: 'draft_events',
  DRAFTS: 'drafts',
  FANTASY_TEAMS: 'fantasy_teams',
  GAMES: 'games',
  INVITES: 'invites',
  LEAGUE_MEMBERSHIPS: 'league_memberships',
  LEAGUES: 'leagues',
  LINEUPS: 'lineups',
  MATCHUPS: 'matchups',
  MESHY_JOBS: 'meshy_jobs',
  MODEL_VERSIONS: 'model_versions',
  MODEL_RUNS: 'model_runs',
  PLAYER_STATS: 'player_stats',
  PROJECTIONS: 'projections',
  ROSTER_SLOTS: 'roster_slots',
  SCHOOLS: 'schools',
  TRANSACTIONS: 'transactions',
}
```

## Core Collections

### leagues

Primary league configuration

```typescript
{
  leagueName: string;           // Required, max 100
  season: number;                // Required, 2020-2030
  maxTeams?: number;             // 2-32
  leagueStatus?: string;         // max 20
  gameMode?: string;             // max 20
  draftType?: string;            // max 20
  isPublic?: boolean;
  currentTeams?: number;         // max 20
  pickTimeSeconds?: number;      // 30-600
  draftDate?: Date;
  selectedConference?: string;   // max 50
  seasonStartWeek?: number;      // 1-20
  playoffTeams?: number;         // max 20
  playoffStartWeek?: number;     // 1-20
  waiverType?: string;           // max 20
  waiverBudget?: number;         // max 1000
  password?: string;             // max 50
  commissionerAuthUserId?: string; // max 64
  scoringRules?: string;         // max 65535
  draftOrder?: string;           // max 65535 (deprecated)
  phase?: string;                // max 16, default: 'scheduled'
  engineVersion?: string;        // max 3, default: 'v2'
}
```

### college_players

Player pool for drafting

```typescript
{
  name: string;                  // Required, max 100
  position: string;              // Required, max 10
  team: string;                  // Required, max 50
  conference: string;            // Required, max 20
  year?: string;                 // max 10
  jerseyNumber?: number;         // max 99
  height?: string;               // max 10
  weight?: number;               // 150-400
  eligible?: boolean;
  fantasyPoints?: number;
  seasonFantasyPoints?: number;
  depthChartOrder?: number;
  schoolId: string;              // Required, max 64
  classYear?: string;            // max 16
  cfbdId?: string;               // max 32
  espnId?: string;               // max 32
}
```

### fantasy_teams

User teams within leagues

```typescript
{
  leagueId: string;              // Required, max 64
  teamName: string;              // Required, max 128
  abbrev?: string;               // max 8
  logoUrl?: string;              // max 512
  wins?: number;                 // max 25
  losses?: number;               // max 25
  ties?: number;
  pointsFor?: number;
  pointsAgainst?: number;
  draftPosition?: number;
  auctionBudgetTotal?: number;
  auctionBudgetRemaining?: number;
  displayName?: string;          // max 255
  ownerAuthUserId?: string;      // max 64
  leagueName?: string;           // max 100
  players?: string;              // max 64
}
```

### drafts

Draft configuration and state

```typescript
{
  leagueId?: string;             // max 100
  draftStatus?: string;          // max 100
  currentRound?: number;
  currentPick?: number;
  maxRounds?: number;
  draftOrder?: string;           // max 100
  startTime?: Date;
  endTime?: Date;
  type?: string;                 // max 16
  clockSeconds?: number;
  orderJson?: string;            // max 8192
  isMock?: boolean;
  leagueName?: string;           // max 255
  gameMode?: string;             // max 50
  selectedConference?: string;   // max 50
  maxTeams?: number;             // 4-24
  scoringRules?: string;         // max 65535
  stateJson?: string;            // max 1000000
  eventsJson?: string;           // max 1000000
  picksJson?: string;            // max 1000000
  onTheClock?: string;           // max 255
  lastPickTime?: Date;
}
```

### draft_states

Real-time draft state (Document Security ENABLED)

```typescript
{
  draftId: string;               // Required, max 255
  onClockTeamId: string;         // Required, max 255
  deadlineAt?: Date;
  round: number;                 // Required
  pickIndex: number;             // Required
  draftStatus?: string;          // default: 'pre-draft'
}
```

### draft_events

Draft event log

```typescript
{
  draftId: string;               // Required, max 64
  type: string;                  // Required, max 24
  round?: number;
  overall?: number;
  fantasyTeamId?: string;        // max 64
  playerId?: string;             // max 64
  ts?: Date;
  payloadJson?: string;          // max 8192
}
```

### roster_slots

Links teams to players

```typescript
{
  fantasyTeamId: string;         // Required, max 64
  playerId: string;              // Required, max 64
  position: string;              // Required, max 8
  acquiredVia?: string;          // max 16
  acquiredAt?: Date;
}
```

## Supporting Collections

### games

NCAA game schedule

```typescript
{
  week: number;                  // Required, 1-20
  season: number;                // Required, 2020-2030
  seasonType: string;            // Required, max 20
  date: Date;                    // Required (deprecated, use kickoffAt)
  homeTeam: string;              // Required, max 50
  awayTeam: string;              // Required, max 50
  homeScore?: number;            // max 200
  awayScore?: number;            // max 200
  status?: string;               // max 20
  eligible?: boolean;            // (deprecated, use eligibleGame)
  startDate: Date;               // Required (deprecated, use kickoffAt)
  completed: boolean;            // Required
  eligibleGame: boolean;         // Required
  homeSchoolId: string;          // Required, max 64
  awaySchoolId: string;          // Required, max 64
  kickoffAt: Date;               // Required
}
```

### schools

Team information

```typescript
{
  name: string;                  // Required, max 128
  conference: string;            // Required, max 16
  slug?: string;                 // max 64, unique
  abbreviation?: string;         // max 16
  logoUrl?: string;              // max 512
  primaryColor?: string;         // max 16
  secondaryColor?: string;       // max 16
  mascot?: string;               // max 64
}
```

### rankings

AP Top 25 rankings

```typescript
{
  week: number;                  // Required
  season: number;                // Required
  pollType: string;              // Required, max 20
  team: string;                  // Required, max 50
  rank: number;                  // Required
  points?: number;
  firstPlaceVotes?: number;
  source: string;                // Required, max 24
  schoolId: string;              // Required, max 64
}
```

### player_stats

Player performance data

```typescript
{
  playerId: string;              // Required, max 50
  gameId: string;                // Required, max 50
  week: number;                  // Required, 1-20
  season: number;                // Required, 2020-2030
  stats: string;                 // Required, max 2000
  opponent?: string;             // max 50
  eligible?: boolean;            // default: true
  fantasyPoints?: number;
  statlineJson?: string;         // max 65535
}
```

## Index Reference

### Performance-Critical Indexes

#### leagues

- `status_idx`: [leagueStatus]
- `public_idx`: [isPublic]
- `season_idx`: [season]

#### college_players

- `position_idx`: [position]
- `team_idx`: [team]
- `points_idx`: [fantasyPoints]
- `name_search`: [name] (FULLTEXT)
- `school_idx`: [schoolId]

#### fantasy_teams

- `league_owner_unique_idx`: [leagueId, ownerAuthUserId] (UNIQUE)
- `league_idx`: [leagueId]
- `owner_idx`: [ownerAuthUserId]

#### draft_states

- `draft_unique_idx`: [draftId] (UNIQUE)
- `deadline_scan_idx`: [draftStatus, deadlineAt]

#### draft_events

- `by_overall`: [draftId, overall]
- `by_ts`: [draftId, ts]

## Migration Notes

### Deprecated Fields (Still Present)

- `games.date` → Use `games.kickoffAt`
- `games.startDate` → Use `games.kickoffAt`
- `games.eligible` → Use `games.eligibleGame`
- `leagues.draftOrder` → Use `drafts.orderJson`

### Renamed Collections

- ~~`rosters`~~ → `roster_slots`
- ~~`user_teams`~~ → `fantasy_teams`
- ~~`players`~~ → `college_players`

### Key Differences from Old Schema

1. All string fields have explicit size limits
2. Integer fields use full int64 range unless constrained
3. Document Security only enabled on `draft_states`
4. Many fields are optional that were previously required
5. New fields added for enhanced functionality

## Usage Examples

### Fetching a League with Teams

```javascript
const league = await databases.getDocument(DATABASE_ID, COLLECTIONS.LEAGUES, leagueId)

const teams = await databases.listDocuments(DATABASE_ID, COLLECTIONS.FANTASY_TEAMS, [
  Query.equal('leagueId', leagueId),
])
```

### Creating a Draft Pick

```javascript
// 1. Create draft event
await databases.createDocument(DATABASE_ID, COLLECTIONS.DRAFT_EVENTS, ID.unique(), {
  draftId,
  type: 'pick',
  round: currentRound,
  overall: pickNumber,
  fantasyTeamId: teamId,
  playerId: selectedPlayerId,
  ts: new Date(),
  payloadJson: JSON.stringify({ source: 'user' }),
})

// 2. Update draft state
await databases.updateDocument(DATABASE_ID, COLLECTIONS.DRAFT_STATES, draftId, {
  onClockTeamId: nextTeamId,
  round: nextRound,
  pickIndex: nextPickIndex,
  deadlineAt: new Date(Date.now() + clockSeconds * 1000),
})

// 3. If not mock, add to roster
if (!isMock) {
  await databases.createDocument(DATABASE_ID, COLLECTIONS.ROSTER_SLOTS, ID.unique(), {
    fantasyTeamId: teamId,
    playerId: selectedPlayerId,
    position: playerPosition,
    acquiredVia: 'draft',
    acquiredAt: new Date(),
  })
}
```
