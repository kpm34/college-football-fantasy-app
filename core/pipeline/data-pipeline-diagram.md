# College Football Fantasy - Complete Data Pipeline Architecture

## Executive Summary

The current sync system had limited impact because:
1. **Fragmented approach** - Multiple isolated sync scripts with no coordination
2. **No error handling** - Failed operations left data in inconsistent state  
3. **Manual execution** - Required manual intervention, no automated scheduling
4. **No cache invalidation** - Frontend showed stale data after updates
5. **No real-time updates** - Users had to refresh to see changes
6. **Schema drift** - Database and code schemas got out of sync

## New Unified Pipeline Architecture

```mermaid
graph TB
    %% External Data Sources
    subgraph "External APIs"
        CFBD[🏈 College Football Data API<br/>Players, Games, Rankings]
        ESPN[📺 ESPN API<br/>Scores, News]
        ROTOWIRE[📰 Rotowire<br/>Player News, Injuries]
    end
    
    %% Central Sync System
    subgraph "Central Sync System"
        SYNC_ENGINE[🚀 Sync Engine<br/>Rate Limiting, Batching<br/>Error Handling, Retries]
        TRANSFORM[🔄 Data Transforms<br/>CFBD → Appwrite<br/>ESPN → Appwrite<br/>Validation & Cleanup]
        QUEUE[📋 Sync Queue<br/>Batch Operations<br/>Priority Scheduling]
    end
    
    %% Appwrite Database
    subgraph "Appwrite Database (NYC)"
        subgraph "Core Collections"
            PLAYERS[(🏃 college_players<br/>Name, Position, Team<br/>Fantasy Points, Eligible)]
            TEAMS[(🏫 teams<br/>School, Conference<br/>Colors, Logo)]
            GAMES[(🎯 games<br/>Week, Scores, Date<br/>Eligible Flag)]
            RANKINGS[(🏆 rankings<br/>AP Top 25<br/>Week, Points)]
        end
        
        subgraph "Fantasy Collections"
            LEAGUES[(🏟️ leagues<br/>Name, Commissioner<br/>Settings, Status)]
            ROSTERS[(👥 rosters<br/>Team Name, Players<br/>Wins, Points)]
            LINEUPS[(📋 lineups<br/>Starting Players<br/>Bench, Points)]
        end
        
        subgraph "Draft Collections"
            AUCTIONS[(🔨 auctions<br/>Current Player<br/>Bid Amount, Timer)]
            BIDS[(💰 bids<br/>Team, Amount<br/>Timestamp)]
        end
        
        subgraph "Activity Collections"
            USERS[(👤 users<br/>Profile, Preferences<br/>Stats)]
            ACTIVITY[(📝 activity_log<br/>Actions, Timestamps<br/>League Events)]
        end
    end
    
    %% API Layer
    subgraph "Next.js API Routes"
        API_SYNC[🔄 /api/sync<br/>Trigger Data Updates]
        API_PLAYERS[👥 /api/players/cached<br/>Draft Player Lists]
        API_LEAGUES[🏟️ /api/leagues/*<br/>League Management]
        API_DRAFT[🎯 /api/draft/*<br/>Draft Actions]
    end
    
    %% Frontend Pages
    subgraph "Frontend Pages"
        DRAFT_PAGE[🎯 Draft Room<br/>Real-time Picks<br/>Player Search]
        AUCTION_PAGE[🔨 Auction Room<br/>Live Bidding<br/>Timer Updates]
        LEAGUE_PAGE[🏟️ League Dashboard<br/>Standings, Schedule<br/>Team Management]
        CREATE_PAGE[➕ Create League<br/>Settings, Invites<br/>Commissioner Tools]
    end
    
    %% Deployment & Infrastructure
    subgraph "Vercel Infrastructure"
        EDGE[⚡ Edge Functions<br/>API Routes<br/>Server Actions]
        CACHE[💾 Edge Config<br/>Cache Management<br/>Feature Flags]
        DEPLOY[🚀 Deployment<br/>Auto-deploy<br/>Environment Sync]
    end
    
    %% Real-time Updates
    subgraph "Real-time System"
        WEBSOCKET[🔌 WebSockets<br/>Live Draft Updates<br/>Score Changes]
        BROADCAST[📡 Event Broadcasting<br/>League Notifications<br/>Status Updates]
    end
    
    %% Data Flow Connections
    CFBD -->|Daily Sync| SYNC_ENGINE
    ESPN -->|Hourly Sync| SYNC_ENGINE
    ROTOWIRE -->|News Updates| SYNC_ENGINE
    
    SYNC_ENGINE --> TRANSFORM
    TRANSFORM --> QUEUE
    QUEUE --> PLAYERS
    QUEUE --> TEAMS
    QUEUE --> GAMES
    QUEUE --> RANKINGS
    
    %% User Interactions
    CREATE_PAGE -->|Create League| API_LEAGUES
    DRAFT_PAGE -->|Make Pick| API_DRAFT
    AUCTION_PAGE -->|Place Bid| API_DRAFT
    
    API_LEAGUES --> LEAGUES
    API_LEAGUES --> ROSTERS
    API_DRAFT --> ROSTERS
    API_DRAFT --> AUCTIONS
    API_DRAFT --> BIDS
    
    %% Data Consumption
    PLAYERS --> API_PLAYERS
    LEAGUES --> API_LEAGUES
    GAMES --> API_SYNC
    
    API_PLAYERS --> DRAFT_PAGE
    API_PLAYERS --> AUCTION_PAGE
    API_LEAGUES --> LEAGUE_PAGE
    API_LEAGUES --> CREATE_PAGE
    
    %% Real-time Updates
    ROSTERS -.->|Live Updates| WEBSOCKET
    AUCTIONS -.->|Bid Updates| WEBSOCKET
    GAMES -.->|Score Updates| WEBSOCKET
    
    WEBSOCKET -.-> DRAFT_PAGE
    WEBSOCKET -.-> AUCTION_PAGE
    WEBSOCKET -.-> LEAGUE_PAGE
    
    %% Cache & Deployment
    API_SYNC --> CACHE
    CACHE --> EDGE
    EDGE --> DEPLOY
    
    %% Activity Logging
    API_LEAGUES --> ACTIVITY
    API_DRAFT --> ACTIVITY
    USERS --> ACTIVITY
    
    %% Styling
    classDef external fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef sync fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef database fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef api fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef frontend fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    classDef infra fill:#e0f2f1,stroke:#00796b,stroke-width:2px
    classDef realtime fill:#f1f8e9,stroke:#689f38,stroke-width:2px
    
    class CFBD,ESPN,ROTOWIRE external
    class SYNC_ENGINE,TRANSFORM,QUEUE sync
    class PLAYERS,TEAMS,GAMES,RANKINGS,LEAGUES,ROSTERS,LINEUPS,AUCTIONS,BIDS,USERS,ACTIVITY database
    class API_SYNC,API_PLAYERS,API_LEAGUES,API_DRAFT api
    class DRAFT_PAGE,AUCTION_PAGE,LEAGUE_PAGE,CREATE_PAGE frontend
    class EDGE,CACHE,DEPLOY infra
    class WEBSOCKET,BROADCAST realtime
```

