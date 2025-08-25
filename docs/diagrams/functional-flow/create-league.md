# Create League Flow (with Draft Scheduling)

## Overview
Complete flow for creating a new fantasy football league, including draft scheduling and configuration.

## Auth Route Handlers Detected
- `/api/leagues/create` - Main league creation endpoint
- `/api/auth/session` - Session validation
- `/api/leagues/validate` - League settings validation

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
        SetSchedule --> DS1[draft_type: snake/auction]
        SetSchedule --> DS2[draft_start_at: ISO datetime]
        SetSchedule --> DS3[draft_room_open_offset_minutes: 60]
        SetSchedule --> DS4[pick_time_seconds: per-pick clock]
        SetSchedule --> DS5[draft_order_json: team order array]
        SetSchedule --> DS6[scoring_rules: JSON string]
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
    Note over V: Check required fields<br/>Validate draft_start_at<br/>Validate scoring_rules JSON
    V-->>A: Data valid
    
    A->>A: Normalize fields
    Note over A: Map UI fields to DB schema<br/>Calculate draft_room_open_at<br/>UTC conversion
    
    A->>D: createLeague(data)
    D->>DB: Create league document
    Note over DB: Store with indexes:<br/>(season, draft_start_at)
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
| leagues | WRITE | name, draftType, pickTimeSeconds, scoringRules, draftDate, commissioner_auth_user_id, isPublic, season, selectedConference (if mode=conference) | Primary league creation with scheduling |
| league_memberships | WRITE | league_id, auth_user_id (commissioner), role='COMMISSIONER', status='ACTIVE', joined_at | Auto-create owner membership |
| activity_log | WRITE | actor_client_id/auth_user_id, action='league.create', object_type='league', object_id, payload_json, ts | Audit trail for league creation |

## 4. Validation Rules (Zod Schema)

```typescript
const createLeagueSchema = z.object({
  name: z.string().min(3).max(50),
  type: z.enum(['public', 'private']),
  max_teams: z.number().min(4).max(20),
  scoring_settings: z.string(),
  
  // Draft scheduling (required for real leagues)
  draft_type: z.enum(['snake', 'auction']),
  draft_start_at: z.string().datetime(),
  draft_room_open_offset_minutes: z.number().default(60),
  pick_time_seconds: z.number().min(30).max(180),
  draft_order_json: z.array(z.string()).optional(), // Generated if not provided
  scoring_rules: z.string(), // JSON string with scoring configuration
  
  // Optional fields
  password: z.string().optional(),
  conference: z.enum(['SEC', 'ACC', 'Big 12', 'Big Ten']).optional()
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
const draft_room_open_at = new Date(
  new Date(draft_start_at).getTime() - 
  (draft_room_open_offset_minutes * 60 * 1000)
).toISOString()

// Store timezone if available for display purposes
const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
```

## 7. Index Recommendations

- **(season, draft_start_at)** - For querying upcoming drafts by season
- **(commissioner_id, created_at)** - For user's leagues list
- **(type, status, draft_start_at)** - For public league discovery
- **(invite_code)** - Unique index for invite links