# External Data Sources Flow

## Overview
This diagram shows how external data sources feed into the draft system.

## Data Sources

### 1. College Football Data API (CFBD)
- **Endpoint**: `https://api.collegefootballdata.com`
- **Data Types**:
  - Player rosters
  - Team information
  - Game schedules
  - Statistics
- **Integration**: `/api/(external)/cfbd/players/route.ts`
- **Update Frequency**: Daily
- **Target Collection**: `college_players`

### 2. EA Sports Ratings
- **Source**: CSV files in `data/player/ea/`
- **Data Types**:
  - Player talent ratings
  - Speed and acceleration
  - Overall ratings
- **Processing**: Team name normalization
- **Usage**: Base projection calculations

### 3. Depth Charts
- **Source**: JSON files in `data/player/depth/`
- **Data Types**:
  - Position rankings
  - Playing time estimates
  - Depth chart positions
- **Processing**: Position-based multipliers
- **Usage**: Depth multiplier calculations

### 4. NFL Mock Draft Data
- **Source**: CSV files in `data/market/mockdraft/`
- **Data Types**:
  - Draft capital scores
  - Prospect evaluations
  - Position rankings
- **Processing**: Position-based draft capital
- **Usage**: NFL draft capital scoring

## Data Flow
```
External Sources → Data Validation → Team Normalization → Database Storage
```

## Processing Steps
1. **Data Ingestion**: Fetch from external sources
2. **Validation**: Check data integrity
3. **Normalization**: Standardize team names
4. **Transformation**: Convert to internal format
5. **Storage**: Save to Appwrite collections

