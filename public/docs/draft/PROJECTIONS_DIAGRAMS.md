# CFB Fantasy — Projections Data Flow Diagrams

> Overview diagrams showing: **(1)** data fetching, **(2)** projection computation, **(3)** persistence, and **(4)** frontend rendering, plus a simple troubleshooting flow.

---

## 1) End‑to‑End Pipeline (Bird’s‑Eye View)

```mermaid
flowchart LR
  A[External Sources] --> B[Ingestion]
  B --> C[Projection Engine]
  C --> D[Persistence]
  D --> E[API]
  E --> F[Draft UI]

  subgraph Sources
    S1[CFBD]
    S2[ESPN]
    S3[EA Ratings and Draft]
  end
  S1 --> B
  S2 --> B
  S3 --> B
```

---

## 2) Batch Projection Run — Sequence

```mermaid
sequenceDiagram
  autonumber
  participant CLI as CLI or CRON
  participant ENG as Unified Projections
  participant DB as Appwrite DB
  participant LOG as Run Metrics

  CLI->>ENG: Start job (season and filters)
  ENG->>DB: Read model_inputs and player docs
  loop each player
    ENG->>ENG: Build context depth usage pace talent
    ENG->>ENG: Compute statline -> score points
    ENG->>DB: Update college_players fantasy_points
    ENG->>DB: Upsert projections_yearly and projections_weekly
  end
  ENG->>LOG: Write run metrics and summary
  ENG->>CLI: Return success and counts
```

---

## 3) Draft UI Fetch/Render — Sequence

```mermaid
sequenceDiagram
  autonumber
  participant U as User
  participant UI as Draft UI
  participant API as Players API
  participant SVC as Projections Service
  participant DB as Appwrite DB

  U->>UI: Open draft page
  UI->>API: GET players with filters
  API->>SVC: getPlayers
  SVC->>DB: Query players
  DB-->>SVC: Player documents
  SVC-->>API: Map to DTO
  API-->>UI: JSON list of players
  UI->>UI: Render list
```

### 3.1) API Query Modes & Fallback

```mermaid
flowchart TD
  A[Incoming query params] --> B{Top 200?}
  B -- Yes --> B1[Apply position filter for fantasy positions and cap limit]
  B -- No --> B2[If single position provided apply it]

  A --> C{Conference provided?}
  C -- Yes --> C1[Apply conference filter]
  C -- No --> C2[Default to Power 4 conferences]

  A --> D{Team or school provided?}
  D -- Team --> D1[Filter by team]
  D -- School --> D2[Filter by school]

  A --> E{Search provided?}
  E -- Yes --> E1[Full text search on name]
  E -- No --> E2[Skip]

  A --> F{Order by name?}
  F -- Yes --> F1[Order ascending by name]
  F -- No --> F2[Order by fantasy_points descending]

  G[Primary query] --> H{Success?}
  H -- Yes --> R[Return documents]
  H -- No --> FB[Fallback: reduce filters and keep ordering] --> R
```

Notes:
- top200 mode caps results to 200 and ensures fantasy positions filter is applied.
- Primary query prioritizes projection ordering (`fantasy_points` DESC). Name ordering is supported via `orderBy=name`.
- Fallback reduces filter complexity for non-indexed environments and maintains projection ordering.

---

## 4) Data Model (ER‑style overview)

```mermaid
erDiagram
  COLLEGE_PLAYERS {
    string id PK
    string name
    string position
    string team
    string conference
    string jerseyNumber
    string year
    string height
    string weight
    string depth_chart_order
    string fantasy_points
    string statline_simple
    string updatedAt
  }

  PROJECTIONS_YEARLY {
    string id PK
    string player_id FK
    string season
    string fantasy_points_simple
    string statline_json
    string games_played_est
    string updatedAt
  }

  PROJECTIONS_WEEKLY {
    string id PK
    string player_id FK
    string season
    string week
    string fantasy_points_simple
    string statline_json
    string updatedAt
  }

  MODEL_INPUTS {
    string id PK
    string player_id FK
    string season
    string depth_chart_json
    string team_pace_json
    string pass_rush_rates_json
    string opponent_grades_by_pos_json
    string injury_reports_json
    string vegas_json
    string manual_overrides_json
    string ea_overall
    string ea_speed
    string draft_capital_score
    string notes
    string updatedAt
  }

  COLLEGE_PLAYERS ||--o{ PROJECTIONS_YEARLY : has
  COLLEGE_PLAYERS ||--o{ PROJECTIONS_WEEKLY : has
  COLLEGE_PLAYERS ||--|| MODEL_INPUTS : uses
```

---

### Fields Legend (SSOT‑mapped)

| Collection | Key Fields | Notes |
|---|---|---|
| `college_players` | `$id`, `name`, `position`, `team`, `conference` | Primary projection source: `fantasy_points` DESC for UI ranking |
|  | `fantasy_points` | Calculated by pipeline; used by `/api/draft/players` ordering |
|  | `depth_chart_order` | 1..5, used for depth multipliers and team depth sorting |
|  | `statline_simple` | JSON string (serialized) for simple per‑season statline |
| `projections_yearly` | `$id`, `player_id`, `season`, `fantasy_points_simple`, `statline_json` | Analytics/longitudinal storage; not required for UI list |
| `projections_weekly` | `$id`, `player_id`, `season`, `week`, `fantasy_points_simple`, `statline_json` | Weekly breakdowns; optional for draft list |
| `model_inputs` | `$id`, `season`, `depth_chart_json`, `team_pace_json`, `manual_overrides_json` | Pipeline inputs and overrides staging |

---

## 5) Troubleshooting & Verification Flow

```mermaid
flowchart TD
  A[Draft UI empty?] --> B{Env loaded}
  B -- No --> B1[Fix env and restart]
  B -- Yes --> C{Schema in sync}
  C -- No --> C1[Run schema sync]
  C -- Yes --> D{Projections exist}
  D -- No --> D1[Run projections]
  D -- Yes --> E{API sorted}
  E -- No --> E1[Check filters and order]
  E -- Yes --> F[UI OK]
```

---

### Notes

* **Primary source for the Draft UI** is `college_players.fantasy_points`. Yearly/weekly collections are useful for analytics and comparison but are not required to render the ranked draft list.
* The `model_inputs` collection acts as the staging area for all inputs (depth, usage priors, team pace/efficiency, talent signals). The engine uses it to build per‑player contexts before scoring.
* If projections appear stale, re‑run the batch job, then invalidate any local caches (dev server restart is usually enough).

---

### Indexes used by API queries (for performance)

- college_players.conference_rankings_idx
  - Attributes: `conference`, `position`, `fantasy_points`
  - Order: `ASC`, `ASC`, `DESC`
  - Query patterns: `conference = ? AND position = ? ORDER BY fantasy_points DESC`
  - Usage: high (primary for rankings)

- college_players.team_depth_chart_idx
  - Attributes: `team`, `position`, `depth_chart_order`
  - Order: `ASC`, `ASC`, `ASC`
  - Query patterns: `team = ? AND position = ? ORDER BY depth_chart_order ASC`
  - Usage: medium (depth-chart views and pipeline context)

- Name search uses Appwrite full‑text on `name` as configured (when `Query.search('name', search)` is present).


