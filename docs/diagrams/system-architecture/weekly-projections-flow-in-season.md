# Weekly Projections Flow (In-Season)

## Overview
Weekly projections are generated during the season with current context including injuries, weather, and strength of schedule.

## Flowchart

```mermaid
flowchart TD
    Start([Trigger: Cron/Week]) --> InitRun[Initialize model_runs]
    InitRun --> LoadCurrent[Load Current Data]
    
    subgraph "Current Season Inputs"
        LoadCurrent --> CS[Current Stats]
        LoadCurrent --> INJ[Injuries]
        LoadCurrent --> WX[Weather]
        LoadCurrent --> SOS[Strength of Schedule]
    end
    
    CS --> FeatEng[Feature Engineering]
    INJ --> FeatEng
    WX --> FeatEng
    SOS --> FeatEng
    
    subgraph "Weekly Features"
        FeatEng --> WF1[Recent Form<br/>Last 3 games]
        FeatEng --> WF2[Injury Status<br/>Probability to play]
        FeatEng --> WF3[Weather Impact<br/>Wind/Rain/Temp]
        FeatEng --> WF4[Opponent Rank<br/>vs Position]
        FeatEng --> WF5[Home/Away Split]
    end
    
    WF1 --> ApplyWeights[Apply Weights<br/>Version: V]
    WF2 --> ApplyWeights
    WF3 --> ApplyWeights
    WF4 --> ApplyWeights
    WF5 --> ApplyWeights
    
    ApplyWeights --> ComputeBase[Compute Base<br/>Fantasy Points]
    ComputeBase --> LoadLeagues[Load League<br/>Scoring Rules]
    
    LoadLeagues --> ApplyScoring[Apply Scoring<br/>Profiles]
    
    ApplyScoring --> Decision{Storage Option}
    Decision -->|Option A| StoreBase[Store Base Only<br/>Compute on read]
    Decision -->|Option B| StoreAdjusted[Store League-Adjusted<br/>With profile_hash]
    
    StoreBase --> WriteProj[Write Projections]
    StoreAdjusted --> WriteProj
    
    WriteProj --> UpdateRun[Update model_runs]
    UpdateRun --> Finish([Finish])
    
    style Start fill:#e0f2fe
    style Finish fill:#dcfce7
    style Decision fill:#fef3c7
```

## Sequence Diagram

```mermaid
sequenceDiagram
    participant Cron as Cron/CLI
    participant Runner as Ops Runner
    participant APIs as External APIs
    participant Pipeline as Feature Pipeline
    participant Scoring as Scoring Engine
    participant DB as Appwrite
    
    Cron->>Runner: runWeekly.ts
    Runner->>DB: Create model_runs entry
    DB-->>Runner: runId
    
    Runner->>DB: Load current stats
    DB-->>Runner: Player stats (current)
    
    Runner->>APIs: Fetch injuries
    APIs-->>Runner: Injury data
    
    Runner->>APIs: Fetch weather
    APIs-->>Runner: Weather forecasts
    
    Runner->>Runner: Compute SOS
    Note over Runner: Based on schedule<br/>and rankings
    
    Runner->>Pipeline: Process features
    Note over Pipeline: Recent form<br/>Injury impact<br/>Weather adjust
    Pipeline-->>Runner: Feature vectors
    
    Runner->>Runner: Apply weights V
    Runner->>Runner: Compute base points
    
    Runner->>DB: Load league rules
    DB-->>Runner: Scoring profiles
    
    Runner->>Scoring: Apply scoring rules
    Note over Scoring: Generate profile_hash<br/>Compute adjusted
    Scoring-->>Runner: Adjusted projections
    
    alt Option A: Base Only
        Runner->>DB: Write base projections
        Note over DB: Compute league-specific<br/>on read
    else Option B: Pre-computed
        Runner->>DB: Write adjusted projections
        Note over DB: Include profile_hash
    end
    
    Runner->>DB: Update model_runs
    Runner-->>Cron: Complete
```

## Data Interactions

| Collection | Operation | Key Fields | Notes |
|------------|-----------|------------|-------|
| model_runs | WRITE/UPDATE | runId, week, inputsJson, metricsJson | Track weekly run |
| projections | WRITE | playerId, period='weekly', season, week, version, fantasyPoints, componentsJson | Weekly projections |
| leagues | READ | leagueId, scoringRules | Get scoring profiles |
| games | READ | week, homeTeam, awayTeam | Game context |
| player_stats | READ | playerId, season, week | Current season stats |
| rankings | READ | week, team | For SOS calculation |

## Implementation

```typescript
// ops/projections/runWeekly.ts
async function runWeeklyProjections(options: {
  version: string
  season: number
  week: number
  storageOption: 'base' | 'adjusted'
}) {
  const runId = await createModelRun({
    type: 'weekly',
    version: options.version,
    season: options.season,
    week: options.week
  })
  
  try {
    // Load current context
    const currentStats = await loadCurrentStats({
      season: options.season,
      throughWeek: options.week - 1
    })
    
    const injuries = await loadInjuries()
    const weather = await loadWeather({
      week: options.week
    })
    
    const sos = await computeSOS({
      season: options.season,
      week: options.week
    })
    
    // Feature engineering with weekly context
    const features = await engineerWeeklyFeatures({
      currentStats,
      injuries,
      weather,
      sos,
      recentGames: 3
    })
    
    // Apply weights and compute base
    const weights = await getModelWeights(options.version)
    const baseProjections = computeProjections(features, weights)
    
    // Handle scoring overlay
    if (options.storageOption === 'adjusted') {
      const leagues = await getActiveLeagues()
      const projectionRows = []
      
      for (const league of leagues) {
        const profile = getLeagueScoringProfile(league.id)
        const adjusted = applyScoring(baseProjections, profile)
        
        projectionRows.push(...adjusted.map(proj => ({
          ...proj,
          scoring_profile_hash: profile.hash,
          league_id: league.id // optional
        })))
      }
      
      await writeProjections(projectionRows)
    } else {
      // Option A: Store base only
      await writeProjections({
        projections: baseProjections,
        period: 'weekly',
        version: options.version,
        season: options.season,
        week: options.week
      })
    }
    
    await updateModelRun(runId, {
      status: 'completed',
      metrics: calculateWeeklyMetrics(baseProjections)
    })
    
  } catch (error) {
    await updateModelRun(runId, {
      status: 'failed',
      error: error.message
    })
    throw error
  }
}
```

## Weather Impact Calculation

```typescript
interface WeatherImpact {
  temperature: number // -1 to 1
  wind: number // -1 to 1  
  precipitation: number // -1 to 1
}

function calculateWeatherImpact(weather: Weather): WeatherImpact {
  return {
    // Cold weather reduces passing
    temperature: weather.temp < 32 ? -0.2 : 0,
    
    // High wind affects passing/kicking
    wind: weather.windSpeed > 20 ? -0.3 : 
          weather.windSpeed > 15 ? -0.15 : 0,
    
    // Rain/snow reduces all scoring
    precipitation: weather.precip > 0.5 ? -0.25 :
                  weather.precip > 0.2 ? -0.1 : 0
  }
}
```

## Trigger Schedule

- **Cron**: Tuesday 6 AM (after MNF, before waivers)
- **Manual**: Via admin dashboard
- **Event-driven**: On significant injury news

See also:
- docs/diagrams/project-map/overview/projections.md
- docs/diagrams/project-map/user-flow/projections-user-flow.md
