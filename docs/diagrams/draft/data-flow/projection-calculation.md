# Projection Calculation Flow

## Overview
This diagram shows how fantasy projections are calculated from various data sources.

## Calculation Components

### 1. Base Data Sources
- **EA Sports Ratings** (15% weight)
- **NFL Draft Capital** (20% weight)
- **Previous Performance** (25% weight)
- **Depth Chart Position** (40% weight)

### 2. Position Multipliers
- **QB**: 100%/25%/8%/3%/1%
- **RB**: 100%/60%/40%/25%/15%
- **WR**: 100%/80%/60%/35%/20%
- **TE**: 100%/35%/15%

### 3. Additional Factors
- **Conference Adjustments**: Power 4 vs other conferences
- **Strength of Schedule**: Opponent difficulty
- **Team Efficiency**: Offensive efficiency metrics
- **Injury Risk**: Health and availability

## Calculation Flow
```
Base Data → Talent Assessment → Multiplier Application → Final Projections
```

## Processing Steps
1. **Data Aggregation**: Collect all relevant data
2. **Weighted Calculation**: Apply component weights
3. **Position Adjustment**: Apply position-specific multipliers
4. **Contextual Factors**: Add conference and schedule adjustments
5. **Final Projection**: Generate fantasy point estimate

## Output
- **Field**: `college_players.fantasyPoints`
- **Format**: Decimal number (e.g., 285.5)
- **Update Frequency**: Weekly during season

