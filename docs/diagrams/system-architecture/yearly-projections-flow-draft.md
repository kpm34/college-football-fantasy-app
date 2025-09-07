# Yearly Projections Flow (Draft)

## Overview
Yearly projections are generated for the draft process, covering the full season performance expectations.

## Flowchart

```mermaid
flowchart TD
    Start([Trigger: Manual/Cron]) --> InitRun[Initialize model_runs]
    InitRun --> LoadStatic[Load Static Inputs]
    
    subgraph "Static Inputs"
        LoadStatic --> DC[Depth Charts<br/>/data/depth-charts/*.json]
        LoadStatic --> EA[EA Ratings<br/>/data/ea-ratings*.json]
        LoadStatic --> MD[Mock Drafts<br/>/data/mock-drafts/*.json]
    end
    
    DC --> LoadHist[Load Historical Stats]
    EA --> LoadHist
    MD --> LoadHist
    
    LoadHist --> FeatEng[Feature Engineering]
    
    subgraph "Feature Pipeline"
        FeatEng --> F1[Depth Chart Rank]
        FeatEng --> F2[EA Speed/Agility]
        FeatEng --> F3[Mock Draft Consensus]
        FeatEng --> F4[3-Year Averages]
        FeatEng --> F5[Career Trajectory]
    end
    
    F1 --> ApplyWeights[Apply Weights<br/>Version: V]
    F2 --> ApplyWeights
    F3 --> ApplyWeights
    F4 --> ApplyWeights
    F5 --> ApplyWeights
    
    ApplyWeights --> ComputeBase[Compute Base<br/>Fantasy Points]
    ComputeBase --> WriteProj[Write Projections]
    
    WriteProj --> UpdateRun[Update model_runs]
    UpdateRun --> Finish([Finish])
    
    subgraph "Persistence"
        WriteProj --> P1[period='yearly']
        WriteProj --> P2[version=V]
        WriteProj --> P3[season=2025]
        UpdateRun --> M1[metrics_json]
        UpdateRun --> M2[weights_json]
    end
    
    style Start fill:#e0f2fe
    style Finish fill:#dcfce7
```

## Sequence Diagram

```mermaid
sequenceDiagram
    participant CLI as CLI/Cron
    participant Runner as Ops Runner
    participant Loaders as Data Loaders
    participant Pipeline as Feature Pipeline
    participant DB as Appwrite
    
    CLI->>Runner: runYearly.ts
    Runner->>DB: Create model_runs entry
    DB-->>Runner: runId
    
    Runner->>Loaders: Load static inputs
    Note over Loaders: Depth charts<br/>EA ratings<br/>Mock drafts
    Loaders-->>Runner: Input data
    
    Runner->>Loaders: Load historical stats
    Loaders->>DB: Query player_stats
    DB-->>Loaders: Historical data
    Loaders-->>Runner: Stats data
    
    Runner->>Pipeline: Process features
    Note over Pipeline: Normalize<br/>Engineer<br/>Validate
    Pipeline-->>Runner: Feature vectors
    
    Runner->>Runner: Apply weights V
    Runner->>Runner: Compute projections
    
    Runner->>DB: Write projections
    Note over DB: period='yearly'<br/>version=V
    
    Runner->>DB: Update model_runs
    Note over DB: metricsJson<br/>weightsJson
    
    Runner-->>CLI: Complete
```

## Data Interactions

| Collection | Operation | Key Fields | Notes |
|------------|-----------|------------|-------|
| model_versions | READ | version, weights, status | Get active weight vector |
| model_runs | WRITE/UPDATE | runId, startedAt, inputsJson, metricsJson, weightsJson | Track run metadata |
| projections | WRITE | playerId, period='yearly', version, season, fantasyPoints, componentsJson | Store yearly projections |
| college_players | READ | playerId, name, position, team | Player base data |
| player_stats | READ | playerId, season, stats | Historical performance |

## Implementation

```typescript
// ops/projections/runYearly.ts
async function runYearlyProjections(options: {
  version: string
  season: number
  dryRun?: boolean
}) {
  // Initialize run
  const runId = await createModelRun({
    type: 'yearly',
    version: options.version,
    season: options.season
  })
  
  try {
    // Load inputs
    const depthCharts = await loadDepthCharts()
    const eaRatings = await loadEaRatings()
    const mockDrafts = await loadMockDraftsAgg()
    const historicalStats = await loadHistoricalStats({
      seasons: [season - 3, season - 2, season - 1]
    })
    
    // Feature engineering
    const features = await engineerFeatures({
      depthCharts,
      eaRatings,
      mockDrafts,
      historicalStats
    })
    
    // Load weights
    const weights = await getModelWeights(options.version)
    
    // Compute projections
    const projections = computeProjections(features, weights)
    
    // Write to database
    if (!options.dryRun) {
      await writeProjections({
        projections,
        period: 'yearly',
        version: options.version,
        season: options.season
      })
    }
    
    // Update run with metrics
    await updateModelRun(runId, {
      status: 'completed',
      metrics: calculateMetrics(projections),
      weights_json: JSON.stringify(weights)
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

## Trigger Schedule

- **Manual**: Via admin dashboard or CLI
- **Cron**: Daily at 3 AM during August (pre-draft season)
- **On-demand**: When new depth charts or ratings available

See also:
- docs/diagrams/project-map/overview/draft.md
- docs/diagrams/project-map/data-and-entity-relation/draft-entity-relation.md
