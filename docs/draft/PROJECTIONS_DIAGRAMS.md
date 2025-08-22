# CFB Fantasy — Updated Projections System (January 2025)

## System Overview

```mermaid
flowchart TB
    subgraph "Data Sources"
        CFBD[CFBD API]
        EA[EA Ratings Files]
        DC[Depth Charts]
        NFL[2026 NFL Mock Draft]
        MO[Manual Overrides]
    end
    
    subgraph "Data Processing"
        NORM[Team Name Normalizer]
        INGEST[Data Ingestion Layer]
        CACHE[Model Inputs Collection]
    end
    
    subgraph "Projection Engine"
        BUILD[Build Talent Profiles]
        CALC[Calculate Projections]
        MULT[Apply Multipliers]
    end
    
    subgraph "Output"
        DB[Appwrite DB]
        API[Draft API]
        UI[Draft UI]
    end
    
    CFBD --> INGEST
    EA --> NORM
    DC --> NORM
    NFL --> INGEST
    MO --> INGEST
    
    NORM --> INGEST
    INGEST --> CACHE
    CACHE --> BUILD
    BUILD --> CALC
    CALC --> MULT
    MULT --> DB
    DB --> API
    API --> UI
```

## Data Ingestion Pipeline

```mermaid
sequenceDiagram
    participant CLI as CLI/Script
    participant FS as File System
    participant NORM as Team Normalizer
    participant DB as Appwrite
    participant LOG as Logger
    
    CLI->>FS: Load EA Ratings (CSV/JSON)
    CLI->>FS: Load Depth Charts
    CLI->>FS: Load NFL Mock Draft
    CLI->>FS: Load Manual Overrides
    
    FS->>NORM: Normalize team names
    Note over NORM: Maps variations like<br/>"Ohio State Buckeyes"<br/>to "Ohio State"
    
    NORM->>DB: Check model_inputs collection
    alt Data exists in DB
        DB-->>CLI: Return existing data
    else Data missing
        CLI->>DB: Store in model_inputs
    end
    
    CLI->>LOG: Write missing inputs report
    Note over LOG: exports/missing_inputs_report_2025.json
```

## Enhanced Projection Algorithm

```mermaid
flowchart TD
    START[Start Projection Run] --> LOAD[Load All Data Sources]
    
    LOAD --> CHECK{Check Each<br/>Data Source}
    
    CHECK --> EA_CHECK{EA Ratings<br/>Found?}
    EA_CHECK -->|Yes| EA_APPLY[Apply EA Multiplier]
    EA_CHECK -->|No| EA_DEFAULT[Use Base Rating]
    
    CHECK --> DC_CHECK{Depth Chart<br/>Found?}
    DC_CHECK -->|Yes| DC_APPLY[Apply Depth Multiplier]
    DC_CHECK -->|No| DC_FALLBACK[Search by Name Only]
    
    DC_FALLBACK --> DC_FOUND{Found in<br/>Any Team?}
    DC_FOUND -->|Yes| DC_APPLY
    DC_FOUND -->|No| DC_ESTIMATE[Estimate from Position]
    
    CHECK --> NFL_CHECK{NFL Draft<br/>Data?}
    NFL_CHECK -->|Yes| NFL_APPLY[Apply Draft Capital]
    NFL_CHECK -->|No| NFL_SKIP[Skip Draft Bonus]
    
    EA_APPLY --> TALENT[Calculate Talent Multiplier]
    EA_DEFAULT --> TALENT
    DC_APPLY --> TALENT
    DC_ESTIMATE --> TALENT
    NFL_APPLY --> TALENT
    NFL_SKIP --> TALENT
    
    TALENT --> OVERRIDE{Manual<br/>Override?}
    OVERRIDE -->|Yes| APPLY_OVERRIDE[Apply Override Values]
    OVERRIDE -->|No| USE_CALC[Use Calculated Values]
    
    APPLY_OVERRIDE --> STATS[Generate Statline]
    USE_CALC --> STATS
    
    STATS --> POINTS[Calculate Fantasy Points]
    POINTS --> SAVE[Save to DB]
```

