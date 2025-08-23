# Draft Flow (Snake & Auction)

## Overview
Comprehensive draft system supporting both snake drafts and auction drafts with real-time updates.

## Related Files
- `/app/api/drafts/[id]/start/route.ts` - Start draft
- `/app/api/drafts/[id]/pick/route.ts` - Make pick (snake)
- `/app/api/drafts/[id]/bid/route.ts` - Place bid (auction)
- `/app/api/drafts/[id]/state/route.ts` - Get/update draft state
- `/app/draft/[leagueId]/page.tsx` - Draft room UI
- `/lib/draft/engine.ts` - Core draft logic
- `/lib/db/drafts.ts` - Draft DAL
- `/lib/realtime/draft.ts` - WebSocket handlers

## Draft Flow
```mermaid
flowchart TB
  classDef draft fill:#fef3c7,stroke:#d97706,stroke-width:2,color:#451a03
  classDef snake fill:#dbeafe,stroke:#3b82f6,stroke-width:2,color:#1e3a8a
  classDef auction fill:#dcfce7,stroke:#16a34a,stroke-width:2,color:#14532d
  classDef state fill:#fce7f3,stroke:#ec4899,stroke-width:2,color:#831843
  classDef error fill:#fee2e2,stroke:#ef4444,stroke-width:2,color:#7f1d1d
  
  Start([Commissioner Starts Draft]):::draft
  CheckType{Draft Type?}:::draft
  
  %% Snake Draft Path
  subgraph Snake[Snake Draft]
    InitOrder[Initialize Draft Order]:::snake
    NextPick[Determine Next Pick]:::snake
    OnClock[Team On Clock]:::snake
    Timer[Start Timer]:::snake
    
    PickChoice{Action?}:::snake
    MakePick[Make Pick]:::snake
    AutoPick[Auto Pick]:::snake
    
    ValidatePick{Valid?}:::snake
    RecordPick[Record Pick]:::snake
    UpdateRoster[Update Roster]:::snake
  end
  
  %% Auction Draft Path
  subgraph Auction[Auction Draft]
    InitBudgets[Initialize Budgets]:::auction
    NextLot[Next Player Lot]:::auction
    OpenBidding[Open Bidding]:::auction
    BidTimer[Bid Timer]:::auction
    
    BidChoice{Action?}:::auction
    PlaceBid[Place Bid]:::auction
    PassLot[Pass on Lot]:::auction
    
    ValidateBid{Valid?}:::auction
    RecordBid[Record Bid]:::auction
    CloseLot[Close Lot]:::auction
    UpdateBudget[Update Budget]:::auction
  end
  
  %% Common State Management
  UpdateState[Update Draft State]:::state
  Broadcast[Broadcast to All]:::state
  CheckComplete{Draft Complete?}:::state
  
  Complete[Draft Complete]:::draft
  FinalizeRosters[Finalize Rosters]:::draft
  
  %% Error Handling
  NetworkError[Network Retry]:::error
  TimeoutError[Handle Timeout]:::error
  PermissionError[Permission Denied]:::error
  
  %% Flow connections
  Start --> CheckType
  
  CheckType -->|Snake| InitOrder
  InitOrder --> NextPick
  NextPick --> OnClock
  OnClock --> Timer
  Timer --> PickChoice
  PickChoice -->|Manual| MakePick
  PickChoice -->|Timeout| AutoPick
  MakePick --> ValidatePick
  AutoPick --> ValidatePick
  ValidatePick -->|Yes| RecordPick
  ValidatePick -->|No| PickChoice
  RecordPick --> UpdateRoster
  UpdateRoster --> UpdateState
  
  CheckType -->|Auction| InitBudgets
  InitBudgets --> NextLot
  NextLot --> OpenBidding
  OpenBidding --> BidTimer
  BidTimer --> BidChoice
  BidChoice -->|Bid| PlaceBid
  BidChoice -->|Pass| PassLot
  PlaceBid --> ValidateBid
  ValidateBid -->|Yes| RecordBid
  ValidateBid -->|No| BidChoice
  RecordBid --> CloseLot
  CloseLot --> UpdateBudget
  UpdateBudget --> UpdateState
  PassLot --> UpdateState
  
  UpdateState --> Broadcast
  Broadcast --> CheckComplete
  CheckComplete -->|No| NextPick
  CheckComplete -->|No| NextLot
  CheckComplete -->|Yes| Complete
  Complete --> FinalizeRosters
  
  %% Error paths
  Broadcast -.->|Network Fail| NetworkError
  Timer -.->|Timeout| TimeoutError
  ValidatePick -.->|No Permission| PermissionError
  ValidateBid -.->|No Permission| PermissionError
  NetworkError -.-> Broadcast
  TimeoutError -.-> AutoPick
```

