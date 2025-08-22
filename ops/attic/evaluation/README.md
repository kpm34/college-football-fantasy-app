# Projection Evaluation System

## Overview

The Projection Evaluation System provides comprehensive analysis of your fantasy football projection model performance. It implements the evaluation framework with:

- **Target Metric**: MAE (Mean Absolute Error) for fantasy points predictions
- **Position-Tier Analysis**: Performance breakdown by fantasy tiers (Top-12 QB, Top-24 RB, etc.)
- **Calibration Analysis**: How well predicted values match actual outcomes
- **Comprehensive Reporting**: Markdown, JSON, and Parquet output formats

## Quick Start

### Basic Evaluation

Evaluate model performance over a specific week range:

```bash
npm run eval_proj -- --weeks 2024W1-2024W14 --out reports/season_eval.md
```

### Position-Specific Analysis

Focus on skill positions with detailed analysis:

```bash
npm run eval_proj -- --weeks 2024W10-2024W14 --positions QB,RB,WR --out reports/skill_positions.md --calibration --time-series
```

### Multiple Output Formats

Generate reports in multiple formats for deeper analysis:

```bash
npm run eval_proj -- --weeks 2024W1-2024W14 --format markdown,json,parquet --out reports/full_analysis
```

## Command Line Interface

```bash
Usage: eval_proj [options]

Evaluate projection model performance

Options:
  -V, --version              output the version number
  --weeks <range>            Week range (e.g., 2023W1-2024W14)
  --out <path>               Output file path
  --positions <list>         Comma-separated positions (e.g., QB,RB,WR). Default: all positions
  --format <formats>         Output formats: markdown,json,parquet (default: markdown)
  --league-id <id>           League ID for scoring rules (uses default PPR if not specified)
  --calibration              Include calibration analysis
  --time-series              Include time series analysis
  --min-tier-size <n>        Minimum players per tier for analysis (default: 3)
  -h, --help                 display help for this command
```

## Key Metrics

### Primary Metrics
- **MAE (Mean Absolute Error)**: Average prediction error in fantasy points
- **sMAPE (Symmetric Mean Absolute Percentage Error)**: Percentage error accounting for scale
- **R² (R-squared)**: Correlation strength between predicted and actual values
- **RMSE (Root Mean Squared Error)**: Prediction variability

### Fantasy Tier Analysis
- **Top-12**: Elite tier players (QB1-12, RB1-12, WR1-12, TE1-12)
- **Mid-tier**: Startable players (QB13-24, RB13-24, WR13-24, etc.)
- **Deep tiers**: Bench/streaming options (RB25-36, WR25-48, etc.)
- **Others**: Deep sleepers and handcuffs

### Acceptance Criteria
- **Target**: Beat current model by ≥10% MAE across RB/WR positions
- **Calibration**: Maintain or improve calibration quality
- **Coverage**: Analyze all major fantasy positions

## Data Requirements

### Input Collections

1. **projections_weekly** or **projections_yearly**
   - Required fields: `player_id`, `season`, `week`, `position`, `fantasy_points_simple`
   - Optional: `range_floor`, `range_median`, `range_ceiling`

2. **scoring** or **player_stats**
   - Required fields: `player_id`, `season`, `week`, `actual_fantasy_points`
   - Used for ground truth comparison

3. **leagues** (optional)
   - For custom scoring rules if `--league-id` is specified

### Data Preparation

If you don't have actual performance data yet:

1. **Populate scoring collection** with game results:
```sql
-- Example: Add weekly scoring data
INSERT INTO scoring (player_id, season, week, fantasy_points, passing_yards, rushing_yards, ...)
VALUES ('player123', 2024, 1, 18.5, 275, 0, ...)
```

2. **Ensure player_id consistency** between projections and actuals
3. **Verify position data** is available in projections

## Report Outputs

### Markdown Report
- Executive summary with key insights
- Position-by-position performance breakdown
- Tier analysis with improvement recommendations
- Calibration and time series analysis (if enabled)

### JSON Report
- Machine-readable format for further analysis
- Detailed prediction-level data
- Suitable for building dashboards or additional tooling

### Parquet Report
- High-performance columnar format
- Ideal for data science workflows
- Compatible with pandas, Apache Spark, etc.

## Architecture

```
evaluation/
├── types.ts              # Core type definitions
├── data-loader.ts        # Load predictions and actuals from Appwrite
├── metrics.ts            # Calculate MAE, sMAPE, R², calibration
├── tier-analysis.ts      # Position-tier performance analysis
├── report-generator.ts   # Generate markdown/JSON/Parquet reports
├── evaluator.ts          # Main evaluation coordinator
└── README.md            # This file

scripts/
└── eval_proj.ts         # CLI interface
```

## Troubleshooting

### Common Issues

**No prediction data found**
- Check that `projections_weekly` or `projections_yearly` has data for your date range
- Verify week range format (e.g., `2024W1-2024W14`)

**No actual performance data found**
- Ensure `scoring` or `player_stats` collections have data
- Check that fantasy points are calculated and stored

**No matching prediction-actual pairs**
- Verify `player_id` values match between collections
- Check that evaluation period has data in both collections

### Data Validation

```bash
# Check available projection data
npm run eval_proj -- --weeks 2024W1-2024W1 --out test.md --format json

# Validate specific position
npm run eval_proj -- --weeks 2024W1-2024W1 --positions QB --out qb_test.md
```

## Integration with Model Development

### Baseline Establishment
```bash
# Establish current model baseline
npm run eval_proj -- --weeks 2024W1-2024W14 --out reports/baseline_v1.md --format json
```

### A/B Testing
```bash
# Test new model version
npm run eval_proj -- --weeks 2024W1-2024W14 --out reports/new_model_v2.md --format json

# Compare results programmatically using JSON outputs
```

### Continuous Monitoring
```bash
# Weekly performance check
npm run eval_proj -- --weeks 2024W14-2024W14 --out reports/week14_check.md --time-series
```

## Next Steps

1. **Set up automated evaluation** as part of your model deployment pipeline
2. **Create baseline reports** for your current model
3. **Establish improvement targets** (e.g., 10% MAE reduction)
4. **Integrate with model training** to track improvement over iterations
5. **Add custom metrics** specific to your fantasy format/scoring

## Support

For questions or issues with the evaluation system:
1. Check this README for common solutions
2. Review the console output for specific error messages
3. Examine the generated reports for data quality issues
4. Consider the troubleshooting section above