## Depth Chart Multiplier Logic

```mermaid
flowchart LR
    subgraph "QB Multipliers"
        QB1[QB1: 100%]
        QB2[QB2: 25%]
        QB3[QB3+: 5%]
    end
    
    subgraph "RB Multipliers"
        RB1[RB1: 100%]
        RB2[RB2: 60%]
        RB3[RB3: 40%]
        RB4[RB4: 25%]
        RB5[RB5+: 15%]
    end
    
    subgraph "WR Multipliers"
        WR1[WR1: 100%]
        WR2[WR2: 80%]
        WR3[WR3: 60%]
        WR4[WR4: 35%]
        WR5[WR5+: 20%]
    end
    
    subgraph "TE Multipliers"
        TE1[TE1: 100%]
        TE2[TE2: 35%]
        TE3[TE3+: 15%]
    end
```

## Data Source Priority & Fallback

```mermaid
flowchart TD
    PLAYER[Player to Project] --> DEPTH[Get Depth Rank]
    
    DEPTH --> D1{Manual Override?}
    D1 -->|Yes| USE_MANUAL[Use Override Depth]
    D1 -->|No| D2{Team Match Found?}
    
    D2 -->|Yes| USE_DEPTH[Use Depth Chart Rank]
    D2 -->|No| D3{Name Found<br/>Any Team?}
    
    D3 -->|Yes| USE_FOUND[Use Found Rank]
    D3 -->|No| D4{Has Prior<br/>Fantasy Points?}
    
    D4 -->|Yes > 50| EST[Estimate from Points]
    D4 -->|No or < 50| DEFAULT[Default by Position<br/>QB:2, RB/WR:3, TE:2]
    
    USE_MANUAL --> CONTINUE[Continue to Talent]
    USE_DEPTH --> CONTINUE
    USE_FOUND --> CONTINUE
    EST --> CONTINUE
    DEFAULT --> CONTINUE
```

## Talent Multiplier Calculation

```mermaid
flowchart LR
    subgraph "Input Factors"
        EA[EA Rating<br/>0.90-1.15x]
        NFL[NFL Draft Capital<br/>0.97-1.03x]
        DEPTH[Depth Rank<br/>Variable by Pos]
        MANUAL[Manual Override<br/>Direct Set]
    end
    
    subgraph "Calculation"
        BASE[Base: 1.0x]
        CALC[Combined Multiplier]
    end
    
    subgraph "Output Range"
        MIN[Min: 0.90x]
        MAX[Max: 1.42x]
    end
    
    EA --> CALC
    NFL --> CALC
    DEPTH --> CALC
    MANUAL --> CALC
    BASE --> CALC
    CALC --> MIN
    CALC --> MAX
```

## File Organization Structure

```mermaid
flowchart TD
    ROOT[Project Root]
    
    ROOT --> DATA[data/]
    DATA --> IMPORTS[imports/]
    
    IMPORTS --> EA_DIR[ea/2025/]
    EA_DIR --> EA_FILES[SEC.csv<br/>ACC.csv<br/>Big12.csv<br/>BigTen.csv]
    
    IMPORTS --> DC_DIR[depth-charts-2025/]
    DC_DIR --> DC_FILES[sec_depth_2025.json<br/>acc_depth_2025.json<br/>big12_depth_2025.json<br/>bigten_depth_2025.json]
    
    IMPORTS --> NFL_DIR[2026-consensus/]
    NFL_DIR --> CONSENSUS[consensus_all_real.json]
    
    IMPORTS --> OVERRIDES[manual_overrides_2025.json]
    IMPORTS --> ALIASES[team_aliases_expanded.json]
    
    ROOT --> EXPORTS[exports/]
    EXPORTS --> REPORTS[missing_inputs_report_2025.json<br/>college_players_sync_report.json]
```

## API Query Flow

