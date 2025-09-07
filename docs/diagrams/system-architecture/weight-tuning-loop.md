# Weight Tuning Loop

## Overview
Iterative process to optimize projection weights using historical data and performance metrics.

## Flowchart

```mermaid
flowchart TD
    Start([Start Tuning]) --> ChooseVersion[Choose Version]
    ChooseVersion --> InitWeights[Initialize Weights]
    
    InitWeights --> RunPipeline[Run Pipeline]
    RunPipeline --> Evaluate[Evaluate Performance]
    
    Evaluate --> CalcMetrics[Calculate Metrics]
    
    subgraph "Evaluation Metrics"
        CalcMetrics --> MAE[MAE<br/>Mean Absolute Error]
        CalcMetrics --> MAPE[MAPE<br/>Mean Absolute % Error]
        CalcMetrics --> SPEAR[Spearman Rank<br/>Correlation]
        CalcMetrics --> CAL[Calibration<br/>Plots]
    end
    
    MAE --> CheckTarget{Target Met?}
    MAPE --> CheckTarget
    SPEAR --> CheckTarget
    CAL --> CheckTarget
    
    CheckTarget -->|No| AdjustWeights[Adjust Weights]
    CheckTarget -->|Yes| SaveBest[Save Best Weights]
    
    AdjustWeights --> SearchMethod{Search Method}
    
    SearchMethod -->|Grid| GridSearch[Grid Search<br/>Systematic]
    SearchMethod -->|Random| RandomSearch[Random Search<br/>Monte Carlo]
    SearchMethod -->|Bayesian| BayesOpt[Bayesian<br/>Optimization]
    
    GridSearch --> RunPipeline
    RandomSearch --> RunPipeline
    BayesOpt --> RunPipeline
    
    SaveBest --> WriteVersion[Write model_versions]
    WriteVersion --> WriteMetrics[Write model_runs.metrics]
    WriteMetrics --> RegenerateProj[Regenerate Projections<br/>with Best Weights]
    RegenerateProj --> LockVersion[Lock Version]
    LockVersion --> Finish([Finish])
    
    style Start fill:#e0f2fe
    style Finish fill:#dcfce7
    style CheckTarget fill:#fef3c7
```

## Sequence Diagram

```mermaid
sequenceDiagram
    participant CLI as CLI
    participant Tuner as Tuning Engine
    participant Eval as Evaluator
    participant Search as Search Algorithm
    participant DB as Appwrite
    
    CLI->>Tuner: ops/projections/fit.ts
    Tuner->>Tuner: Initialize weight space
    
    loop Until Convergence
        Tuner->>Tuner: Select weights
        Tuner->>Tuner: Run projections
        
        Tuner->>Eval: Evaluate performance
        Eval->>DB: Load actual outcomes
        DB-->>Eval: Historical data
        
        Eval->>Eval: Calculate MAE
        Eval->>Eval: Calculate MAPE
        Eval->>Eval: Calculate Spearman
        Eval-->>Tuner: Metrics
        
        alt Target Not Met
            Tuner->>Search: Request new weights
            Note over Search: Grid/Random/Bayesian
            Search-->>Tuner: New weight vector
        end
    end
    
    Tuner->>DB: Write model_versions
    Note over DB: Best weights<br/>Performance metrics
    
    Tuner->>DB: Write model_runs
    Note over DB: metrics_json<br/>weights_json
    
    Tuner->>Tuner: Regenerate projections
    Tuner->>DB: Write new projections
    
    Tuner-->>CLI: Best weights found
```

## Weight Configuration

```typescript
interface WeightVector {
  // Static inputs
  depthChartWeight: number      // 0.0 - 1.0
  eaRatingWeight: number        // 0.0 - 1.0
  mockDraftWeight: number       // 0.0 - 1.0
  
  // Historical performance
  lastSeasonWeight: number      // 0.0 - 1.0
  twoSeasonsAgoWeight: number   // 0.0 - 0.5
  threeSeasonsAgoWeight: number // 0.0 - 0.3
  
  // Weekly factors
  recentFormWeight: number      // 0.0 - 1.0
  injuryWeight: number          // -1.0 - 0.0
  weatherWeight: number         // -0.5 - 0.0
  sosWeight: number             // -0.5 - 0.5
  
  // Position adjustments
  qbVolatility: number          // 0.8 - 1.2
  rbVolatility: number          // 0.7 - 1.3
  wrVolatility: number          // 0.6 - 1.4
  teVolatility: number          // 0.5 - 1.5
  kVolatility: number           // 0.9 - 1.1
}
```

## Search Strategies (Summary)

- Grid Search: systematic parameter sweep
- Random Search: Monte Carlo sampling of weight space
- Bayesian Optimization: model-based search (e.g., GP with EI/UCB/POI)

Tip: keep per-iteration artifacts (weights, metrics) in-memory; persist only the best vector and run metrics.

## Evaluation Metrics

```typescript
interface EvaluationMetrics {
  mae: number           // Mean Absolute Error
  mape: number          // Mean Absolute Percentage Error
  rmse: number          // Root Mean Square Error
  spearman: number      // Spearman Rank Correlation
  calibration: {
    bins: number[]      // Calibration plot bins
    expected: number[]  // Expected values per bin
    actual: number[]    // Actual values per bin
  }
  topNAccuracy: {
    top10: number       // % correct in top 10
    top25: number       // % correct in top 25
    top50: number       // % correct in top 50
  }
}

async function evaluate(
  predictions: Projection[],
  actuals: ActualResult[]
): Promise<EvaluationMetrics> {
  const paired = pairPredictionsWithActuals(predictions, actuals)
  
  return {
    mae: calculateMAE(paired),
    mape: calculateMAPE(paired),
    rmse: calculateRMSE(paired),
    spearman: calculateSpearmanRank(paired),
    calibration: calculateCalibration(paired),
    topNAccuracy: calculateTopNAccuracy(paired)
  }
}
```

## Target Metrics

| Metric | Excellent | Good | Acceptable |
|--------|-----------|------|------------|
| MAE | < 2.0 pts | < 3.5 pts | < 5.0 pts |
| MAPE | < 15% | < 25% | < 35% |
| Spearman | > 0.75 | > 0.65 | > 0.55 |
| Top 10 Accuracy | > 70% | > 60% | > 50% |

## CLI Implementation

```typescript
// ops/projections/fit.ts
async function fit(options: {
  method: 'grid' | 'random' | 'bayesian'
  maxIterations: number
  targetMAE: number
  validationWeeks: number[]
}) {
  console.log('Starting weight tuning...')
  
  const evaluator = async (weights: WeightVector) => {
    // Run projections with these weights
    const projections = await runProjectionsWithWeights(weights)
    
    // Load actual results for validation weeks
    const actuals = await loadActualResults(options.validationWeeks)
    
    // Calculate metrics
    return evaluate(projections, actuals)
  }
  
  let best
  switch (options.method) {
    case 'grid':
      best = await gridSearch({ evaluator, ... })
      break
    case 'random':
      best = await randomSearch({ evaluator, ... })
      break
    case 'bayesian':
      best = await bayesianOptimization({ evaluator, ... })
      break
  }
  
  // Save best weights
  await saveModelVersion({
    weights: best.weights,
    metrics: best.metrics,
    method: options.method
  })
  
  console.log('Best weights found:')
  console.log('MAE:', best.metrics.mae)
  console.log('MAPE:', best.metrics.mape)
  console.log('Spearman:', best.metrics.spearman)
}
```

See also:
- docs/diagrams/project-map/overview/projections.md
- docs/diagrams/project-map/api-and-events/projections-apis-and-events.md