## Sequence Diagram
```mermaid
sequenceDiagram
  participant U as User/Commissioner
  participant UI as Draft Room
  participant WS as WebSocket
  participant API as API Routes
  participant Engine as Draft Engine
  participant DAL as Data Layer
  participant DB as Appwrite
  participant RT as Realtime
  
  %% Start Draft
  U->>UI: Start Draft
  UI->>API: POST /api/drafts/[id]/start
  API->>Engine: Initialize draft
  Engine->>DAL: Create draft record
  DAL->>DB: INSERT drafts
  DAL->>DB: INSERT draft_states
  
  %% WebSocket Connection
  UI->>WS: Connect to draft room
  WS->>RT: Subscribe to draft channel
  
  %% Snake Draft Pick
  alt Snake Draft
    loop Each Pick
      Engine->>DAL: Get next team
      DAL->>DB: SELECT draft_states
      Engine->>RT: Broadcast on-clock
      RT-->>UI: Update UI (all users)
      
      Note over UI: Timer starts (60s)
      
      alt Manual Pick
        U->>UI: Select player
        UI->>API: POST /api/drafts/[id]/pick
        API->>Engine: Validate pick
      else Auto Pick (timeout)
        Note over Engine: Timer expires
        Engine->>Engine: Select BPA
      end
      
      Engine->>DAL: Record pick
      DAL->>DB: INSERT draft_events
      DAL->>DB: INSERT roster_slots
      DAL->>DB: UPDATE draft_states
      
      Engine->>RT: Broadcast pick
      RT-->>UI: Update all clients
    end
  
  %% Auction Draft Bid
  else Auction Draft
    DAL->>DB: INSERT auctions (lots)
    
    loop Each Lot
      Engine->>RT: Open bidding
      RT-->>UI: Show lot
      
      Note over UI: Bid timer (30s)
      
      par Bidding
        U->>UI: Place bid
        UI->>API: POST /api/drafts/[id]/bid
        API->>Engine: Validate bid
        Engine->>DAL: Record bid
        DAL->>DB: INSERT bids
        DAL->>DB: UPDATE auctions
      and Broadcast
        Engine->>RT: Broadcast bid
        RT-->>UI: Update all clients
      end
      
      Note over Engine: Timer expires
      Engine->>DAL: Close lot
      DAL->>DB: UPDATE auctions (winner)
      DAL->>DB: INSERT roster_slots
      DAL->>DB: UPDATE fantasy_teams (budget)
    end
  end
  
  %% Complete Draft
  Engine->>DAL: Finalize draft
  DAL->>DB: UPDATE drafts (status=completed)
  DAL->>DB: UPDATE leagues (status=active)
  DAL->>DB: INSERT transactions (draft picks)
  Engine->>RT: Broadcast complete
  RT-->>UI: Draft complete
```

## Data Interactions

