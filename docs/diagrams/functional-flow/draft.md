# Draft System Flow (Mock vs Real, Scheduled)

## Overview
Comprehensive draft system supporting both mock drafts (practice) and real drafts (scheduled, season commits) with timing gates and room access control.


## API Endpoints
- `GET /api/drafts/:id/room-state` - Check room access and timing
- `POST /api/drafts/mock/create` - Create mock draft
- `POST /api/drafts/create` - Create real draft
- `POST /api/drafts/:id/pick` - Make a pick
- `GET /api/drafts/:id/events` - Get draft events stream
- `WebSocket /api/drafts/:id/live` - Real-time updates

## A) Mock Draft Flow (No Season Commits)

```mermaid
flowchart TD
    StartMock([Start Mock Draft]) --> CreateMock[Create Mock Draft]
    CreateMock --> SetMockFlag[Set is_mock=true]
    SetMockFlag --> GenerateOrder[Generate Random Order]
    GenerateOrder --> OpenRoom[Open Draft Room]
    
    OpenRoom --> MockBanner[Display MOCK DRAFT Banner]
    MockBanner --> EnablePicks[Enable All Pick Actions]
    
    EnablePicks --> UserPick{User's Turn?}
    UserPick -->|Yes| MakePick[Make Pick]
    UserPick -->|No| WaitTurn[Wait/Watch]
    
    MakePick --> WriteMockEvent[Write draft_events<br/>type=pick]
    WriteMockEvent --> UpdateMockState[Update draft_states]
    UpdateMockState --> NextPick[Next Pick]
    
    NextPick --> CheckComplete{All Picks Done?}
    CheckComplete -->|No| UserPick
    CheckComplete -->|Yes| MockComplete[Mock Draft Complete]
    
    MockComplete --> SaveBoard[Save Board<br/>drafts.board_md]
    SaveBoard --> ShowResults[Show Results]
    ShowResults --> ResetOption[Offer Reset/Restart]
    
    subgraph "Mock Draft Data"
        WriteMockEvent -.-> NR1[❌ NO roster_slots]
        WriteMockEvent -.-> NR2[❌ NO transactions]
        WriteMockEvent -.-> NR3[❌ NO budget updates]
    end
    
    style StartMock fill:#e0f2fe
    style MockBanner fill:#fef3c7
    style MockComplete fill:#dcfce7
```

## B) Real Draft Flow (Scheduled, Season Commits)

```mermaid
flowchart TD
    StartReal([Scheduled Draft Time]) --> CheckTime{Current Time?}
    
    CheckTime -->|T-60min| RoomOpens[Draft Room Opens]
    RoomOpens --> ReadOnly[Read-Only Preview Mode]
    ReadOnly --> ShowPosition[Show Draft Position]
    ShowPosition --> ShowTimer[Show Countdown Timer]
    
    CheckTime -->|T=0| GoLive[Draft Goes Live]
    GoLive --> EnableClock[Enable Pick Clock]
    EnableClock --> EnableActions[Enable Pick Actions]
    
    EnableActions --> RealPick{User's Turn?}
    RealPick -->|Yes| PickWindow[Pick Window Open]
    RealPick -->|No| WatchOnly[Watch Only]
    
    PickWindow --> TimerTick{Timer Expired?}
    TimerTick -->|No| UserSelect[User Selects Player]
    TimerTick -->|Yes| AutoPick[Auto-Pick BPA]
    
    UserSelect --> ValidatePick[Validate Pick]
    AutoPick --> ValidatePick
    
    ValidatePick --> WriteRealEvent[Write draft_events<br/>type=pick]
    WriteRealEvent --> UpdateRealState[Update draft_states]
    UpdateRealState --> CommitRoster[Write roster_slots]
    CommitRoster --> RecordTransaction[Write transactions<br/>type=draft]
    RecordTransaction --> UpdateBudget[Update auction_budget<br/>if auction]
    
    UpdateBudget --> NextRealPick[Next Pick]
    NextRealPick --> CheckRealComplete{Draft Complete?}
    CheckRealComplete -->|No| RealPick
    CheckRealComplete -->|Yes| FinalizeDraft[Finalize Draft]
    
    FinalizeDraft --> MarkComplete[drafts.status=completed]
    MarkComplete --> GenerateBoard[Generate Mermaid Board]
    GenerateBoard --> SaveAssets[Save to draft-boards/]
    SaveAssets --> UpdateURI[Set board_asset_uri]
    UpdateURI --> NotifyUsers[Notify All Users]
    
    subgraph "Timing Gates"
        RoomOpens -.-> TG1[draft_room_open_at]
        GoLive -.-> TG2[draft_start_at]
        PickWindow -.-> TG3[pick_time_seconds]
    end
    
    style StartReal fill:#e0f2fe
    style GoLive fill:#fbbf24
    style FinalizeDraft fill:#dcfce7
    style AutoPick fill:#fee2e2
```

