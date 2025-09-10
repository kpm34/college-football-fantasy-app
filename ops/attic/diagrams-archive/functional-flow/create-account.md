# Create Account Flow

## Overview
Client account creation flow using Appwrite Auth with Google OAuth and email/password options.

## Related Files
- `/app/(league)/login/oauth-success/page.tsx` - OAuth success handler
- `/app/(league)/login/page.tsx` - Login/signup UI
- `/lib/appwrite-server.ts` - Server-side Appwrite client
- Appwrite Users API (session handling)

## Client Flow
```mermaid
flowchart TB
  classDef client fill:#fef3c7,stroke:#f59e0b,stroke-width:2,color:#92400e
  classDef auth fill:#dbeafe,stroke:#3b82f6,stroke-width:2,color:#1e3a8a
  classDef db fill:#d1fae5,stroke:#10b981,stroke-width:2,color:#064e3b
  classDef api fill:#fce7f3,stroke:#ec4899,stroke-width:2,color:#831843
  
  Start([Client visits app]):::client
  Login[Login Page]:::client
  Choice{Auth Method}:::client
  
  GoogleAuth[Google OAuth]:::auth
  EmailAuth[Email/Password]:::auth
  AppwriteAuth[Appwrite Auth Service]:::auth
  
  Callback[OAuth Success Page]:::api
  CreateSession[Create Session - Appwrite]:::auth
  
  CheckClient{Client Exists?}:::db
  CreateClient[Create Client Record]:::db
  UpdateClient[Update Client]:::db
  
  ActivityLog[Log Activity]:::db
  Dashboard[Redirect to Dashboard]:::client
  
  Start --> Login
  Login --> Choice
  Choice -->|Google| GoogleAuth
  Choice -->|Email| EmailAuth
  
  GoogleAuth --> AppwriteAuth
  EmailAuth --> AppwriteAuth
  AppwriteAuth --> Callback
  Callback --> CreateSession
  
  CreateSession --> CheckClient
  CheckClient -->|No| CreateClient
  CheckClient -->|Yes| UpdateClient
  
  CreateClient --> ActivityLog
  UpdateClient --> ActivityLog
  ActivityLog --> Dashboard
```

See also:
- docs/diagrams/project-map/overview/auth.md

## Sequence Diagram
```mermaid
sequenceDiagram
  participant C as Client
  participant UI as Login Page
  participant Auth as Appwrite Auth
  participant API as API Route
  participant DAL as Data Layer
  participant DB as Database
  
  C->>UI: Visit /login
  UI->>C: Show auth options
  
  alt Google OAuth
    C->>UI: Click Google
    UI->>Auth: Initiate OAuth
    Auth->>C: Redirect to Google
    C->>Auth: Authorize
    Auth->>UI: Redirect to OAuth Success
  else Email/Password
    C->>UI: Enter credentials
    UI->>Auth: Create account
    Auth->>API: Session created
  end
  
  API->>DAL: Get/Create client
  DAL->>DB: Query clients
  
  alt New Client
    DB-->>DAL: Not found
    DAL->>DB: INSERT clients
    DAL->>DB: INSERT activity_log
  else Existing Client
    DB-->>DAL: Client found
    DAL->>DB: UPDATE lastLogin
    DAL->>DB: INSERT activity_log
  end
  
  DAL-->>API: Client record
  API-->>C: Redirect to dashboard
```

## Data Interactions

| Collection | Operation | Attributes Set | Notes |
|------------|-----------|----------------|-------|
| `clients` | READ | `authUserId` | Check if client exists |
| `clients` | CREATE | `authUserId`, `displayName`, `email`, `avatarUrl`, `createdAt` | New client registration |
| `clients` | UPDATE | `lastLogin` | Existing client login |
| `activity_log` | CREATE | `action`, `actorClientId`, `payloadJson`, `createdAt` | Track signup/login events |
| `leagues` | READ | - | Load client leagues after login |
| `league_memberships` | READ | `authUserId` | Find client memberships |

## Validation & Error States

### Zod Schemas
- `clientsSchema` - Validates client data structure
- Email validation in auth forms

### Error Handling
- OAuth failure → Show error, redirect to login
- Email already exists → Prompt to login instead
- Weak password → Show requirements
- Network error → Retry with backoff
- Session expired → Re-authenticate