## Sync Job Dependencies & Scheduling

```mermaid
gantt
    title Data Sync Schedule (Daily/Hourly)
    dateFormat HH:mm
    axisFormat %H:%M
    
    section External APIs
    CFBD Teams         :done, cfbd-teams, 02:00, 30m
    CFBD Players       :done, cfbd-players, 02:30, 60m
    CFBD Games         :active, cfbd-games, 04:00, 30m
    ESPN Scores        :espn-scores, 06:00, 15m
    
    section Calculations
    Fantasy Projections :proj, after cfbd-players, 45m
    Eligibility Check   :eligible, after cfbd-games, 15m
    
    section Cache Updates
    Player Cache       :cache-players, after proj, 10m
    Game Cache         :cache-games, after eligible, 10m
    
    section Real-time (Every 15min during games)
    Live Scores        :live, 12:00, 8h
```

## Error Handling & Recovery Flow

```mermaid
flowchart TD
    A[Sync Job Starts] --> B{API Available?}
    B -->|No| C[Exponential Backoff<br/>Max 3 Retries]
    B -->|Yes| D[Fetch Data]
    
    D --> E{Valid Data?}
    E -->|No| F[Log Validation Error<br/>Skip This Batch]
    E -->|Yes| G[Transform Data]
    
    G --> H{Transform Success?}
    H -->|No| I[Log Transform Error<br/>Use Previous Data]
    H -->|Yes| J[Save to Appwrite]
    
    J --> K{Save Success?}
    K -->|No| L[Rollback Changes<br/>Alert Admin]
    K -->|Yes| M[Invalidate Cache]
    
    M --> N[Broadcast Changes]
    N --> O[Job Complete]
    
    C --> P{Retries Exhausted?}
    P -->|Yes| Q[Alert Admin<br/>Use Cached Data]
    P -->|No| B
    
    F --> O
    I --> O
    L --> Q
    Q --> O
    
    style A fill:#e8f5e8
    style O fill:#e8f5e8
    style Q fill:#ffebee
    style L fill:#ffebee
```

