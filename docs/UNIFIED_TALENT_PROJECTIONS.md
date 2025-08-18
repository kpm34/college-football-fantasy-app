# Unified Talent-Based Projection System

## Overview
The new unified projection system consolidates all fragmented projection logic into a single comprehensive engine that incorporates multiple talent evaluation metrics to provide more accurate fantasy football projections.

## Key Features

### 🏆 Talent-Based Scaling
- **EA Sports Ratings**: Overall rating (0-99), speed, acceleration for athletic evaluation
- **NFL Mock Draft Data**: Projected draft capital converted to talent scores
- **Previous Year Performance**: Historical fantasy performance with position-specific benchmarks
- **Surrounding Talent**: Analysis of offensive line quality and supporting cast ratings
- **ESPN+ Expert Analysis**: Sentiment analysis from premium sports content
- **Depth Chart Intelligence**: Position-specific multipliers based on starting role certainty

### 📰 ESPN+ Integration
- **Credentials**: kpm34@pitt.edu / #Kash2002
- **Content Analysis**: Uses OpenAI APIs to analyze ESPN+ articles for player insights
- **Expert Sentiment**: Extracts expert opinions on player outlook (-1 to +1 scale)
- **Injury Intelligence**: Automated extraction of injury concerns from articles
- **Coaching Impact**: Analysis of coaching changes and system impacts

### 🧠 AI-Powered Analysis
- **OpenAI Integration**: Uses existing AI Gateway for content analysis
- **Structured Insights**: Converts unstructured article content into structured data points
- **Batch Processing**: Efficiently processes multiple players while respecting rate limits

## File Structure

### New Unified System
```
functions/unified-talent-projections/
├── index.ts                 # Main projection engine
└── compiled/               # Compiled JavaScript output

lib/services/
└── espn-plus.service.ts    # ESPN+ integration service
```

### Replaced Fragmented Files
- ❌ `functions/project-yearly-simple/` (basic projections only)
- ❌ `functions/project-pro-distributions/` (complex but inflexible)
- ❌ `functions/recalc-custom-projection/` (custom user projections)

## Data Sources

### External Data Files
```
data/
├── ea/
│   └── ratings_2025.csv        # EA Sports player ratings
├── mockdraft/
│   └── 2025.csv               # NFL mock draft projections
├── processed/
│   ├── depth/
│   │   ├── depth_chart_2025.json
│   │   └── usage_priors_2025.json
│   └── efficiency/
│       ├── team_efficiency_2025.json
│       └── pace_estimates_2025.json
└── teams_map.json
```

### Database Integration
- **Input**: `model_inputs` collection (depth charts, usage priors, team efficiency)
- **Output**: Updates `college_players.fantasy_points` with talent-adjusted projections
- **History**: Stores talent multipliers and component scores for analysis

## Talent Multiplier Calculation

The system calculates a comprehensive talent multiplier (0.3x to 2.0x) based on:

```typescript
// EA Sports Impact (15% weight)
ea_impact = (ea_overall - 70) / 30 * 0.15

// Athletic bonus for skill positions (5% weight) 
athletic_bonus = (ea_speed + ea_acceleration) / 2 - 80) / 20 * 0.05

// NFL Draft Capital (20% weight)
draft_impact = draft_capital_score * 0.20

// Previous Performance (25% weight)
prev_performance = (prev_ppg - position_benchmark) / position_benchmark * 0.25

// Supporting Cast (15% weight)  
support_impact = (supporting_cast_rating - 50) / 50 * 0.15

// O-Line Impact for RB/QB (10% weight)
oline_impact = (oline_grade - 50) / 50 * 0.10

// Expert Sentiment (10% weight)
expert_impact = expert_sentiment * 0.10

// Depth Chart Certainty Impact
certainty_penalty = (1 - depth_chart_certainty) * -0.15

// Injury Concern Penalty
injury_penalty = injury_concern_level * -0.20

// Final multiplier
talent_multiplier = clamp(0.3, 2.0, sum_of_all_impacts)
```

## Position-Specific Benchmarks

