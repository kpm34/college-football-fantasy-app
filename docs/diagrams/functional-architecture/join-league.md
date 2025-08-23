# Join League Flow

## Overview
League joining flow with multiple entry points: browse, search, and invite links.

## Related Files
- `/app/api/leagues/join/route.ts` - Join league API
- `/app/api/leagues/search/route.ts` - Search leagues API
- `/app/(dashboard)/league/join/page.tsx` - Join league UI
- `/app/invite/[leagueId]/page.tsx` - Invite link handler
- `/lib/db/leagues.ts` - League DAL
- `/lib/db/league_memberships.ts` - Membership DAL

## User Flow
```mermaid
flowchart TB
  classDef user fill:#fef3c7,stroke:#f59e0b,stroke-width:2,color:#92400e
  classDef search fill:#e0e7ff,stroke:#6366f1,stroke-width:2,color:#312e81
  classDef validate fill:#fee2e2,stroke:#ef4444,stroke-width:2,color:#7f1d1d
  classDef api fill:#fce7f3,stroke:#ec4899,stroke-width:2,color:#831843
  classDef db fill:#d1fae5,stroke:#10b981,stroke-width:2,color:#064e3b
  
  Start([User wants to join]):::user
  
  subgraph Entry Points
    Browse[Browse Public]:::search
    Search[Search by Name]:::search
    Invite[Invite Link]:::search
  end
  
  LeagueList[League List]:::search
  SelectLeague[Select League]:::user
  
  CheckAuth{Authenticated?}:::validate
  Login[Redirect to Login]:::user
  
  CheckPrivate{Private League?}:::validate
  PasswordModal[Enter Password]:::user
  
  CheckCapacity{Has Space?}:::validate
  ShowFull[League Full Error]:::validate
  
  CheckMember{Already Member?}:::validate
  ShowMember[Already Joined]:::validate
  
  JoinAPI[POST /api/leagues/join]:::api
  
  CreateMembership[Create Membership]:::db
  CreateTeam[Create Fantasy Team]:::db
  UpdateCount[Update League Count]:::db
  LogActivity[Log Join Event]:::db
  
  Success[League Dashboard]:::user
  
  Start --> Entry Points
  Browse --> LeagueList
  Search --> LeagueList
  Invite --> CheckAuth
  
  LeagueList --> SelectLeague
  SelectLeague --> CheckAuth
  
  CheckAuth -->|No| Login
  CheckAuth -->|Yes| CheckPrivate
  Login --> CheckPrivate
  
  CheckPrivate -->|Yes| PasswordModal
  CheckPrivate -->|No| CheckCapacity
  PasswordModal --> CheckCapacity
  
  CheckCapacity -->|Full| ShowFull
  CheckCapacity -->|Space| CheckMember
  
  CheckMember -->|Yes| ShowMember
  CheckMember -->|No| JoinAPI
  
  JoinAPI --> CreateMembership
  CreateMembership --> CreateTeam
  CreateTeam --> UpdateCount
  UpdateCount --> LogActivity
  LogActivity --> Success
```

## Sequence Diagram
```mermaid
sequenceDiagram
  participant U as User
  participant UI as Join UI
  participant API as API Routes
  participant Auth as Auth Service
  participant DAL as Data Layer
  participant DB as Database
  
  alt Browse/Search
    U->>UI: Browse leagues
    UI->>API: GET /api/leagues/search
    API->>DAL: Query public leagues
    DAL->>DB: SELECT leagues
    DB-->>UI: League list
    U->>UI: Select league
  else Invite Link
    U->>UI: Click invite link
    UI->>API: GET /api/leagues/invite
    API->>DAL: Validate invite
    DAL->>DB: SELECT leagues, invites
    DB-->>UI: League details
  end
  
  UI->>Auth: Check authentication
  
  alt Not Authenticated
    Auth-->>UI: Not logged in
    UI-->>U: Redirect to login
    U->>UI: Login and return
  end
  
  alt Private League
    UI-->>U: Request password
    U->>UI: Enter password
  end
  
  UI->>API: POST /api/leagues/join
  API->>DAL: Validate join request
  
  DAL->>DB: Check capacity
  DAL->>DB: Check membership
  
  alt Can Join
    DAL->>DB: INSERT league_memberships
    DAL->>DB: INSERT fantasy_teams
    DAL->>DB: UPDATE leagues.current_teams
    DAL->>DB: INSERT activity_log
    DAL-->>API: Success
    API-->>UI: Joined
    UI-->>U: Redirect to league
  else Cannot Join
    DAL-->>API: Error reason
    API-->>UI: Error message
    UI-->>U: Show error
  end
```

## Data Interactions

| Collection | Operation | Attributes | Notes |
|------------|-----------|------------|-------|
| `leagues` | READ | `$id`, `name`, `is_public`, `current_teams`, `max_teams` | Find joinable leagues |
| `leagues` | UPDATE | `current_teams` | Increment member count |
| `invites` | READ | `invite_code`, `league_id`, `expires_at` | Validate invite links |
| `invites` | UPDATE | `uses`, `accepted_at` | Track invite usage |
| `league_memberships` | READ | `league_id`, `client_id` | Check existing membership |
| `league_memberships` | CREATE | `league_id`, `client_id`, `role=member`, `status=active` | Add new member |
| `fantasy_teams` | CREATE | `league_id`, `owner_client_id`, `name` | Create user's team |
| `activity_log` | CREATE | `action=league_joined`, `league_id`, `client_id` | Track join event |

## Validation Rules

### Join Requirements
- User must be authenticated
- League must have space (current_teams < max_teams)
- User cannot already be a member
- Private leagues require valid password or invite
- League must be in "open" or "drafting" status
- Invite must not be expired

## Error States
- `401` - User not authenticated
- `403` - Wrong password / Invalid invite
- `404` - League not found
- `409` - Already a member / League full
- `410` - League closed / Draft completed