## Real-time Data Flow (WebSocket Events)

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API Route
    participant D as Database
    participant W as WebSocket
    participant O as Other Users
    
    U->>F: Make Draft Pick
    F->>A: POST /api/draft/pick
    A->>D: Update Roster
    D-->>A: Success
    A->>W: Broadcast "pick_made"
    W->>F: Live Update
    W->>O: Notify Other Users
    A-->>F: Response
    F->>F: Update Local State
    
    Note over F,O: All connected users see<br/>the pick in real-time
    
    U->>F: Place Auction Bid
    F->>A: POST /api/auction/bid
    A->>D: Create Bid Record
    A->>D: Update Auction State
    D-->>A: Success
    A->>W: Broadcast "new_bid"
    W->>O: Update Bid Amount
    A-->>F: Response
    
    Note over W,O: Bidding timer resets<br/>for all participants
```

## Cache Invalidation Strategy

```mermaid
flowchart LR
    subgraph "Cache Levels"
        L1[Browser Cache<br/>Component State]
        L2[Server Cache<br/>API Response Cache]
        L3[Edge Cache<br/>Vercel Edge Config]
        L4[CDN Cache<br/>Static Assets]
    end
    
    subgraph "Invalidation Triggers"
        T1[User Action<br/>Draft Pick, Bid]
        T2[Data Sync<br/>Player Updates]
        T3[Schema Change<br/>Database Update]
        T4[Deployment<br/>Code Update]
    end
    
    T1 --> L1
    T1 --> L2
    T2 --> L2
    T2 --> L3
    T3 --> L2
    T3 --> L3
    T4 --> L1
    T4 --> L2
    T4 --> L3
    T4 --> L4
    
    style T1 fill:#ffcdd2
    style T2 fill:#dcedc1
    style T3 fill:#ffe0b2
    style T4 fill:#e1bee7
```

## Deployment Sync Pipeline

```mermaid
flowchart TD
    A[Git Push to Main] --> B[Vercel Build Trigger]
    B --> C{Build Success?}
    C -->|No| D[Notify Team<br/>Rollback Available]
    C -->|Yes| E[Run Schema Migrations]
    
    E --> F{Schema Valid?}
    F -->|No| G[Halt Deployment<br/>Alert Admin]
    F -->|Yes| H[Deploy to Staging]
    
    H --> I[Run Integration Tests]
    I --> J{Tests Pass?}
    J -->|No| K[Notify Team<br/>Investigation Needed]
    J -->|Yes| L[Deploy to Production]
    
    L --> M[Update Environment Variables]
    M --> N[Clear Application Cache]
    N --> O[Warm New Cache]
    O --> P[Health Check]
    
    P --> Q{Healthy?}
    Q -->|No| R[Auto-Rollback<br/>Alert Team]
    Q -->|Yes| S[Deployment Complete<br/>Notify Success]
    
    style A fill:#e8f5e8
    style S fill:#e8f5e8
    style D,G,K,R fill:#ffebee
```

## Key Improvements Over Old System

### 1. **Unified Sync Engine**
- ✅ Single point of control for all data operations
- ✅ Centralized error handling and retry logic
- ✅ Rate limiting and batch processing
- ❌ Old: Multiple isolated scripts

### 2. **Real-time Updates**
- ✅ WebSocket connections for live draft updates
- ✅ Immediate cache invalidation
- ✅ Event broadcasting to all connected users
- ❌ Old: Manual refresh required

### 3. **Error Recovery**
- ✅ Automatic retries with exponential backoff
- ✅ Rollback capability on failures
- ✅ Admin alerts and monitoring
- ❌ Old: Silent failures, data inconsistency

### 4. **Cache Management**
- ✅ Multi-level cache invalidation
- ✅ Smart cache warming
- ✅ Automatic cache revalidation
- ❌ Old: Stale data issues

### 5. **Deployment Coordination**
- ✅ Automated schema migrations
- ✅ Environment variable sync
- ✅ Health checks and rollback
- ❌ Old: Manual deployment steps

### 6. **Data Validation**
- ✅ Schema validation before save
- ✅ Type checking and constraints
- ✅ Data transformation pipeline
- ❌ Old: Data corruption issues

## Implementation Priority

1. **Phase 1**: Central Sync System Core
2. **Phase 2**: Real-time WebSocket Integration  
3. **Phase 3**: Advanced Cache Management
4. **Phase 4**: Automated Deployment Pipeline
5. **Phase 5**: Monitoring and Analytics

This new pipeline ensures reliable, real-time data flow from external APIs through Appwrite to the frontend, with proper error handling, caching, and deployment coordination.