# Scoring Entity Relation

Collections:

- lineups: fantasyTeamId, season, week, lineup, bench, points, locked
- matchups: leagueId, season, week, homeTeamId, awayTeamId, status
- player_stats: playerId, gameId, week, season, statlineJson, fantasyPoints

Relationships:

- fantasy_teams (1) → (many) lineups
- leagues (1) → (many) matchups
- college_players (1) → (many) player_stats

Eligibility: AP Top-25 or conference games only.

Related: ../overview/scoring.md

```mermaid
erDiagram
  FANTASY_TEAMS ||--o{ LINEUPS : sets
  LEAGUES ||--o{ MATCHUPS : schedules
  COLLEGE_PLAYERS ||--o{ PLAYER_STATS : records
  LINEUPS {
    string fantasyTeamId
    int season
    int week
    json lineup
    json bench
    float points
    boolean locked
  }
  MATCHUPS {
    string leagueId
    int season
    int week
    string homeTeamId
    string awayTeamId
    string status
  }
  PLAYER_STATS {
    string playerId
    string gameId
    int week
    int season
    json statlineJson
    float fantasyPoints
  }
```