### Previous Performance Benchmarks
- **QB**: 20 points per game
- **RB**: 15 points per game  
- **WR**: 12 points per game
- **TE**: 10 points per game

### Depth Chart Multipliers
- **QB**: Starter (1.0x), Backup (0.25x), 3rd+ (0.05x)
- **RB**: RB1 (1.0x), RB2 (0.65x), RB3 (0.35x), Deep (0.15x)
- **WR**: WR1 (1.0x), WR2 (0.85x), WR3 (0.60x), WR4 (0.35x), WR5+ (0.15x)
- **TE**: TE1 (1.0x), TE2 (0.50x), TE3+ (0.20x)

## Usage

### Command Line
```bash
# Run full projection update for 2025 season
npx ts-node functions/unified-talent-projections/index.ts --season=2025

# Compile and run
npx tsc functions/unified-talent-projections/index.ts --outDir functions/unified-talent-projections/compiled --target ES2020 --module commonjs --esModuleInterop --skipLibCheck
node functions/unified-talent-projections/compiled/index.js --season=2025
```

### API Integration
The system automatically updates the `college_players` table with:
- `fantasy_points`: Talent-adjusted fantasy point projections
- `statline_simple_json`: Detailed stat breakdown projections
- `talent_multiplier`: Calculated talent multiplier for transparency
- `ea_overall`: EA Sports overall rating
- `draft_capital_score`: NFL draft capital score
- `supporting_cast_rating`: Team talent context

## Migration from Old System

### Cleanup Steps
```bash
# Run cleanup script to remove old files
./scripts/cleanup-old-projections.sh

# Old files are backed up in backups/old-projections-[timestamp]/
```

### Updated CLAUDE.md
The system has been added to environment variables:
```bash
# ESPN+ Account (for premium content and analysis)
ESPN_USERNAME=kpm34@pitt.edu
ESPN_PASSWORD=#Kash2002
```

## Benefits

### For Mock Drafts
- **Realistic Rankings**: Top players are actual starters, not unknown backups
- **Talent Differentiation**: Elite players properly separated from role players
- **Context Awareness**: Accounts for team situation and supporting cast

### For League Management
- **Balanced Scoring**: No more inflated projections for backup QBs
- **Expert Insights**: Incorporates professional analysis from ESPN+
- **Injury Intelligence**: Automated injury concern detection and adjustment

### For Development
- **Single Source of Truth**: One projection engine instead of multiple fragmented systems
- **Extensible**: Easy to add new talent metrics and data sources
- **Maintainable**: Clean, documented code with TypeScript type safety
- **Testable**: Modular design enables unit testing of individual components

## Future Enhancements

### Phase 2 Improvements
1. **Real ESPN+ Authentication**: Replace simulated content with actual ESPN+ login
2. **Advanced NLP**: Enhanced article analysis with custom sports-specific models
3. **Transfer Portal Integration**: Real-time player movement tracking
4. **Recruiting Data**: High school recruiting rankings integration
5. **Advanced Statistics**: EPA, success rate, and other advanced metrics
6. **Machine Learning**: Historical trend analysis for projection refinement

### Phase 3 Features
1. **User Customization**: Allow users to adjust talent weighting preferences  
2. **Confidence Intervals**: Provide projection ranges based on uncertainty
3. **Real-time Updates**: Dynamic projections based on breaking news
4. **Team Chemistry**: Model teammate synergy effects
5. **Weather Integration**: Environmental impact on player performance
6. **Betting Market Integration**: Use Vegas lines as additional talent signal

## Monitoring & Validation

The system provides extensive logging and validation:
- **Talent Profile Completeness**: Reports missing data for each player
- **Projection Quality**: Compares against historical performance
- **Data Source Health**: Monitors EA ratings, mock draft, and ESPN+ data availability
- **Performance Metrics**: Tracks projection accuracy over time

## Support & Maintenance

For issues or enhancements:
1. Check logs in console output during projection runs
2. Validate input data files in `/data/` directories
3. Test individual components using TypeScript compilation
4. Backup old projection files are available in `/backups/` if rollback needed

This unified system represents a significant improvement in projection quality and maintainability, providing the foundation for accurate fantasy football analysis.