# Create League Flow (with Draft Scheduling)

## Overview
Complete flow for creating a new fantasy football league, including draft scheduling and configuration.

## Auth Route Handlers Detected
- `/api/leagues/create` - Main league creation endpoint
- Appwrite Account endpoint via cookie for session validation
- Validation handled in-route; no separate `/api/leagues/validate`

## 1. Flowchart

```mermaid
flowchart TD
    Start([User Clicks Create League]) --> Form[League Creation Form]
    Form --> Validate{Validate Input}
    Validate -->|Invalid| ShowError[Show Validation Errors]
    ShowError --> Form
    Validate -->|Valid| AuthCheck{Check Auth}
    AuthCheck -->|Not Authenticated| LoginRedirect[Redirect to Login]
    AuthCheck -->|Authenticated| APICall[POST /api/leagues/create]
    
    APICall --> Normalize[Normalize & Validate Data]
    Normalize --> CreateLeague[Create League in DB]
    
    CreateLeague --> SetSchedule[Set Draft Schedule Fields]
    SetSchedule --> CalcOpenTime[Calculate draft_room_open_at]
    CalcOpenTime --> CreateMembership[Create Owner Membership]
    
    CreateMembership --> LogActivity[Log to activity_log]
    LogActivity --> Response[Return League Data]
    Response --> Redirect[Redirect to League Dashboard]
    
    subgraph "Draft Scheduling Fields"
        SetSchedule --> DS1[draftType: snake/auction]
        SetSchedule --> DS2[draftDate: ISO datetime]
        SetSchedule --> DS3[draftRoomOpenOffsetMinutes: 60]
        SetSchedule --> DS4[pickTimeSeconds: per-pick clock]
        SetSchedule --> DS5[draftOrder: team order array]
        SetSchedule --> DS6[scoringRules: JSON string]
    end
    
    subgraph "Status Gates"
        CalcOpenTime --> SG1[Room Closed: before open_at]
        SG1 --> SG2[Room Open: read-only preview]
        SG2 --> SG3[Live Draft: at start_at]
    end
    
    style Start fill:#e0f2fe
    style Redirect fill:#dcfce7
    style LoginRedirect fill:#fee2e2
    style ShowError fill:#fef3c7
```

## 2. Sequence Diagram

```mermaid
sequenceDiagram
    participant U as User/Browser
    participant C as CreateLeagueForm
    participant A as API Route
    participant V as Validator
    participant D as DAL
    participant DB as Appwrite DB
    participant AL as Activity Logger
    
    U->>C: Fill league form
    C->>C: Client validation
    C->>A: POST /api/leagues/create
    
    A->>V: Validate session
    V-->>A: User authenticated
    
    A->>V: Validate league data
    Note over V: Check required fields<br/>Validate draftDate<br/>Validate scoringRules JSON
    V-->>A: Data valid
    
    A->>A: Normalize fields
    Note over A: Map UI fields to DB schema<br/>Calculate draftRoomOpenAt (derived)<br/>UTC conversion
    
    A->>D: createLeague(data)
    D->>DB: Create league document
    Note over DB: Store with indexes:<br/>(season, draftDate)
    DB-->>D: League created
    
    D->>DB: Create owner membership
    DB-->>D: Membership created
    
    D->>AL: Log creation event
    AL->>DB: Write to activity_log
    
    D-->>A: Return league + membership
    A-->>C: Success response
    C->>U: Redirect to /league/[id]
```

## 3. Data Interaction Table

| Collection | Operation | Attributes Set | Notes |
|------------|-----------|----------------|-------|
| leagues | WRITE | leagueName, draftType, pickTimeSeconds, scoringRules, draftDate, commissionerAuthUserId, isPublic, season, selectedConference (if mode=conference) | Primary league creation with scheduling |
| league_memberships | WRITE | leagueId, authUserId (commissioner), role='COMMISSIONER', status='ACTIVE', joinedAt | Auto-create owner membership |
| activity_log | WRITE | actorClientId/authUserId, action='league.create', objectType='league', objectId, payloadJson, ts | Audit trail for league creation |

## 4. Validation Rules (Zod Schema)

```typescript
const createLeagueSchema = z.object({
  leagueName: z.string().min(3).max(50),
  type: z.enum(['public', 'private']),
  maxTeams: z.number().min(4).max(24),
  scoringRules: z.string(),
  
  // Draft scheduling (required for real leagues)
  draftType: z.enum(['snake', 'auction']),
  draftDate: z.string().datetime(),
  draftRoomOpenOffsetMinutes: z.number().default(60),
  pickTimeSeconds: z.number().min(30).max(600),
  draftOrder: z.array(z.string()).optional(), // Generated if not provided
  
  // Optional fields
  password: z.string().optional(),
  selectedConference: z.enum(['SEC', 'ACC', 'Big 12', 'Big Ten']).optional()
})
```

## 5. Error States

- **Validation Errors**: Invalid form data, missing required fields
- **Authentication Errors**: User not logged in or session expired
- **Duplicate League Name**: League with same name already exists for user
- **Invalid Draft Time**: Draft scheduled in the past or conflicting with existing drafts
- **Database Errors**: Appwrite connection issues or write failures
- **Rate Limiting**: Too many leagues created in short timeframe

## 6. Server-Side Calculations

```typescript
// Calculate draft room open time (server-side in UTC)
const draftRoomOpenAt = new Date(
  new Date(draftDate).getTime() - 
  (draftRoomOpenOffsetMinutes * 60 * 1000)
).toISOString()

// Store timezone if available for display purposes
const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
```

## 7. Index Recommendations

- **(season, draftDate)** - For querying upcoming drafts by season
- **(commissionerAuthUserId, createdAt)** - For user's leagues list
- **(type, leagueStatus, draftDate)** - For public league discovery
- **(inviteCode)** - Unique index for invite links

Notes:
- Immutable after creation: gameMode and selectedConference

See also:
- docs/diagrams/project-map/overview/leagues.md