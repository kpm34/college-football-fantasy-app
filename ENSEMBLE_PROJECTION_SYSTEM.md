# Ensemble Projection System

## Overview

The Big 12 Draft Board Seeder uses an ensemble of data sources to generate accurate fantasy football projections. This approach combines multiple data streams to create more reliable and nuanced projections than single-source models.

## Data Sources

### 1. CFBD Historical Data (CollegeFootballData.com)
- **Team Pace**: Plays per game from historical stats
- **Player Usage**: Individual player usage shares based on position
- **Historical Performance**: Previous season fantasy point production

**API Endpoints Used:**
- `/stats/player/season` - Team pace data
- `/player/stats` - Individual player statistics
- `/games` - Team schedules

### 2. Vegas Odds (OddsAPI.io)
- **Point Spreads**: Team performance expectations
- **Game Totals**: Expected scoring environment
- **Implied Team Points**: Calculated from spread + total

**Formula:**
```
implied_team_pts = (total / 2) + (spread / 2)
```

### 3. SP+ Metrics (Bill Connelly's System)
- **Offense Efficiency**: Team offensive performance rating
- **Defense Efficiency**: Opponent defensive performance rating
- **Special Teams**: Kicker-specific adjustments

**Adjustment Formula:**
```
sp_plus_adjustment = (team_offense_sp+ - opp_defense_sp+) / 100
```

### 4. Injury Feeds (Rotowire)
- **Injury Status**: Player availability
- **Risk Assessment**: Probability of missing games
- **Return Timeline**: Expected return dates

### 5. Weather Data (Weather API)
- **Game Conditions**: Temperature, wind, precipitation
- **Position Impact**: Weather effects on different positions
- **Historical Patterns**: Weather-based performance trends

### 6. Depth Chart Analysis
- **Role Changes**: Promotions, demotions, position battles
- **Competition Level**: Quality of backup players
- **Usage Patterns**: Expected playing time distribution

### 7. Coaching Changes Impact
- **Scheme Changes**: New offensive/defensive philosophies
- **Position Emphasis**: Which positions get priority
- **Historical Trends**: Coach's track record with position groups

## Projection Calculation Pipeline

### Step 1: Raw Projection
```
raw_proj = pace_factor × usage_share × implied_team_pts × scoring_multiplier
```

**Components:**
- `pace_factor`: Team's plays per game normalized to league average
- `usage_share`: Player's historical usage percentage within position
- `implied_team_pts`: Expected team points from Vegas odds
- `scoring_multiplier`: Position-specific fantasy point conversion

### Step 2: Injury Adjustment
```
injury_adj = raw_proj × (1 - injury_risk_pct)
```

**Risk Levels:**
- **Healthy (0%)**: No adjustment
- **Questionable (25%)**: 25% reduction
- **Doubtful (50%)**: 50% reduction
- **Out (100%)**: Zero projection

### Step 3: SP+ Efficiency Adjustment
```
sp_plus_adj = injury_adj × (1 + sp_plus_adjustment)
```

**Efficiency Impact:**
- **Positive**: Team offense > Opponent defense
- **Negative**: Team offense < Opponent defense
- **Neutral**: Balanced matchup

### Step 4: Ensemble Final Projection
```
final_proj = weighted_avg([raw_proj, injury_adj, sp_plus_adj], weights=[0.3, 0.4, 0.3])
```

**Weights:**
- **Raw Projection (30%)**: Base statistical model
- **Injury Adjustment (40%)**: Availability factor (highest weight)
- **SP+ Adjustment (30%)**: Efficiency matchup factor

## Position-Specific Scoring Multipliers

| Position | Multiplier | Reasoning |
|----------|------------|-----------|
| QB | 0.15 | High fantasy point potential (passing + rushing) |
| RB | 0.12 | Dual-threat scoring (rushing + receiving) |
| WR | 0.10 | Receiving-focused scoring |
| TE | 0.08 | Lower volume, higher efficiency |
| K | 0.05 | Field goal and extra point scoring |

## Usage Share Calculation

### Quarterbacks
- **Usage**: 100% when starting
- **Logic**: QBs typically play full games when healthy

### Running Backs
- **Usage**: (Rush Attempts + Receptions) / Team RB Total
- **Logic**: Touch distribution among RB committee

### Wide Receivers
- **Usage**: Receptions / Team WR Receptions
- **Logic**: Target share within receiving corps

### Tight Ends
- **Usage**: Receptions / Team TE Receptions
- **Logic**: Target share within TE group

### Kickers
- **Usage**: Field Goal Attempts / Team FG Attempts
- **Logic**: Kicking opportunity share

## Risk Assessment

### Variance-Based Risk Levels
```
variance = statistics.variance(weekly_projections)
if variance > total * 0.3:
    risk = "high"
elif variance > total * 0.15:
    risk = "medium"
else:
    risk = "low"
```

### Risk Factors
- **High Risk**: Inconsistent weekly performance
- **Medium Risk**: Moderate week-to-week variance
- **Low Risk**: Consistent weekly production

## Data Quality Assurance

### Fallback Values
- **Pace Data**: 70 plays/game (league average)
- **Usage Share**: Position-specific defaults
- **Vegas Odds**: 28-point total, 0-point spread
- **SP+ Metrics**: 0.0 efficiency ratings
- **Injury Data**: Healthy status, 0% risk

### Error Handling
- API timeouts: 30-second limits
- Rate limiting: Exponential backoff
- Missing data: Fallback to defaults
- Invalid responses: Logged and skipped

## Implementation Details

### Caching Strategy
- **SP+ Metrics**: In-memory cache per team
- **Team Pace**: Session-level caching
- **Player Usage**: Calculated per player

### Performance Optimizations
- **Async Requests**: Concurrent API calls
- **Batch Processing**: Team-by-team processing
- **Connection Reuse**: Session-based HTTP client

### Monitoring
- **Success Metrics**: Players processed, projections generated
- **Error Tracking**: API failures, data quality issues
- **Performance**: Processing time, API response times

## Future Enhancements

### Additional Data Sources
- **Weather Data**: Game-time conditions
- **Depth Chart**: Roster position changes
- **Coaching Changes**: Scheme adjustments
- **Recruiting Rankings**: Talent pipeline

### Machine Learning Integration
- **Historical Accuracy**: Model performance tracking
- **Feature Engineering**: Advanced statistical features
- **Ensemble Learning**: Multiple model combination
- **Real-time Updates**: Live projection adjustments

### Advanced Analytics
- **Matchup Analysis**: Head-to-head performance
- **Trend Analysis**: Season-long patterns
- **Variance Modeling**: Uncertainty quantification
- **Confidence Intervals**: Projection reliability

## Usage

### Running the Seeder
```bash
# Set environment variables
export CFBD_API_KEY="your_cfbd_key"
export ODDS_API_KEY="your_odds_key"
export ROTOWIRE_API_KEY="your_rotowire_key"
export APPWRITE_API_KEY="your_appwrite_key"

# Run the seeder
python src/scripts/seed_big12_draftboard.py
```

### GitHub Actions
The seeder runs automatically via GitHub Actions:
- **Schedule**: August 1st (before season starts)
- **Manual Trigger**: Available via workflow_dispatch
- **Push Trigger**: When seeder script is updated

### Output
- **Players Collection**: Draftable player data
- **Weekly Projections**: Game-by-game projections
- **Season Projections**: Full-season totals with risk assessment
- **Metadata**: Processing timestamp and data source information 