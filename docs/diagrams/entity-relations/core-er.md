# Core Data & Entity Relation (Project)

Core collections and relationships across domains.

- Users (clients), league_memberships, leagues
- Drafts: drafts, draft_states, draft_picks, draft_events
- Players: college_players, player_stats, schools, projections
- Teams: fantasy_teams, roster_slots

```mermaid
flowchart LR
  %% Styles for legible headings and spacing
  classDef title fill:#e0f2fe,stroke:#38bdf8,color:#0369a1,rx:8,ry:8
  classDef coll fill:#fff7ed,stroke:#e5d5bf,color:#1f2937,rx:6,ry:6

  subgraph U[Users]
    direction TB
    users[users]:::coll
    memberships[league_memberships]:::coll
  end

  subgraph L[Leagues]
    direction TB
    leagues[leagues]:::coll
  end

  subgraph D[Drafts]
    direction TB
    drafts[drafts]:::coll
    states[draft_states]:::coll
    picks[draft_picks]:::coll
    events[draft_events]:::coll
  end

  subgraph P[Players]
    direction TB
    players[college_players]:::coll
    pstats[player_stats]:::coll
    projections[projections]:::coll
  end

  subgraph T[Teams]
    direction TB
    teams[fantasy_teams]:::coll
    slots[roster_slots]:::coll
  end

  %% Relationships (coarse)
  users --> memberships --> leagues
  leagues --> drafts --> picks
  drafts --> states
  picks --> players
  players --> pstats
  teams --> slots

  %% Title nodes to enhance legibility
  U:::title --- L:::title --- D:::title --- P:::title --- T:::title
```

Keep detailed ER per domain in their domain folders.