```mermaid
sequenceDiagram
    participant UI as Draft UI
    participant API as /api/draft/players
    participant SVC as Player Service
    participant DB as Appwrite
    
    UI->>API: GET with filters
    Note over API: Filters: conference,<br/>position, team, search
    
    API->>SVC: buildPlayerQuery()
    
    SVC->>DB: Query college_players
    Note over DB: Uses indexes:<br/>- conference_rankings_idx<br/>- team_depth_chart_idx
    
    DB-->>SVC: Player documents
    
    SVC->>SVC: Apply projections
    Note over SVC: Sort by fantasy_points DESC<br/>or name ASC
    
    SVC-->>API: Enhanced players
    API-->>UI: JSON response
    
    UI->>UI: Render draft board
```

## Troubleshooting Decision Tree

```mermaid
flowchart TD
    ISSUE[Projection Issues] --> TYPE{What's Wrong?}
    
    TYPE -->|Low/Wrong Values| CHECK_DATA[Check Data Sources]
    TYPE -->|Missing Players| CHECK_SYNC[Check Player Sync]
    TYPE -->|Not Updating| CHECK_CACHE[Check Cache/Refresh]
    
    CHECK_DATA --> D1{Depth Chart<br/>Present?}
    D1 -->|No| ADD_DC[Add depth chart file]
    D1 -->|Yes| D2{EA Ratings<br/>Present?}
    
    D2 -->|No| ADD_EA[Add EA ratings file]
    D2 -->|Yes| D3{Team Names<br/>Match?}
    
    D3 -->|No| FIX_NAMES[Update team_aliases.json]
    D3 -->|Yes| CHECK_OVERRIDE[Add manual override]
    
    CHECK_SYNC --> S1{Players in DB?}
    S1 -->|No| RUN_SYNC[Run sync script]
    S1 -->|Yes| CHECK_ELIGIBLE[Check eligible flag]
    
    CHECK_CACHE --> C1{Fresh Run?}
    C1 -->|No| RUN_PROJ[Run projections]
    C1 -->|Yes| CLEAR_CACHE[Clear browser cache]
```

## Key Improvements (January 2025)

### 1. Data Source Integration
- ✅ Unified EA ratings format (one CSV per conference)
- ✅ Standardized depth chart JSON structure
- ✅ 2026 NFL mock draft consensus integration
- ✅ Manual override system for fine-tuning

### 2. Fallback Mechanisms
- ✅ Team name normalization with aliases
- ✅ Depth rank fallback: team → name-only → position default
- ✅ EA ratings fallback: exact → normalized → skip
- ✅ Progressive data loading: DB → files → defaults

### 3. Projection Accuracy
- ✅ Position-specific depth multipliers
- ✅ Talent multiplier range: 0.90x - 1.42x
- ✅ Realistic point ranges:
  - QBs: 230-255 pts
  - RBs: 290-330 pts
  - WRs: 220-240 pts
  - TEs: 140-180 pts

### 4. Performance Optimizations
- ✅ Batch processing (3 teams at a time)
- ✅ Pagination for large queries
- ✅ Indexed database queries
- ✅ Cached model inputs

## Running Projections

```bash
# Run for all Power 4
npx tsx functions/unified-talent-projections/index.ts --season=2025

# Run for specific conference
npx tsx functions/unified-talent-projections/index.ts --season=2025 --conference='SEC'

# Run for specific teams
npx tsx functions/unified-talent-projections/index.ts --season=2025 --teams='Alabama,Georgia,LSU'

# Check specific player
npx tsx ops/common/scripts/check-player-projections.ts --name='Sam Leavitt'
```

## Data File Locations

| Data Type | Location | Format |
|-----------|----------|--------|
| EA Ratings | `data/imports/ea/2025/*.csv` | CSV with columns: Name, Team, Position, Overall, Speed, etc. |
| Depth Charts | `data/imports/depth-charts-2025/*_depth_2025.json` | JSON with team/position structure |
| NFL Consensus | `data/imports/2026-consensus/consensus_all_real.json` | JSON with player rankings |
| Manual Overrides | `data/imports/manual_overrides_2025.json` | JSON with player-specific adjustments |
| Team Aliases | `data/team_aliases_expanded.json` | JSON mapping team name variations |

---

*Last Updated: January 2025*