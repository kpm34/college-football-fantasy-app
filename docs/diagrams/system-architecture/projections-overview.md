# Projections System Overview

## Complete Pipeline Architecture

```mermaid
graph TB
    subgraph "Input Sources"
        CS[Codebase /data/]
        EA[External APIs]
        AW[Appwrite Collections]
    end
    
    subgraph "Codebase Data"
        CS --> DC[Depth Charts<br/>/data/depth-charts/*.json]
        CS --> ER[EA Ratings<br/>/data/ea-ratings*.json]
        CS --> MD[Mock Drafts<br/>/data/mock-drafts/*.json]
    end
    
    subgraph "External APIs"
        EA --> CFBD[CFBD API]
        EA --> ESPN[ESPN API]
        EA --> RW[Rotowire API]
        EA --> WX[Weather Provider]
    end
    
    subgraph "Appwrite Data"
        AW --> CP[college_players]
        AW --> GM[games]
        AW --> PS[player_stats]
        AW --> RK[rankings]
        AW --> MV[model_versions]
        AW --> MR[model_runs]
    end
    
    subgraph "Loader Modules"
        DC --> LDC[loadDepthCharts()]
        ER --> LEA[loadEaRatings()]
        MD --> LMD[loadMockDraftsAgg()]
        PS --> LHS[loadHistoricalStats()]
        PS --> LCS[loadCurrentStats()]
        RW --> LI[loadInjuries()]
        WX --> LW[loadWeather()]
        GM --> CSOS[computeSOS()]
    end
    
    subgraph "Feature Engineering"
        LDC --> FE[Feature Pipeline]
        LEA --> FE
        LMD --> FE
        LHS --> FE
        LCS --> FE
        LI --> FE
        LW --> FE
        CSOS --> FE
    end
    
    subgraph "Weight Engine"
        FE --> WE[Apply Weights<br/>Version: V]
        MV --> WE
    end
    
    subgraph "Projection Types"
        WE --> YP[Yearly Projections<br/>period='yearly']
        WE --> WP[Weekly Projections<br/>period='weekly']
    end
    
    subgraph "Scoring Overlay"
        YP --> SO[Apply League<br/>Scoring Rules]
        WP --> SO
        SO --> SR[scoring_profile_hash]
    end
    
    subgraph "Persistence"
        SO --> PRJ[projections table]
        WE --> MRU[model_runs update]
        SR --> PRJ
    end
    
    subgraph "Website Render"
        PRJ --> DUI[Draft UI<br/>Yearly]
        PRJ --> LUI[Lineup UI<br/>Weekly]
        MRU --> VER[Version Display]
    end
    
    style CS fill:#fef3c7
    style EA fill:#dbeafe
    style AW fill:#dcfce7
    style FE fill:#fce7f3
    style WE fill:#e9d5ff
    style PRJ fill:#ccfbf1
```

## System Components

### 1. Input Sources
- **Codebase**: Static data files in `/data/` directory
- **External APIs**: Real-time data from CFBD, ESPN, Rotowire, Weather
- **Appwrite**: Persistent storage for players, stats, and model data

### 2. Loader Modules
- Each input source has a dedicated loader with Zod validation
- Loaders handle caching, rate limiting, and error recovery
- All loaders return standardized, typed data structures

### 3. Feature Engineering
- Combines multiple inputs into feature vectors
- Handles missing data and normalization
- Creates derived features (rolling averages, deltas, etc.)

### 4. Weight Engine
- Versioned weight vectors stored in `model_versions`
- Supports multiple weight profiles for different contexts
- Tracks performance metrics for each weight version

### 5. Projection Types
- **Yearly**: Used for draft, covers full season
- **Weekly**: In-season projections with current context
- Both types share feature pipeline but use different weights

### 6. Scoring Overlay
- Converts base stats to fantasy points
- Supports league-specific scoring rules
- Can cache league-adjusted projections or compute on-demand

### 7. Persistence & Versioning
- All projections tagged with model version
- Complete audit trail in `model_runs`
- Supports rollback to previous versions

### 8. Website Integration
- Draft UI loads yearly projections
- Lineup pages show weekly projections
- Transparency features show projection components
