# Create League Flow

## Overview
League creation flow with configuration options and automatic commissioner assignment.

## Related Files
- `/app/api/leagues/create/route.ts` - League creation API
- `/app/(dashboard)/league/create/page.tsx` - Create league UI
- `/lib/db/leagues.ts` - League DAL
- `/lib/db/league_memberships.ts` - Membership DAL
- `/schema/zod/leagues.ts` - League validation schema

## User Flow
```mermaid
flowchart TB
  classDef user fill:#fef3c7,stroke:#f59e0b,stroke-width:2,color:#92400e
  classDef form fill:#e0e7ff,stroke:#6366f1,stroke-width:2,color:#312e81
  classDef api fill:#fce7f3,stroke:#ec4899,stroke-width:2,color:#831843
  classDef db fill:#d1fae5,stroke:#10b981,stroke-width:2,color:#064e3b
  classDef validate fill:#fee2e2,stroke:#ef4444,stroke-width:2,color:#7f1d1d
  
  Start([User clicks Create League]):::user
  Form[League Settings Form]:::form
  
  subgraph Settings
    Name[League Name]:::form
    Type[Game Mode: Power4/Conference]:::form
    Conf[Select Conference]:::form
    Draft[Draft Type: Snake/Auction]:::form
    Teams[Max Teams: 8-12]:::form
    Privacy[Public/Private]:::form
    Password[Optional Password]:::form
  end
  
  Validate[Validate Input]:::validate
  API[POST /api/leagues/create]:::api
  
  CreateLeague[Create League Record]:::db
  CreateMembership[Add Commissioner]:::db
  CreateTeam[Create Fantasy Team]:::db
  ActivityLog[Log Creation]:::db
  
  Success[League Dashboard]:::user
  Error[Show Error]:::validate
  
  Start --> Form
  Form --> Settings
  Settings --> Validate
  Validate -->|Valid| API
  Validate -->|Invalid| Error
  Error --> Form
  
  API --> CreateLeague
  CreateLeague --> CreateMembership
  CreateMembership --> CreateTeam
  CreateTeam --> ActivityLog
  ActivityLog --> Success
```

## Sequence Diagram
```mermaid
sequenceDiagram
  participant U as User
  participant UI as Create Form
  participant V as Validator
  participant API as API Route
  participant DAL as Data Layer
  participant DB as Appwrite
  
  U->>UI: Open create league
  UI->>U: Show form
  
  U->>UI: Fill settings
  Note over UI: Name, Mode, Conference,<br/>Draft type, Teams,<br/>Privacy, Password
  
  U->>UI: Submit form
  UI->>V: Validate with Zod
  
  alt Invalid Data
    V-->>UI: Validation errors
    UI-->>U: Show errors
  else Valid Data
    V-->>UI: Valid
    UI->>API: POST /api/leagues/create
  end
  
  API->>DAL: Create league
  DAL->>DB: INSERT leagues
  DB-->>DAL: League ID
  
  DAL->>DB: INSERT league_memberships
  Note over DB: Commissioner role
  
  DAL->>DB: INSERT fantasy_teams
  Note over DB: Commissioner team
  
  DAL->>DB: INSERT activity_log
  
  DAL-->>API: League created
  API-->>UI: Success + League ID
  UI-->>U: Redirect to league
```

## Data Interactions

| Collection | Operation | Attributes Set | Notes |
|------------|-----------|---------------|-------|
| `leagues` | CREATE | `name`, `game_mode`, `selected_conference`, `draft_type`, `max_teams`, `is_public`, `password`, `commissioner_id`, `status`, `created_at` | Main league record |
| `league_memberships` | CREATE | `league_id`, `client_id`, `role=commissioner`, `status=active`, `joined_at` | Add creator as commissioner |
| `fantasy_teams` | CREATE | `league_id`, `owner_client_id`, `name`, `created_at` | Create commissioner's team |
| `activity_log` | CREATE | `action=league_created`, `league_id`, `client_id`, `metadata` | Track creation event |
| `invites` | CREATE* | `league_id`, `invite_code`, `expires_at` | *If private league |

## Validation Rules

### Required Fields
- League name (3-50 characters)
- Game mode (power4 or conference)
- If conference mode: selected conference (SEC/ACC/Big12/BigTen)
- Draft type (snake or auction)
- Max teams (8-12)

### Business Rules
- User must be authenticated
- User can create max 5 leagues per season
- League name must be unique within season
- Private leagues require password (min 6 chars)
- Draft date must be future date
- Game mode and conference are immutable after creation

## Error States
- `400` - Invalid input data
- `401` - User not authenticated
- `409` - League name already exists
- `429` - Too many leagues created
- `500` - Database error