| Collection | Read/Write | When | Attributes | Notes |
|------------|------------|------|------------|-------|
| **Draft Setup** | | | | |
| `drafts` | CREATE | Start | `league_id`, `type`, `status`, `start_time` | Initialize draft |
| `drafts` | READ | Throughout | All | Check draft config |
| `drafts` | UPDATE | Complete | `status`, `end_time` | Mark as completed |
| `draft_states` | CREATE | Start | `draft_id`, `round=1`, `pick=1`, `on_clock_team_id` | Initial state |
| `draft_states` | READ | Each turn | `on_clock_team_id`, `deadline_at` | Get current pick |
| `draft_states` | UPDATE | Each pick | `round`, `pick`, `on_clock_team_id`, `deadline_at` | Advance draft |
| **Snake Draft** | | | | |
| `draft_events` | CREATE | Each pick | `draft_id`, `type=pick`, `round`, `overall`, `fantasy_team_id`, `player_id`, `ts` | Record pick |
| `draft_events` | READ | UI update | All | Show pick history |
| `roster_slots` | CREATE | Each pick | `fantasy_team_id`, `player_id`, `position`, `acquisition_type=draft` | Add to roster |
| `college_players` | READ | Pick validation | `id`, `position`, `eligible` | Validate player |
| `college_players` | UPDATE | After pick | `drafted=true` | Mark as drafted |
| **Auction Draft** | | | | |
| `auctions` | CREATE | Each lot | `league_id`, `player_id`, `status=open`, `current_bid=0` | Open lot |
| `auctions` | READ | Bidding | `current_bid`, `current_bidder_id`, `ends_at` | Show current bid |
| `auctions` | UPDATE | Each bid | `current_bid`, `current_bidder_id` | Update high bid |
| `auctions` | UPDATE | Timer end | `status=closed`, `winner_id`, `final_price` | Close lot |
| `bids` | CREATE | Each bid | `auction_id`, `fantasy_team_id`, `amount`, `timestamp` | Record bid |
| `bids` | READ | History | All | Show bid history |
| `fantasy_teams` | READ | Validation | `auction_budget_remaining` | Check budget |
| `fantasy_teams` | UPDATE | Won lot | `auction_budget_remaining` | Deduct cost |
| **Common** | | | | |
| `transactions` | CREATE | Each action | `type=draft/auction`, `fantasy_team_id`, `player_id` | Audit trail |
| `activity_log` | CREATE | Key events | `action`, `league_id`, `client_id`, `metadata` | Track activity |
| `league_memberships` | READ | Validation | `league_id`, `client_id`, `role` | Check permissions |

## Points of Failure & Mitigation

### Network Issues
- **Problem**: WebSocket disconnection during draft
- **Mitigation**: 
  - Auto-reconnect with exponential backoff
  - Persist draft state in DB every action
  - Allow rejoin with state recovery
  - Queue actions during disconnect

### Timeouts
- **Problem**: User doesn't pick in time
- **Mitigation**:
  - Auto-pick best available player
  - Pre-draft rankings per team
  - Commissioner can pause/extend timer
  - Warning notifications at 10s remaining

### Permission Errors
- **Problem**: Wrong user trying to pick
- **Mitigation**:
  - Server-side validation of on_clock_team_id
  - Role-based access (commissioner override)
  - Signed WebSocket messages
  - Rate limiting per user

### Data Conflicts
- **Problem**: Simultaneous picks/bids
- **Mitigation**:
  - Database transactions
  - Optimistic locking on draft_states
  - Unique constraints on roster_slots
  - Bid validation against current state

### Recovery Procedures
```typescript
// Automatic retry with backoff
const retry = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn()
  } catch (error) {
    if (retries === 0) throw error
    await new Promise(r => setTimeout(r, delay))
    return retry(fn, retries - 1, delay * 2)
  }
}

// State recovery on reconnect
const recoverDraftState = async (draftId) => {
  const state = await getDraftState(draftId)
  const events = await getDraftEvents(draftId)
  return reconstructState(state, events)
}
```
