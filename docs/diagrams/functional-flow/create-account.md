# Create Account Flow

## Overview
User account creation flow using Appwrite Auth with Google OAuth and email/password options.

## Related Files
- `/app/api/auth/callback/route.ts` - OAuth callback handler
- `/app/(auth)/login/page.tsx` - Login/signup UI
- `/lib/appwrite-server.ts` - Server-side Appwrite client
- `/lib/db/clients.ts` - Client DAL

## User Flow
```mermaid
flowchart TB
  classDef user fill:#fef3c7,stroke:#f59e0b,stroke-width:2,color:#92400e
  classDef auth fill:#dbeafe,stroke:#3b82f6,stroke-width:2,color:#1e3a8a
  classDef db fill:#d1fae5,stroke:#10b981,stroke-width:2,color:#064e3b
  classDef api fill:#fce7f3,stroke:#ec4899,stroke-width:2,color:#831843
  
  Start([User visits app]):::user
  Login[Login Page]:::user
  Choice{Auth Method}:::user
  
  GoogleAuth[Google OAuth]:::auth
  EmailAuth[Email/Password]:::auth
  AppwriteAuth[Appwrite Auth Service]:::auth
  
  Callback[OAuth Callback]:::api
  CreateSession[Create Session]:::auth
  
  CheckClient{Client Exists?}:::db
  CreateClient[Create Client Record]:::db
  UpdateClient[Update Client]:::db
  
  ActivityLog[Log Activity]:::db
  Dashboard[Redirect to Dashboard]:::user
  
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

## Sequence Diagram
```mermaid
sequenceDiagram
  participant U as User
  participant UI as Login Page
  participant Auth as Appwrite Auth
  participant API as API Route
  participant DAL as Data Layer
  participant DB as Database
  
  U->>UI: Visit /login
  UI->>U: Show auth options
  
  alt Google OAuth
    U->>UI: Click Google
    UI->>Auth: Initiate OAuth
    Auth->>U: Redirect to Google
    U->>Auth: Authorize
    Auth->>API: Callback with code
  else Email/Password
    U->>UI: Enter credentials
    UI->>Auth: Create account
    Auth->>API: Session created
  end
  
  API->>DAL: Get/Create client
  DAL->>DB: Query clients
  
  alt New User
    DB-->>DAL: Not found
    DAL->>DB: INSERT clients
    DAL->>DB: INSERT activity_log
  else Existing User
    DB-->>DAL: Client found
    DAL->>DB: UPDATE last_login
    DAL->>DB: INSERT activity_log
  end
  
  DAL-->>API: Client record
  API-->>U: Redirect to dashboard
```

## Data Interactions

| Collection | Operation | Attributes Set | Notes |
|------------|-----------|---------------|-------|
| `clients` | READ | `auth_user_id` | Check if client exists |
| `clients` | CREATE | `auth_user_id`, `display_name`, `email`, `avatar_url`, `created_at` | New user registration |
| `clients` | UPDATE | `last_login` | Existing user login |
| `activity_log` | CREATE | `action`, `client_id`, `metadata`, `created_at` | Track signup/login events |
| `leagues` | READ | - | Load user leagues after login |
| `league_memberships` | READ | `client_id` | Find user memberships |

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
