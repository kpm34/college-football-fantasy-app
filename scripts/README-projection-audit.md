# CFB Fantasy Projection Error Audit Script

A comprehensive tool for analyzing projection accuracy and categorizing errors in your college football fantasy projections system.

## Overview

This script helps identify systematic issues in projection algorithms by:
- Calculating error metrics (absolute error, percentage error, SMAPE)
- Categorizing errors using intelligent heuristics
- Generating detailed summaries by position and error type
- Identifying the worst predictions for further investigation

## Usage

### Command Line Interface

```bash
# Basic usage
npm run audit-errors -- --in path/to/data.json --out results.json

# Direct execution
npx tsx scripts/audit-projection-errors.ts --in data.csv --out audit.json

# With options
npx tsx scripts/audit-projection-errors.ts \
  --in examples.json \
  --out audits.json \
  --format json
```

### Input Data Format

The script accepts both CSV and JSON formats with the following required fields:

**Required Fields:**
- `player_id`: Unique player identifier
- `position`: Player position (QB, RB, WR, TE, K) 
- `team`: Team abbreviation
- `opp`: Opponent team
- `week`: Week number
- `season`: Season year
- `projected_fp`: Projected fantasy points
- `actual_fp`: Actual fantasy points scored

**Optional Fields (for better analysis):**
- `player_name`: Player full name
- `touches`: Number of touches (carries + receptions)
- `targets`: Number of targets (for skill positions)
- `depth_chart_rank_at_pred_time`: Depth chart position when prediction made
- `injury_status`: healthy, questionable, doubtful
- `opponent_def_rank`: Opponent defense national ranking
- `spread`: Game spread
- `team_run_rate`: Team's run play percentage
- `team_pass_rate`: Team's pass play percentage
- `weather_conditions`: Game weather conditions

### Sample Input (JSON)

```json
[
  {
    "player_id": "arch_manning_qb",
    "player_name": "Arch Manning",
    "position": "QB",
    "team": "Texas",
    "opp": "Oklahoma", 
    "week": 8,
    "season": 2025,
    "projected_fp": 22.5,
    "actual_fp": 8.2,
    "touches": 5,
    "targets": 0,
    "depth_chart_rank_at_pred_time": 2,
    "injury_status": "healthy",
    "spread": -14,
    "opponent_def_rank": 25
  }
]
```

## Error Categories

The script uses intelligent heuristics to categorize errors:

### 1. **usage_shift**
- Player's touches/targets changed >40% vs 4-week trailing mean
- Example: RB suddenly gets committee role or loses goal-line touches

### 2. **role_change_depth** 
- Expected starter performs poorly or backup exceeds expectations
- Uses depth chart rank at prediction time

### 3. **opponent_misrate**
- Strong performance vs supposedly elite defense
- Poor performance vs supposedly weak defense 
- Uses opponent defensive rankings

### 4. **garbage_time_script**
- Large spread (≥21 points) leads to unusual run/pass rates
- Affects usage patterns significantly

### 5. **data_gap**
- Missing critical data fields needed for accurate predictions
- Example: Missing injury status, depth chart, usage data

### 6. **injury_impact**
- Player listed as injured underperforms projection significantly

### 7. **minor_variance** 
- Small errors (<15% and <5 points) within expected range

### 8. **other**
- No clear pattern identified in the data

## Output Format

The script generates comprehensive analysis including:

### Console Summary
- Overall accuracy metrics
- Breakdown by position
- Breakdown by error category  
- Top worst predictions

### JSON Output Structure
```json
{
  "summary": {
    "total_predictions": 100,
    "avg_absolute_error": 8.5,
    "avg_pct_error": 45.2,
    "avg_smape": 52.1,
    "by_position": { "QB": {...}, "RB": {...} },
    "by_reason": { "usage_shift": {...}, "opponent_misrate": {...} },
    "worst_predictions": [...]
  },
  "detailed_analyses": [...],
  "metadata": {
    "generated_at": "2025-01-XX...",
    "input_file": "data.json",
    "total_records": 100,
    "version": "1.0.0"
  }
}
```

## Error Metrics Explained

- **Absolute Error**: |projected - actual| in fantasy points
- **Percentage Error**: |projected - actual| / projected * 100
- **SMAPE**: Symmetric Mean Absolute Percentage Error (0-200 scale, lower is better)

## Use Cases

1. **Algorithm Debugging**: Identify if depth charts are inaccurate
2. **Data Quality**: Find missing or incorrect input data
3. **Systematic Bias**: Detect if certain positions/situations are consistently misprojected
4. **Model Improvement**: Focus development on highest-error categories
5. **Confidence Scoring**: Weight projections based on historical accuracy

## Integration with Your Projections System

This script works with your existing `/api/draft/players` endpoint that calculates projections using:
- Depth chart multipliers from `model_inputs` collection
- Base projections by position
- Conference and rating adjustments

Use the audit results to:
- Improve depth chart data sources (address `role_change_depth` errors)
- Add opponent strength adjustments (address `opponent_misrate` errors) 
- Include game script considerations (address `garbage_time_script` errors)
- Enhance data collection (address `data_gap` errors)

## Testing

The script includes sample test data at `scripts/test-data/sample-projection-errors.json` with realistic CFB scenarios.

```bash
# Run test
npm run audit-errors -- --in scripts/test-data/sample-projection-errors.json --out test-results.json
```

## Development

The script is built in TypeScript with:
- Commander.js for CLI interface
- Comprehensive error categorization logic
- Historical data analysis for usage trend detection
- Extensible heuristics system

To modify or extend the error categorization, edit the `categorizeError` method in `ProjectionErrorAuditor` class.