## C) Shared UI & Timing Control

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Draft Room UI
    participant API as API Routes
    participant WS as WebSocket
    participant DB as Appwrite
    participant Clock as Server Clock
    
    U->>UI: Enter Draft Room
    UI->>API: GET /api/drafts/:id/room-state
    
    API->>Clock: Get current time
    API->>DB: Get draft settings
    DB-->>API: draft_start_at, room_open_at
    
    API->>API: Calculate state
    Note over API: isOpen = now >= room_open_at<br/>isLive = now >= draft_start_at
    
    API-->>UI: {isOpen, isLive, timeToStart}
    
    alt Room Not Open
        UI-->>U: Show "Room opens in X minutes"
    else Room Open, Not Live
        UI-->>U: Show preview + countdown
        UI->>WS: Connect WebSocket
        
        loop Every Second
            Clock->>WS: Time update
            WS-->>UI: Countdown tick
            UI-->>U: Update timer display
        end
        
        Clock->>WS: Draft start signal
        WS-->>UI: Enable draft controls
    else Draft Live
        UI-->>U: Full draft interface
        UI->>WS: Connect WebSocket
        
        loop On Each Pick
            WS-->>UI: Pick event
            UI-->>U: Update board
        end
    end
```

## 4. Data Interaction Comparison

| Collection | Mock Draft | Real Draft | Notes |
|------------|------------|------------|-------|
| drafts | READ/WRITE | READ/WRITE | is_mock flag differentiates |
| draft_states | WRITE | WRITE | Current pick state |
| draft_events | WRITE | WRITE | All pick events |
| roster_slots | ❌ NO | ✅ WRITE | Only real drafts commit |
| transactions | ❌ NO | ✅ WRITE | Only real drafts record |
| fantasy_teams | ❌ NO | ✅ UPDATE | Budget only for auction |
| activity_log | WRITE | WRITE | Both log activity |

## 5. Room State API Response

```typescript
interface RoomStateResponse {
  now: string // Server time ISO
  draft_start_at: string
  draft_room_open_at: string
  isOpen: boolean // Can enter room
  isLive: boolean // Can make picks
  isComplete: boolean
  server_tz: string // Server timezone
  timeToOpen?: number // Milliseconds
  timeToStart?: number // Milliseconds
}

// GET /api/drafts/:id/room-state
async function getRoomState(draftId: string) {
  const draft = await getDraft(draftId)
  const now = new Date()
  
  return {
    now: now.toISOString(),
    draft_start_at: draft.draft_start_at,
    draft_room_open_at: draft.draft_room_open_at,
    isOpen: now >= new Date(draft.draft_room_open_at),
    isLive: now >= new Date(draft.draft_start_at),
    isComplete: draft.status === 'completed',
    server_tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timeToOpen: Math.max(0, new Date(draft.draft_room_open_at) - now),
    timeToStart: Math.max(0, new Date(draft.draft_start_at) - now)
  }
}
```

## 6. Pick Validation Middleware

```typescript
// Middleware to enforce timing gates
async function validatePickTiming(req: Request) {
  const { draftId } = req.params
  const roomState = await getRoomState(draftId)
  
  if (!roomState.isLive && !draft.is_mock) {
    throw new Error('Draft has not started yet')
  }
  
  if (roomState.isComplete) {
    throw new Error('Draft is already complete')
  }
  
  // Check if it's user's turn
  const currentPick = await getCurrentPick(draftId)
  if (currentPick.team_id !== req.user.team_id) {
    throw new Error('Not your turn to pick')
  }
  
  return true
}
```

## 7. Draft Board Generation

```typescript
// Generate Mermaid board after draft completion
async function generateDraftBoard(draftId: string) {
  const events = await getDraftEvents(draftId)
  const picks = events.filter(e => e.type === 'pick')
  
  let mermaid = `graph TD\n`
  mermaid += `  subgraph "Draft Results"\n`
  
  picks.forEach((pick, i) => {
    const round = Math.floor(i / 12) + 1
    const pickInRound = (i % 12) + 1
    mermaid += `    Pick${i}["R${round}P${pickInRound}: ${pick.player_name}\\n${pick.team_name}"]`
    
    if (i > 0) {
      mermaid += ` --> Pick${i + 1}`
    }
    mermaid += '\n'
  })
  
  mermaid += `  end\n`
  
  // Save to file
  const filename = `${draftId}-${new Date().getFullYear()}.md`
  const path = `docs/diagrams/draft-boards/${filename}`
  await saveFile(path, mermaid)
  
  // Update draft record
  await updateDraft(draftId, { board_asset_uri: path })
  
  return path
}
```

## 8. Required Indexes

- **draft_events**: `(draft_id, overall)` - For ordered pick retrieval
- **draft_states**: `(draft_id)` unique - Current state lookup
- **drafts**: `(league_id, season)` - League's drafts
- **leagues**: `(season, draft_start_at)` - Upcoming drafts query

## 9. Testing Requirements

```typescript
describe('Draft Room Timing Gates', () => {
  it('should deny access before room opens', async () => {
    const draft = createDraft({
      draft_start_at: addHours(now, 2),
      draft_room_open_offset_minutes: 60
    })
    
    const state = await getRoomState(draft.id)
    expect(state.isOpen).toBe(false)
    expect(state.isLive).toBe(false)
  })
  
  it('should allow read-only access when room opens', async () => {
    const draft = createDraft({
      draft_start_at: addMinutes(now, 30),
      draft_room_open_offset_minutes: 60
    })
    
    const state = await getRoomState(draft.id)
    expect(state.isOpen).toBe(true)
    expect(state.isLive).toBe(false)
  })
  
  it('should enable picks at draft start time', async () => {
    const draft = createDraft({
      draft_start_at: now,
      draft_room_open_offset_minutes: 60
    })
    
    const state = await getRoomState(draft.id)
    expect(state.isOpen).toBe(true)
    expect(state.isLive).toBe(true)
  })
})
```